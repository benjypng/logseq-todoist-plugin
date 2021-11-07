import axios from 'axios';

const sendToTodoist = async (content: string) => {
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

export default { sendToTodoist };
