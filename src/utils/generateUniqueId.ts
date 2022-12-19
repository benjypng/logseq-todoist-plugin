export default function generateUniqueId() {
  const id: string = Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "");
  return id;
}
