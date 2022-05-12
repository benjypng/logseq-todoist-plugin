import axios from "axios";
import { getTasks } from "./getTasks";
import { Task, Id } from "../idTask";

// Function to handle tasks without a prefix indicated in Todoist so it needs to be added in Logseq
export const handleTasksWithoutPrefix = async () => {
  if (logseq.settings?.projectIdWithoutPrefix) {
    try {
      return {
        withoutPrefixArr: (
          await getTasks(logseq.settings?.projectIdWithoutPrefix)
        ).tasksArr,
        tasksIdWithoutPrefixArr: (
          await getTasks(logseq.settings?.projectIdWithoutPrefix)
        ).tasksIdArr,
      };
    } catch (e) {
      logseq.App.showMsg(
        "There could be a typo in your Project ID or the Todoist API is down. Please check and try again."
      );
      return;
    }
  } else {
    return { withoutPrefixArr: [], tasksIdWithoutPrefixArr: [] };
  }
};

// Function to handle tasks with a prefix indicated in Todoist
export const handleTasksWithPrefix = async () => {
  if (logseq.settings?.projectIdWithPrefix) {
    try {
      return {
        withPrefixArr: (await getTasks(logseq.settings?.projectIdWithPrefix))
          .tasksArr,
        tasksIdWithPrefixArr: (
          await getTasks(logseq.settings?.projectIdWithPrefix)
        ).tasksIdArr,
      };
    } catch (e) {
      logseq.App.showMsg(
        "There could be a typo in your Project ID or the Todoist API is down. Please check and try again."
      );
      return;
    }
  } else {
    return {
      withPrefixArr: [],
      tasksIdWithPrefixArr: [],
    };
  }
};

// Function to pull today's task
export const pullTodaysTask = async (date: string) => {
  try {
    let response = await axios.get("https://api.todoist.com/rest/v1/tasks", {
      params: {
        filter: date,
      },
      headers: {
        Authorization: `Bearer ${logseq.settings?.apiToken}`,
      },
    });

    if (response.data.length === 0) {
      logseq.App.showMsg("There are no tasks due today");
    } else {
      return {
        tasksArr: response.data.map((t: Task) => ({
          content: `TODO ${t.content}`,
        })),
        tasksIdArr: response.data.map((t: Id) => t.id),
      };
    }
  } catch (e) {
    console.log(e);
  }
};
