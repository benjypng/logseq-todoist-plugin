import axios from 'axios';
import env from './endpoints.config';

const sendToTodoist = async (content: string) => {
  await axios.post(
    'https://api.todoist.com/rest/v1/tasks',
    { content: content },
    {
      headers: {
        Authorization: `Bearer ${env.apiToken || logseq.settings?.apiToken}`,
      },
    }
  );
};

export default { sendToTodoist };
