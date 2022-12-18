export default function getIdFromString(content: string) {
  const regExp = /\((.*?)\)/;
  const matched = regExp.exec(content.trim());
  if (matched) {
    return matched![1];
  } else {
    return "";
  }
}
