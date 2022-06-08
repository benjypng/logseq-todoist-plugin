import axios from "axios";
import { Task, Id } from "../idTask";
import { getScheduledDeadlineDateDay } from "logseq-dateutils";

function getYYYYMMDD(d: Date) {
  return [
    d.getFullYear(),
    ("0" + (d.getMonth() + 1)).slice(-2),
    ("0" + d.getDate()).slice(-2),
  ].join("-");
}

// Get all projects
export async function getAllProjects() {
  try {
    const response = await axios.get(
      `https://api.todoist.com/rest/v1/projects`,
      {
        headers: {
          Authorization: `Bearer ${logseq.settings!.apiToken}`,
        },
      }
    );

    return response.data;
  } catch (e) {
    console.log(e);
    return [
      {
        name: "Please check that your API token is correct and restart Logseq.",
        id: "0",
      },
    ];
  }
}

// Get all labels
export const getAllLabels = async () => {
  try {
    const response = await axios.get(`https://api.todoist.com/rest/v1/labels`, {
      headers: {
        Authorization: `Bearer ${logseq.settings!.apiToken}`,
      },
    });

    return response.data;
  } catch (e) {
    console.log(e);
    return [
      {
        name: "Please check that your API token is correct and restart Logseq.",
        id: "0",
      },
    ];
  }
};

// Get attachments
async function getAttachments(taskId: number) {
  const response = await axios({
    url: `https://api.todoist.com/rest/v1/comments`,
    method: "get",
    headers: {
      Authorization: `Bearer ${logseq.settings?.apiToken}`,
    },
    params: {
      task_id: taskId,
    },
  });

  return response.data
    .map(
      (i: {
        attachment: { file_name: string; file_type: string; file_url: string };
      }) => `[${i.attachment.file_name}](${i.attachment.file_url})`
    )
    .join(", ");
}

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
    return "Error getting ID from project and label";
  }
};

export function removePrefix(content: string) {
  const prefixes = ["TODO", "DOING", "NOW", "LATER", "WAITING"];
  let newContent: string = content;
  for (let p of prefixes) {
    if (newContent.startsWith(p)) {
      newContent = newContent.replace(p, "");
    }
  }

  // Remove LOGBOOK if have
  if (newContent.includes("LOGBOOK")) {
    newContent = newContent.substring(0, newContent.indexOf("LOGBOOK"));
  }

  return newContent;
}

export function removePrefixWhenAddingTodoistUrl(content: string) {
  const prefixes = ["TODO", "DOING", "NOW", "LATER", "WAITING"];
  let newContent: string = content;
  let isTaskBlk = false;

  for (let p of prefixes) {
    if (newContent.startsWith(p)) {
      isTaskBlk = true;
      newContent = `${p} [${removePrefix(content).trim()}]`;
      break;
    }
  }

  if (!isTaskBlk) {
    newContent = `[${newContent}]`
  }

  return newContent;
}

export const pullTasks = async (condition: string) => {
  let response;

  if (condition === "today") {
    response = await axios({
      method: "get",
      url: "https://api.todoist.com/rest/v1/tasks",
      params: {
        filter: getYYYYMMDD(new Date()),
      },
      headers: {
        Authorization: `Bearer ${logseq.settings?.apiToken}`,
      },
    });
  } else {
    response = await axios({
      method: "get",
      url: "https://api.todoist.com/rest/v1/tasks",
      params: {
        project_id: condition,
      },
      headers: {
        Authorization: `Bearer ${logseq.settings?.apiToken}`,
      },
    });
  }

  if (response.data.length === 0) {
    return { tasksArr: [], tasksIdArr: [] };
  } else {
    let tasksArr: any[] = [];
    for (let t of response.data) {
      if (!t.parent_id) {
        tasksArr.push({
          todoist_id: t.id,
          project_id: t.project_id,
          content: `TODO ${t.content} ${
            t.comment_count ? `(${await getAttachments(t.id)})` : ""
          }
${
  t.due
    ? `SCHEDULED: <${getScheduledDeadlineDateDay(new Date(t.due.date))}${
        t.due.datetime ? ` ${t.due.string.slice(-5)}` : ""
      }>`
    : ""
}
${t.description ? "description:: " + t.description : ""}`,
          children: [],
        });
      }
    }

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

    // CAN THINK ABOUT RECURSION FOR SUB SUB SUB TASKS
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

    // Map id from tasks without Prefix to mark as complete in Todoist
    let tasksIdArr = response.data.map((i: Id) => i.id);

    return {
      tasksArr: tasksArr,
      tasksIdArr: tasksIdArr,
    };
  }
};

export async function sendTaskFunction(data: object) {
  try {
    const response = await axios({
      method: "post",
      url: "https://api.todoist.com/rest/v1/tasks",
      data,
      headers: {
        Authorization: `Bearer ${logseq.settings!.apiToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.log(error);
    logseq.App.showMsg(
      "There is an error sending your task. Please file an issue on Github."
    );
  }
}
