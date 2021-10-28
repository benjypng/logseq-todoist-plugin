import axios from 'axios';
import env from './endpoints.config';

let handleTasksWithoutPrefix = async () => {
  if (env.projectIdWithoutPrefix) {
    let response = await axios.get('https://api.todoist.com/rest/v1/tasks', {
      params: { project_id: env.projectIdWithoutPrefix },
      headers: {
        Authorization: `Bearer ${env.apiToken}`,
      },
    });

    // Map tasks without Prefix
    let withoutPrefixArr = response.data.map((t) => ({
      content: `TODO ${t.content}`,
    }));

    // Map id from tasks without Prefix to mark as complete in Todoist
    let tasksIdWithoutPrefixArr = response.data.map((i) => i.id);

    return {
      withoutPrefixArr: withoutPrefixArr,
      tasksIdWithoutPrefixArr: tasksIdWithoutPrefixArr,
    };
  } else {
    return { withoutPrefixArr: [], tasksIdWithoutPrefixArr: [] };
  }
};

let handleTasksWithPrefix = async () => {
  if (env.projectIdWithPrefix) {
    let response2 = await axios.get('https://api.todoist.com/rest/v1/tasks', {
      params: { project_id: env.projectIdWithPrefix },
      headers: {
        Authorization: `Bearer ${env.apiToken}`,
      },
    });

    // Map tasks with Prefix
    let withPrefixArr = response2.data.map((t) => ({
      content: `${t.content}`,
    }));

    // Map id from tasks with Prefix to mark as complete in Todoist
    let tasksIdWithPrefixArr = response2.data.map((i) => i.id);

    return {
      withPrefixArr: withPrefixArr,
      tasksIdWithPrefixArr: tasksIdWithPrefixArr,
    };
  } else {
    return {
      withPrefixArr: [],
      tasksIdWithPrefixArr: [],
    };
  }
};

export default { handleTasksWithPrefix, handleTasksWithoutPrefix };
