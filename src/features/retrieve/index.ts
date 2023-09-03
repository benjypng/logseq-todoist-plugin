import { getIdFromString, getNameFromString } from "../../utils/parseStrings";
import { Comment, Task, TodoistApi } from "@doist/todoist-api-typescript";
import { BlockToInsert } from "./types";

const handleComments = async (taskId: string, obj: BlockToInsert) => {
  const api = new TodoistApi(logseq.settings!.apiToken);
  try {
    const comments: Comment[] = await api.getComments({ taskId: taskId });
    if (comments.length > 0) {
      for (const c of comments) {
        if (c.attachment) {
          obj.properties.attachments = `[${c.attachment.fileName}](${c.attachment.fileUrl})`;
        }
        if (c.content) {
          const content = obj.properties.comments;
          obj.properties.comments = (content + ", " + c.content).substring(1);
        }
      }
    }
    return obj;
  } catch (e) {
    console.error(e);
    await logseq.UI.showMsg(
      `Unable to retrieve comments: ${(e as Error).message}`,
      "error",
    );
  }
};

const handleAppendTodoAndAppendUrl = (content: string, url: string) => {
  let treatedContent = content;
  if (logseq.settings!.retrieveAppendUrl) {
    treatedContent = `[${treatedContent}](${url})`;
  }
  if (logseq.settings!.retrieveAppendTodo) {
    treatedContent = `TODO ${treatedContent}`;
  }
  return treatedContent;
};

const createTasksArr = async (task: Task, parentTasks: BlockToInsert[]) => {
  let obj: BlockToInsert = {
    children: [] as BlockToInsert[],
    content: handleAppendTodoAndAppendUrl(task.content, task.url),
    properties: { attachments: "", comments: "", todoistid: task.id },
  };
  if (task.description.length > 0) {
    obj.content += `: ${task.description}`;
  }
  obj = (await handleComments(task.id, obj)) as BlockToInsert;
  parentTasks.push(obj);
};

const recursion = async (parentTasks: BlockToInsert[], tasksArr: Task[]) => {
  // 2. Populate tree with branches.
  for (const t of tasksArr) {
    for (const p of parentTasks) {
      if (t.parentId === p.properties.todoistid) {
        await createTasksArr(t, p.children);
        await recursion(p.children, tasksArr);
      }
    }
  }
};

const insertTasks = async (
  uuid: string,
  tasksArr: Task[],
): Promise<BlockToInsert[]> => {
  // 1. Create tree.
  const parentTasks: BlockToInsert[] = [];
  for (const task of tasksArr) {
    if (!task.parentId) {
      await createTasksArr(task, parentTasks);
    }
  }
  await recursion(parentTasks, tasksArr);
  return parentTasks;
};

const deleteAllTasks = async (tasksArr: Task[]) => {
  const api = new TodoistApi(logseq.settings!.apiToken);
  try {
    for (const t of tasksArr) {
      await api.deleteTask(t.id);
    }
  } catch (e) {
    await logseq.UI.showMsg(`Error deleting tasks: ${(e as Error).message}`);
    return;
  }
};

export const retrieveTasks = async (uuid: string, taskParams?: string) => {
  const msgKey = await logseq.UI.showMsg("Loading tasks...");
  const {
    apiToken,
    retrieveClearTasks,
    retrieveDefaultProject,
    projectNameAsParentBlk,
  } = logseq.settings!;
  const api = new TodoistApi(apiToken);
  if (retrieveDefaultProject === "--- ---") {
    await logseq.UI.showMsg("Please select a default project", "error");
    return;
  }
  // Insert parent block if projectNameAsParentBlk is true
  if (projectNameAsParentBlk) {
    await logseq.Editor.updateBlock(
      uuid,
      `[[${getNameFromString(retrieveDefaultProject)}]]`,
    );
  } else {
    await logseq.Editor.updateBlock(uuid, "");
  }
  // Insert blocks
  let allTasks: Task[];
  // Retrieve tasks based on optional filter parameters
  if (!taskParams) {
    allTasks = await api.getTasks({
      projectId: getIdFromString(retrieveDefaultProject),
    });
  } else if (taskParams === "today") {
    allTasks = await api.getTasks({ filter: "today" });
  } else {
    allTasks = await api.getTasks({ filter: taskParams });
  }
  // Handle no tasks retrieved
  if (allTasks.length === 0) {
    await logseq.UI.showMsg("There are no tasks");
    return;
  }
  const batchBlock = await insertTasks(uuid, allTasks);
  await logseq.Editor.insertBatchBlock(uuid, batchBlock);
  logseq.UI.closeMsg(msgKey);
  // Delete tasks if setting is enabled
  if (retrieveClearTasks) await deleteAllTasks(allTasks);
};
