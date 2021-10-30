import '@logseq/libs';
import axios from 'axios';
import env from './endpoints.config';

type Task = {
  parent_id: number;
  id: number;
  content: string;
};

type Id = {
  id: number;
};

let handleTasksWithoutPrefix = async () => {
  if (env.projectIdWithoutPrefix) {
    try {
      let response = await axios.get('https://api.todoist.com/rest/v1/tasks', {
        params: { project_id: env.projectIdWithoutPrefix },
        headers: {
          Authorization: `Bearer ${env.apiToken}`,
        },
      });

      // Create array of main tasks
      let withoutPrefixArr = response.data
        .filter((t: Task) => {
          return !t.parent_id;
        })
        .map((t: Task) => ({
          todoist_id: t.id,
          content: `TODO ${t.content}`,
          children: [],
        }));

      // Create array of sub tasks
      let subTasks = response.data
        .filter((t: Task) => {
          return t.parent_id;
        })
        .map((t: Task) => ({
          todoist_id: t.id,
          content: t.content,
          parent_id: t.parent_id,
        }));

      // Subsume sub tasks under main tasks
      for (let m of withoutPrefixArr) {
        for (let s of subTasks) {
          if (s.parent_id == m.todoist_id) {
            m.children.push({ content: `TODO ${s.content}` });
          }
          continue;
        }
      }

      // Map id from tasks without Prefix to mark as complete in Todoist
      let tasksIdWithoutPrefixArr = response.data.map((i: Id) => i.id);

      return {
        withoutPrefixArr: withoutPrefixArr,
        tasksIdWithoutPrefixArr: tasksIdWithoutPrefixArr,
      };
    } catch (e) {
      logseq.App.showMsg(
        'There could be a typo in your Project ID or the Todoist API is down. Please check and try again.'
      );
      return;
    }
  } else {
    return { withoutPrefixArr: [], tasksIdWithoutPrefixArr: [] };
  }
};

let handleTasksWithPrefix = async () => {
  if (env.projectIdWithPrefix) {
    try {
      let response2 = await axios.get('https://api.todoist.com/rest/v1/tasks', {
        params: { project_id: env.projectIdWithPrefix },
        headers: {
          Authorization: `Bearer ${env.apiToken}`,
        },
      });

      // Create array of main tasks
      let withPrefixArr = response2.data
        .filter((t: Task) => {
          return !t.parent_id;
        })
        .map((t: Task) => ({
          todoist_id: t.id,
          content: `${t.content}`,
          children: [],
        }));

      // Create array of sub tasks
      let subTasks = response2.data
        .filter((t: Task) => {
          return t.parent_id;
        })
        .map((t: Task) => ({
          todoist_id: t.id,
          content: t.content,
          parent_id: t.parent_id,
        }));

      // Subsume sub tasks under main tasks
      for (let m of withPrefixArr) {
        for (let s of subTasks) {
          if (s.parent_id == m.todoist_id) {
            m.children.push({ content: `${s.content}` });
          }
          continue;
        }
      }

      // Map id from tasks with Prefix to mark as complete in Todoist
      let tasksIdWithPrefixArr = response2.data.map((i: Id) => i.id);

      return {
        withPrefixArr: withPrefixArr,
        tasksIdWithPrefixArr: tasksIdWithPrefixArr,
      };
    } catch (e) {
      logseq.App.showMsg(
        'There could be a typo in your Project ID or the Todoist API is down. Please check and try again.'
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

export default { handleTasksWithPrefix, handleTasksWithoutPrefix };
