import { TodoistApi } from "@doist/todoist-api-typescript";
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

const parseBlkDeadline = (deadline: number): string => {
  let year = deadline.toString().substring(0, 4);
  let month = deadline.toString().substring(5, 6);
  let day = deadline.toString().substring(6);
  return `${year}-${month}-${day}`;
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
  const blk = await logseq.Editor.getBlock(uuid);
  if (!blk) return;

  let sendDeadline: string = "";
  if (blk.deadline) {
    content = content.substring(1, content.indexOf("DEADLINE:"));
    sendDeadline = parseBlkDeadline(blk.deadline);
  } else if (deadline) {
    sendDeadline = deadline;
  } else if (sendDefaultDeadline) {
    sendDeadline = "today";
  } else {
    sendDeadline = "";
  }

  // Send tasks
  try {
    await api.addTask({
      content: content.trim(),
      dueString: sendDeadline,
      ...(projectId && { projectId: projectId }),
      ...(label && { labels: [label ?? sendDefaultLabel] }),
    });
    await logseq.UI.showMsg(`Task sent`);
  } catch (e) {
    console.error(e);
    await logseq.UI.showMsg(`Task was not sent: ${(e as Error).message}`);
  }
};
