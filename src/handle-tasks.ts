import '@logseq/libs';
import axios from 'axios';

type Task = {
  parent_id: number;
  id: number;
  content: string;
  description: string;
};

type Id = {
  id: number;
};

let getProjectName = async (projectId: string) => {
  let project = await axios.get(
    `https://api.todoist.com/rest/v1/projects/${projectId}`,
    {
      headers: {
        Authorization: `Bearer ${logseq.settings?.apiToken}`,
      },
    }
  );
  return project.data.name;
};

let handleTasksWithoutPrefix = async () => {
  if (logseq.settings?.projectIdWithoutPrefix) {
    try {
      let response = await axios.get('https://api.todoist.com/rest/v1/tasks', {
        params: {
          project_id: logseq.settings?.projectIdWithoutPrefix,
        },
        headers: {
          Authorization: `Bearer ${logseq.settings?.apiToken}`,
        },
      });

      if (response.data.length === 0) {
        return { withoutPrefixArr: [], tasksIdWithoutPrefixArr: [] };
      } else {
        // Create array of main tasks
        let withoutPrefixArr = response.data
          .filter((t: Task) => {
            return !t.parent_id;
          })
          .map((t: Task) => ({
            todoist_id: t.id,
            content: `TODO ${t.content}
            ${t.description ? 'description:: ' + t.description : ''}`,
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
            description: t.description,
          }));

        // Subsume sub tasks under main tasks
        for (let m of withoutPrefixArr) {
          for (let s of subTasks) {
            if (s.parent_id === m.todoist_id) {
              m.children.push({
                content: `TODO ${s.content}
                ${s.description ? 'description:: ' + s.description : ''}`,
              });
            }
            continue;
          }
        }
        // Add project name as a parent block
        withoutPrefixArr = [
          {
            content: `[[${await getProjectName(
              logseq.settings?.projectIdWithoutPrefix
            )}]]`,
            children: [...withoutPrefixArr],
          },
        ];

        // Map id from tasks without Prefix to mark as complete in Todoist
        let tasksIdWithoutPrefixArr = response.data.map((i: Id) => i.id);

        return {
          withoutPrefixArr: withoutPrefixArr,
          tasksIdWithoutPrefixArr: tasksIdWithoutPrefixArr,
        };
      }
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
  if (logseq.settings?.projectIdWithPrefix) {
    try {
      let response2 = await axios.get('https://api.todoist.com/rest/v1/tasks', {
        params: {
          project_id: logseq.settings?.projectIdWithPrefix,
        },
        headers: {
          Authorization: `Bearer ${logseq.settings?.apiToken}`,
        },
      });

      if (response2.data.length === 0) {
        return {
          withPrefixArr: [],
          tasksIdWithPrefixArr: [],
        };
      } else {
        // Create array of main tasks
        let withPrefixArr = response2.data
          .filter((t: Task) => {
            return !t.parent_id;
          })
          .map((t: Task) => ({
            todoist_id: t.id,
            content: `${t.content}
            ${t.description ? 'description:: ' + t.description : ''}`,
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
            description: t.description,
          }));

        // Subsume sub tasks under main tasks
        for (let m of withPrefixArr) {
          for (let s of subTasks) {
            if (s.parent_id == m.todoist_id) {
              m.children.push({
                content: `${s.content}
                ${s.description ? 'description:: ' + s.description : ''}`,
              });
            }
            continue;
          }
        }

        // Add project name as a parent block
        withPrefixArr = [
          {
            content: `[[${await getProjectName(
              logseq.settings?.projectIdWithPrefix
            )}]]`,
            children: [...withPrefixArr],
          },
        ];

        // Map id from tasks with Prefix to mark as complete in Todoist
        let tasksIdWithPrefixArr = response2.data.map((i: Id) => i.id);

        return {
          withPrefixArr: withPrefixArr,
          tasksIdWithPrefixArr: tasksIdWithPrefixArr,
        };
      }
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

export default {
  getProjectName,
  handleTasksWithPrefix,
  handleTasksWithoutPrefix,
};
