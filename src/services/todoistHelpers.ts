import {
  AddTaskArgs,
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

export interface TaskInfo {
  uuid: string,
  content: string,
}

//i.e SCHEDULED(DEADLINE): <2023-01-26 Thu 15:40 ++2w> 
//-> {dueDatetime: '2023-01-26 15:40', dueString: 'every 2 week'}
// if there are both SCHEDULED and DEADLINE, select the first line
const createDue = (dueLines: string[], defaultDeadline: boolean) => {
  let dueString = defaultDeadline ? "today" : ""
  if (!dueLines) {
    return {
      dueDatetime: '',
      dueString
    }
  } else {
    const str = dueLines[0]
    let dateMatch = str.match(/<(\d{4}-\d{2}-\d{2})/);
    let date = dateMatch ? dateMatch[1] : "";
    let timeMatch = str.match(/(\d{2}:\d{2})/);
    let time = timeMatch ? timeMatch[1] : "";
    let repeatMatch = str.match(/(\+\+\d+[h|d|w|m|y])/);
    let repeat = repeatMatch ? repeatMatch[1] : "";
    let repeatNum = repeat ? repeat.slice(2, -1) : "";
    let repeatUnit = "";
    if (repeat) {
      if (repeat.endsWith("h")) {
        repeatUnit = "hour";
      } else if (repeat.endsWith("d")) {
        repeatUnit = "day"
      } else if (repeat.endsWith("w")) {
        repeatUnit = "week";
      } else if (repeat.endsWith("m")) {
        repeatUnit = "month";
      } else if (repeat.endsWith("y")) {
        repeatUnit = "year";
      }
    }
    return {
      dueDatetime: `${date} ${time}`.trim(),
      dueString: repeatNum ? `every ${repeatNum} ${repeatUnit}` : ''
    }
  }
}

export async function sendTaskToTodoist(taskInfo: TaskInfo) {
  const { uuid, content } = taskInfo
  const { sendDefaultProject, sendDefaultLabel, sendDefaultDeadline } = logseq.settings!;

  const transformTaskInfo = async () => {
    const lines = content.split("\n").map(str => str.trim())

    let [dueLines, titleLines] = lines.reduce((arrays, line) => {
      if (line.startsWith("SCHEDULED") || line.startsWith("DEADLINE")) {
        arrays[0].push(line);
      } else {
        arrays[1].push(line);
      }
      return arrays;
    }, [[] as string[], [] as string[]]);
    const { dueDatetime, dueString } = createDue(dueLines, sendDefaultDeadline);

    let transformedContent = titleLines.join('\n')
    const graphName = (await logseq.App.getCurrentGraph())!.name;
    if (logseq.settings!.sendAppendUri && !logseq.settings!.enableTodoistSync) {
      transformedContent = `[${content}](logseq://graph/${graphName}?block-id=${uuid})`;
    }
    return {
      content: removeTaskFlags(transformedContent),
      dueDatetime,
      dueString,
    }
  }

  const processedTaskInfo = await transformTaskInfo()
  const api = new TodoistApi(logseq.settings!.apiToken);
  const addArgs: AddTaskArgs = { ...processedTaskInfo, labels: [sendDefaultLabel]}
  if (sendDefaultProject !== '--- ---'){
    addArgs.projectId = getIdFromString(sendDefaultProject)
  }

  try {
    await api.addTask(addArgs);
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

  async function recursion(
    parentTasks: { content: string; children: any[]; todoistId: string }[],
    allTasks: Task[]
  ) {
    for (const t of allTasks) {
      for (const u of parentTasks) {
        if (t.parentId === u.todoistId) {
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

          recursion(u.children, allTasks);
        }
      }
    }
  }

  await recursion(parentTasks, allTasks);

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
        await sendTaskToTodoist({
          uuid: (block as BlockEntity).uuid,
          content: (block as BlockEntity).content,
        });

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
    logseq.DB.onBlockChanged((block as BlockEntity).uuid, async function(e) {
      if (e.marker === "DONE") {
        await api.closeTask(e.properties!.todoistid.toString());
      } else if (e.marker === "TODO") {
        await api.reopenTask(e.properties!.todoistid.toString());
      }
    });
  }

  logseq.UI.showMsg("Sync complete", "success");
}
