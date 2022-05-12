import axios from "axios";
import { Task, Id } from "../idTask";
import { getScheduledDeadlineDateDay } from "logseq-dateutils";

const getYYYYMMDD = (d: Date) => {
  return [
    d.getFullYear(),
    ("0" + (d.getMonth() + 1)).slice(-2),
    ("0" + d.getDate()).slice(-2),
  ].join("-");
};

// Get all projects
export const getAllProjects = async () => {
  const response = await axios.get(`https://api.todoist.com/rest/v1/projects`, {
    headers: {
      Authorization: `Bearer ${logseq.settings!.apiToken}`,
    },
  });

  return response.data.map(
    (i: { name: string; id: string }) => `${i.name} (${i.id})`
  );
};

// Get all labels
export const getAllLabels = async () => {
  const response = await axios.get(`https://api.todoist.com/rest/v1/labels`, {
    headers: {
      Authorization: `Bearer ${logseq.settings!.apiToken}`,
    },
  });

  return response.data.map(
    (i: { name: string; id: string }) => `${i.name} (${i.id})`
  );
};

// Mark tasks as complete in Todoist
export const clearTasks = async (tasksIdArr: number[]) => {
  for (let i of tasksIdArr) {
    console.log(`Clearing ${i}`);
    await axios({
      url: `https://api.todoist.com/rest/v1/tasks/${i}/close`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${logseq.settings?.apiToken}`,
      },
    });
  }
};

// Get project name from Project ID
export const getProjectName = async (projectId: string) => {
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

export const getIdFromProjectAndLabel = (content: string) => {
  const rxId = new RegExp(`(?<=\\()(\\S.*?)(?=\\))`, `g`);
  const id = content.match(rxId);
  if (id) {
    return id[0];
  } else {
    logseq.App.showMsg(
      "Error getting project IDs. Please report an issue on Github."
    );
    return;
  }
};

export const pullTasks = async (projectId: string, todayOrNot?: string) => {
  const response = await axios({
    method: "get",
    url: "https://api.todoist.com/rest/v1/tasks",
    params: {
      project_id: projectId,
      filter: todayOrNot === "today" ? getYYYYMMDD(new Date()) : "",
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
    ? `SCHEDULED: <${getScheduledDeadlineDateDay(new Date(t.due.date))}${
        t.due.datetime ? ` ${t.due.string.slice(-5)}` : ""
      }>`
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

    // CAN THINK ABOUT RECURSION
    // Subsume sub tasks under main tasks
    for (let m of tasksArr) {
      for (let s of subTasks) {
        if (s.parent_id === m.todoist_id) {
          m.children.push({
            content: `TODO ${s.content}
${
  s.due
    ? `SCHEDULED: <${getScheduledDeadlineDateDay(new Date(s.due.date))}${
        s.due.datetime ? ` ${s.due.string.slice(-5)}` : ""
      }>`
    : ""
}
${s.description ? "description:: " + s.description : ""}`,
          });
        }
        continue;
      }
    }

    // Add project name as a parent block
    if (logseq.settings!.addParentBlock) {
      tasksArr = [
        {
          content: `[[${await getProjectName(projectId)}]]`,
          children: [...tasksArr],
        },
      ];
    }

    // Map id from tasks without Prefix to mark as complete in Todoist
    let tasksIdArr = response.data.map((i: Id) => i.id);

    return {
      tasksArr: tasksArr,
      tasksIdArr: tasksIdArr,
    };
  }
};
