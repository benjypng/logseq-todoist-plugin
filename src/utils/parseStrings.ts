import { getDayInText, getYYMMDDTHHMMFormat } from "logseq-dateutils";

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
  const {
    retrieveAppendTodo,
    retrieveAppendUrl,
    retrieveAppendCreationDateTime,
  } = logseq.settings!;

  const isoDate = getYYMMDDTHHMMFormat(new Date(task.createdAt));
  const [datePart, timePart] = isoDate.split("T");

  content = retrieveAppendUrl ? `[${content}](${task.url})` : content;

  // Use conventions that conform with the format expected by other plugins:
  // @ = https://github.com/hkgnp/logseq-datenlp-plugin
  // **<time>** = https://github.com/QWxleA/logseq-interstitial-heading-plugin
  // TODO: it would be nice to somehow detect if these plugins are installed,
  //  then adapt the format to their configs.
  //  I don't know if some "plugin interop" is possible in Logseq
  content = retrieveAppendCreationDateTime
    ? `@${datePart} **${timePart}** ${content}`
    : content;

  content = retrieveAppendTodo ? `TODO ${content}` : content;
  content = task.due
    ? `${content}
DEADLINE: <${task.due.date} ${getDayInText(new Date(task.due.date)).substring(
        0,
        3
      )}>`
    : content;

  return content;
}
