import { TodoistApi } from "@doist/todoist-api-typescript";
import { getAllProjects } from "../helpers";
import { getIdFromString } from "../../utils/parseStrings";
import { PluginSettings } from "~/settings/types";

export const removeTaskFlags = (content: string): string => {
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
  projectId?: string,
  deadline?: string,
  label?: string,
): Promise<void> => {
  const { apiToken, sendAppendUri, sendDefaultDeadline, sendDefaultLabel } =
    logseq.settings! as Partial<PluginSettings>;
  if (!apiToken) {
    await logseq.UI.showMsg("Ensure API token is correct", "error");
    return;
  }
  const api = new TodoistApi(apiToken);
  const graphName = (await logseq.App.getCurrentGraph())!.name;
  content = removeTaskFlags(content);
  // Add URI if sendAppendUri is true
  if (sendAppendUri) {
    content = `[${content}](logseq://graph/${graphName}?block-id=${uuid})`;
  }
  // Send tasks
  try {
    await api.addTask({
      content,
      ...(projectId && { projectId: projectId }),
      ...(deadline && { dueString: deadline ?? sendDefaultDeadline }),
      ...(label && { labels: [label ?? sendDefaultLabel] }),
    });
  } catch (e) {
    console.error(e);
    await logseq.UI.showMsg(`Task was not sent: ${(e as Error).message}`);
  }
};
