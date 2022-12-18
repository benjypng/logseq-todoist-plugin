import { getDayInText } from "logseq-dateutils";

export function getIdFromString(content: string) {
  const regExp = /\((.*?)\)/;
  const matched = regExp.exec(content.trim());
  if (matched) {
    return matched![1];
  } else {
    return "";
  }
}

export function getNameFromString(content: string) {
  return content.substring(0, content.indexOf("(")).trim();
}

export function handleContentWithUrlAndTodo(content: string, task: any) {
  const { retrieveAppendTodo, retrieveAppendUrl } = logseq.settings!;

  content = retrieveAppendUrl ? `[${content}](${task.url})` : content;
  content = retrieveAppendTodo ? `TODO ${content}` : content;
  content = task.due
    ? `TODO ${content}
DEADLINE: <${task.due.date} ${getDayInText(new Date(task.due.date)).substring(
        0,
        3
      )}>`
    : content;

  return content;
}
