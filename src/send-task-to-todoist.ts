import axios from 'axios';

const sendTaskAndPriorityToTodist = async (
  content: string,
  priority: number
) => {
  const { sendProject, sendLabel, apiToken } = logseq.settings!;
  if (sendProject && sendProject !== '0' && sendLabel && sendLabel !== '0') {
    await axios.post(
      'https://api.todoist.com/rest/v1/tasks',
      {
        content: content,
        priority: priority,
        project_id: sendProject,
        label_ids: [sendLabel],
      },
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );
  } else if (sendLabel && (!sendProject || sendProject === '0')) {
    await axios.post(
      'https://api.todoist.com/rest/v1/tasks',
      {
        content: content,
        priority: priority,
        label_ids: [sendLabel],
      },
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );
  } else if (sendProject && (!sendLabel || sendLabel === '0')) {
    await axios.post(
      'https://api.todoist.com/rest/v1/tasks',
      {
        content: content,
        priority: priority,
        project_id: sendProject,
      },
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );
  } else {
    await axios.post(
      'https://api.todoist.com/rest/v1/tasks',
      {
        content: content,
        priority: priority,
      },
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );
  }
};

const sendTaskOnlyToTodoist = async (content: string) => {
  const { sendProject, sendLabel, apiToken } = logseq.settings!;
  if (sendProject && sendProject !== '0' && sendLabel && sendLabel !== '0') {
    await axios.post(
      'https://api.todoist.com/rest/v1/tasks',
      {
        content: content,
        project_id: sendProject,
        label_ids: [sendLabel],
      },
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );
  } else if (sendLabel && (!sendProject || sendProject === '0')) {
    await axios.post(
      'https://api.todoist.com/rest/v1/tasks',
      {
        content: content,
        label_ids: [sendLabel],
      },
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );
  } else if (sendProject && (!sendLabel || sendLabel === '0')) {
    await axios.post(
      'https://api.todoist.com/rest/v1/tasks',
      {
        content: content,
        project_id: sendProject,
      },
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );
  } else {
    await axios.post(
      'https://api.todoist.com/rest/v1/tasks',
      {
        content: content,
      },
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );
  }
};

export default { sendTaskOnlyToTodoist, sendTaskAndPriorityToTodist };
