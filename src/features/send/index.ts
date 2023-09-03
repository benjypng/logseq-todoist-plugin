import { TodoistApi } from "@doist/todoist-api-typescript";
import { PluginSettings } from "../../settings/types";
import { getAllProjects } from "../../services/todoistHelpers";
import { getIdFromString } from "../../utils/parseStrings";

const removeTaskFlags = (content: string): string => {
  const taskFlags = ["TODO", "DOING", "NOW", "LATER", "DONE"];
  for (const f of taskFlags) {
    if (content.includes(f)) {
      content = content.replace(f, "");
    }
  }
  return content;
};

export const sendTask = async (
  uuid: string,
  content: string,
  deadline?: string,
  _label?: string,
) => {
  // @ts-ignore
  const {
    apiToken,
    sendAppendUri,
    sendDefaultProject,
    sendDefaultDeadline,
    sendDefaultLabel,
  }: PluginSettings = logseq.settings;
  const api = new TodoistApi(apiToken);
  const graphName = (await logseq.App.getCurrentGraph())!.name;
  content = removeTaskFlags(content);
  // Add URI if sendAppendUri is true
  if (sendAppendUri) {
    content = `[${content}](logseq://graph/${graphName}?block-id=${uuid})`;
  }
  // Send tasks
  const defaultProject = async () => {
    const project = await getAllProjects();
    if (!project || !project[0]) throw new Error();
    return getIdFromString(project[0]);
  };
  try {
    await api.addTask({
      content: content,
      dueString: sendDefaultDeadline ? "today" : deadline,
      labels: [sendDefaultLabel === "--- ---" ? "" : sendDefaultLabel],
      projectId: await defaultProject(),
    });
  } catch (e) {
    console.error(e);
    await logseq.UI.showMsg(`Task was not sent: ${(e as Error).message}`);
  }
};
