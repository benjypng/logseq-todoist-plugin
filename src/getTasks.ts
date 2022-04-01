import axios from "axios";
import { Task, Id } from "../idTask";
import { getDayInText } from "logseq-dateutils";

// Get project name to indicate in Todoist
const getProjectName = async (projectId: string) => {
  const project = await axios.get(
    `https://api.todoist.com/rest/v1/projects/${projectId}`,
    {
      headers: {
        Authorization: `Bearer ${logseq.settings?.apiToken}`,
      },
    }
  );
  return project.data.name;
};

export const getTasks = async (projectId: string) => {
  const response = await axios({
    method: "get",
    url: "https://api.todoist.com/rest/v1/tasks",
    params: {
      project_id: projectId,
    },
    headers: {
      Authorization: `Bearer ${logseq.settings?.apiToken}`,
    },
  });

  if (response.data.length === 0) {
    return { tasksArr: [], tasksIdArr: [] };
  } else {
    // Create array of main tasks
    let tasksArr = response.data
      .filter((t: Task) => {
        return !t.parent_id;
      })
      .map((t: Task) => ({
        todoist_id: t.id,
        content: `TODO ${t.content}
${
  t.due
    ? "SCHEDULED: <" +
      t.due.date +
      " " +
      getDayInText(new Date(t.due.date)) +
      " " +
      (t.due.datetime ? t.due.date.slice(-5) : "") +
      ">"
    : ""
}
${t.description ? "description:: " + t.description : ""}`,
        children: [],
      }));

    // Create array of sub tasks
    const subTasks = response.data
      .filter((t: Task) => {
        return t.parent_id;
      })
      .map((t: Task) => ({
        todoist_id: t.id,
        content: t.content,
        parent_id: t.parent_id,
        description: t.description,
      }));

    // Subsume sub tasks under main tasks
    for (let m of tasksArr) {
      for (let s of subTasks) {
        if (s.parent_id === m.todoist_id) {
          m.children.push({
            content: `TODO ${s.content}
${
  s.due
    ? "SCHEDULED: <" +
      s.due.date +
      " " +
      getDayInText(new Date(s.due.date)) +
      " " +
      (s.due.datetime ? s.due.date.slice(-5) : "") +
      ">"
    : ""
}
${s.description ? "description:: " + s.description : ""}`,
          });
        }
        continue;
      }
    }
    // Add project name as a parent block
    tasksArr = [
      {
        content: `[[${await getProjectName(projectId)}]]`,
        children: [...tasksArr],
      },
    ];

    // Map id from tasks without Prefix to mark as complete in Todoist
    let tasksIdArr = response.data.map((i: Id) => i.id);

    return {
      tasksArr: tasksArr,
      tasksIdArr: tasksIdArr,
    };
  }
};
