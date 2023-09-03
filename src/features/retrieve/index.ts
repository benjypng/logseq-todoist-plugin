import { getIdFromString, getNameFromString } from "../helpers";
import {
  Comment,
  DueDate,
  Task,
  TodoistApi,
} from "@doist/todoist-api-typescript";
import { BlockToInsert } from "./types";
import {
  getScheduledDeadlineDateDay,
  getYYMMDDTHHMMFormat,
} from "logseq-dateutils";
import { PluginSettings } from "~/settings/types";

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

const handleAppendTodoAndAppendUrlAndDeadline = (
  content: string,
  url: string,
  due: DueDate,
  createdAt: string,
) => {
  const {
    retrieveAppendUrl,
    retrieveAppendTodo,
    retrieveAppendCreationDateTime,
  } = logseq.settings! as Partial<PluginSettings>;
  let treatedContent = content;
  if (retrieveAppendUrl) {
    treatedContent = `[${treatedContent}](${url})`;
  }
  if (retrieveAppendTodo) {
    treatedContent = `TODO ${treatedContent}`;
  }
  if (due?.date) {
    treatedContent = `${treatedContent}
DEADLINE: <${getScheduledDeadlineDateDay(new Date(due.date))}>`;
  }
  if (retrieveAppendCreationDateTime) {
    const isoDate = getYYMMDDTHHMMFormat(new Date(createdAt));
    const [datePart, timePart] = isoDate.split("T");
    treatedContent = `@${datePart} **${timePart}** ${treatedContent}`;
  }
  return treatedContent;
};

const createTasksArr = async (task: Task, parentTasks: BlockToInsert[]) => {
  let obj: BlockToInsert = {
    children: [] as BlockToInsert[],
    content: handleAppendTodoAndAppendUrlAndDeadline(
      task.content,
      task.url,
      task.due!,
      task.createdAt,
    ),
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

const insertTasks = async (tasksArr: Task[]): Promise<BlockToInsert[]> => {
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
  const batchBlock = await insertTasks(allTasks);
  await logseq.Editor.insertBatchBlock(uuid, batchBlock);
  logseq.UI.closeMsg(msgKey);
  // Delete tasks if setting is enabled
  if (retrieveClearTasks) await deleteAllTasks(allTasks);
};
