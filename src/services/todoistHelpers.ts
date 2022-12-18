import {
  Label,
  Project,
  Task,
  TodoistApi,
} from "@doist/todoist-api-typescript";

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

export async function retrieveTasks() {
  const api = new TodoistApi(logseq.settings!.apiToken);

  const allTasks: Task[] = await api.getTasks();

  let parentTasks = allTasks
    .filter((task) => !task.parentId)
    .map((task) => ({
      todoistId: task.id,
      content: task.content,
      subTasks: [],
    }));

  // TODO Need to create custom type for parentTasks
  function recursion(parentTasks: any[], allTasks: Task[]) {
    for (const t of allTasks) {
      for (const u of parentTasks) {
        if (t.parentId === u.todoistId) {
          u.subTasks.push({
            todoistId: t.id,
            content: t.content,
            subTasks: [],
          });
          recursion(u.subTasks, allTasks);
        }
      }
    }
  }

  recursion(parentTasks, allTasks);

  return allTasks;
}
