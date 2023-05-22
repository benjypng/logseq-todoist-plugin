import {
  Label,
  Project,
  Task,
  TodoistApi,
} from "@doist/todoist-api-typescript";
import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";
import {
  getIdFromString,
  getNameFromString,
  handleContentWithUrlAndTodo,
} from "../utils/parseStrings";

export async function getAllProjects() {
  try {
    const api = new TodoistApi(logseq.settings!.apiToken);
    const allProjects: Project[] = await api.getProjects();
    let projArr = allProjects.map(
      (project) => `${project.name} (${project.id})`
    );
    projArr.unshift("--- ---");
    return projArr;
  } catch (e) {
    console.log(e);
    return ["--- ---"];
  }
}

export async function getAllLabels() {
  try {
    const api = new TodoistApi(logseq.settings!.apiToken);
    const allLabels: Label[] = await api.getLabels();
    let labelArr = allLabels.map((label) => `${label.name} (${label.id})`);
    labelArr.unshift("--- ---");
    return labelArr;
  } catch (e) {
    console.log(e);
    return ["--- ---"];
  }
}

function removeTaskFlags(content: string) {
  const taskFlags = ["TODO", "DOING", "NOW", "LATER", "DONE"];

  for (const flag of taskFlags) {
    if (content.includes(flag)) {
      content = content.replace(`${flag} `, "");
    }
  }

  return content;
}

export async function sendTaskToTodoist(
  uuid: string,
  content: string,
  projectId: string,
  label: string,
  deadline: string
) {
  const api = new TodoistApi(logseq.settings!.apiToken);

  const graphName = (await logseq.App.getCurrentGraph())!.name;
  if (logseq.settings!.sendAppendUri && !logseq.settings!.enableTodoistSync) {
    content = `[${content}](logseq://graph/${graphName}?block-id=${uuid})`;
  }

  try {
    await api.addTask({
      content: removeTaskFlags(content),
      dueString: deadline,
      labels: [label],
      // Below is to handle empty projectIds since Todoist does not accept a blank string if no projectId exists
      ...(projectId && { projectId: projectId }),
    });

    logseq.UI.showMsg("Task sent!", "success");
  } catch (e) {
    logseq.UI.showMsg(
      `Task not sent! Reason: ${(e as Error).message}`,
      "error"
    );
  }
}

async function handleComments(
  taskId: string,
  obj: {
    content: string;
    children: any[];
    properties: { attachment: string; comments: string; todoistid: string };
  }
) {
  const api = new TodoistApi(logseq.settings!.apiToken);

  const comments = await api.getComments({ taskId: taskId });

  if (comments.length > 0) {
    for (const comment of comments) {
      if (comment.attachment) {
        obj[
          "properties"
        ].attachment = `[${comment.attachment.fileName}](${comment.attachment.fileUrl})`;
      }
      if (comment.content) {
        let content = obj["properties"].comments;
        obj["properties"].comments = (
          content +
          ", " +
          comment.content
        ).substring(1);
      }
    }
  }
  return obj;
}

async function retrieveTasksHelper(flag: string) {
  const api = new TodoistApi(logseq.settings!.apiToken);
  let allTasks: Task[] = [];

  if (flag === "today") {
    allTasks = await api.getTasks({ filter: flag });
  } else {
    allTasks = await api.getTasks({ projectId: flag });
  }

  let parentTasks: any[] = [];

  for (const task of allTasks) {
    if (!task.parentId) {
      let obj = {
        content: handleContentWithUrlAndTodo(task.content, task),
        children: [],
        properties: {
          todoistid: task.id,
          attachment: "",
          comments: "",
        },
      };

      const finalObj = await handleComments(task.id, obj);

      parentTasks.push(finalObj);
    }
  }

  await recursion(parentTasks, allTasks);

  async function recursion(
    parentTasks: {
      content: string;
      children: any[];
      properties: { todoistid: string; attachments: any; comments: any };
    }[],
    allTasks: Task[]
  ) {
    for (const t of allTasks) {
      for (const u of parentTasks) {
        if (t.parentId == u.properties.todoistid) {
          let obj = {
            content: handleContentWithUrlAndTodo(t.content, t),
            children: [],
            properties: {
              todoistid: t.id,
              attachment: "",
              comments: "",
            },
          };

          const finalObj = await handleComments(t.id, obj);

          u.children.push(finalObj);

          await recursion(u.children, allTasks);
        }
      }
    }
  }

  if (logseq.settings!.retrieveClearTasks) {
    allTasks.map(async (task) => await api.closeTask(task.id));
  }

  return parentTasks;
}

export async function retrieveTasks(event: { uuid: string }, flag: string) {
  const { retrieveDefaultProject, projectNameAsParentBlk } = logseq.settings!;

  if (retrieveDefaultProject === "--- ---" || !retrieveDefaultProject) {
    logseq.UI.showMsg(
      "Please select a default project in the plugin settings!",
      "error"
    );
    return;
  }

  const tasksArr = await retrieveTasksHelper(flag);

  projectNameAsParentBlk
    ? await logseq.Editor.updateBlock(
        event.uuid,
        `[[${getNameFromString(retrieveDefaultProject)}]]`
      )
    : "";

  if (logseq.settings!.enableTodoistSync) {
    syncTask(event);
  } else {
    await logseq.Editor.insertBatchBlock(event.uuid, tasksArr, {
      sibling: !projectNameAsParentBlk,
      before: false,
    });
  }
}

export async function syncTask(event: { uuid: string }) {
  const api = new TodoistApi(logseq.settings!.apiToken);

  // get parent block
  let blk = await logseq.Editor.getBlock(event.uuid, {
    includeChildren: true,
  });

  // if parent blocks has child blocks, remove them
  if (blk!.children!.length > 0) {
    for (const block of blk!.children!) {
      if (!(block as BlockEntity).properties!.todoistid) {
        const { sendDefaultProject, sendDefaultLabel, sendDefaultDeadline } =
          logseq.settings!;

        // Insert send task
        await sendTaskToTodoist(
          (block as BlockEntity).uuid,
          (block as BlockEntity).content,
          getIdFromString(sendDefaultProject),
          getNameFromString(sendDefaultLabel),
          sendDefaultDeadline ? "today" : ""
        );

        await logseq.Editor.removeBlock((block as BlockEntity).uuid);
      } else {
        await logseq.Editor.removeBlock((block as BlockEntity).uuid);
      }
    }
  }

  const tasksArr = await retrieveTasksHelper(
    getIdFromString(logseq.settings!.retrieveDefaultProject)
  );

  // insert blocks retrieved
  await logseq.Editor.insertBatchBlock(event.uuid, tasksArr, {
    sibling: false,
    before: false,
  });

  //re-obtain child blocks to attach onBlockChanged
  blk = await logseq.Editor.getBlock(event.uuid, {
    includeChildren: true,
  });

  for (const block of blk!.children!) {
    logseq.DB.onBlockChanged((block as BlockEntity).uuid, async function (e) {
      if (e.marker === "DONE") {
        await api.closeTask(e.properties!.todoistid.toString());
      } else if (e.marker === "TODO") {
        await api.reopenTask(e.properties!.todoistid.toString());
      }
    });
  }

  logseq.UI.showMsg("Sync complete", "success");
}
