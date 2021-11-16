import axios from 'axios';

const sendTaskAndPriorityToTodist = async (
  content: string,
  priority: number
) => {
  await axios.post(
    'https://api.todoist.com/rest/v1/tasks',
    { content: content, priority: priority },
    {
      headers: {
        Authorization: `Bearer ${logseq.settings?.apiToken}`,
      },
    }
  );
};

const sendTaskOnlyToTodoist = async (content: string) => {
  await axios.post(
    'https://api.todoist.com/rest/v1/tasks',
    { content: content },
    {
      headers: {
        Authorization: `Bearer ${logseq.settings?.apiToken}`,
      },
    }
  );
};

export default { sendTaskOnlyToTodoist, sendTaskAndPriorityToTodist };
