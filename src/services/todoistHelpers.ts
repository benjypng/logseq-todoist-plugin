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

async function retrieveTasksHelper(flag: string) {
  const api = new TodoistApi(logseq.settings!.apiToken);
  let allTasks: Task[] = [];

  if (flag === "today") {
    allTasks = await api.getTasks({ filter: flag });
  } else {
    allTasks = await api.getTasks({ projectId: flag });
  }

  let parentTasks = allTasks
    .filter((task) => !task.parentId)
    .map((task) => {
      return {
        content: handleContentWithUrlAndTodo(task.content, task),
        children: [],
        todoistId: task.id,
      };
    });

  function recursion(
    parentTasks: { content: string; children: any[]; todoistId: string }[],
    allTasks: Task[]
  ) {
    for (const t of allTasks) {
      for (const u of parentTasks) {
        if (t.parentId === u.todoistId) {
          u.children.push({
            content: handleContentWithUrlAndTodo(t.content, t),
            children: [],
            todoistId: t.id,
          });
          recursion(u.children, allTasks);
        }
      }
    }
  }

  recursion(parentTasks, allTasks);

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
