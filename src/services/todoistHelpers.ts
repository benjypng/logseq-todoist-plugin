import {
  Label,
  Project,
  Task,
  TodoistApi,
} from "@doist/todoist-api-typescript";
import {
  getNameFromString,
  handleContentWithUrlAndTodo,
} from "../utils/parseStrings";

export async function getAllProjects() {
  const api = new TodoistApi(logseq.settings!.apiToken);

  const allProjects: Project[] = await api.getProjects();

  let projArr = allProjects.map((project) => `${project.name} (${project.id})`);
  projArr.unshift("--- ---");

  return projArr;
}

export async function getAllLabels() {
  const api = new TodoistApi(logseq.settings!.apiToken);

  const allLabels: Label[] = await api.getLabels();

  let labelArr = allLabels.map((label) => `${label.name} (${label.id})`);
  labelArr.unshift("--- ---");

  return labelArr;
}

export async function sendTaskToLogseq(
  uuid: string,
  content: string,
  projectId: string,
  label: string,
  deadline: string
) {
  const api = new TodoistApi(logseq.settings!.apiToken);

  const graphName = (await logseq.App.getCurrentGraph())!.name;
  if (logseq.settings!.sendAppendUri) {
    content = `[${content}](logseq://graph/${graphName}?block-id=${uuid})`;
  }

  try {
    await api.addTask({
      content: content,
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
    todoistId: string;
    properties: { attachment: string; comments: string };
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
        todoistId: task.id,
        properties: {
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
            todoistId: t.id,
            properties: {
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

  await logseq.Editor.insertBatchBlock(event.uuid, tasksArr, {
    sibling: !projectNameAsParentBlk,
    before: false,
  });
}
