import { Project, Label, TodoistApi } from "@doist/todoist-api-typescript";

export const getAllProjects = async (): Promise<string[]> => {
  const { apiToken } = logseq.settings!;
  if (!apiToken || apiToken === "") return ["--- ---"];
  const api: TodoistApi = new TodoistApi(apiToken);
  try {
    const allProjects: Project[] = await api.getProjects();
    const projArr = allProjects.map(
      (project) => `${project.name} (${project.id})`,
    );
    projArr.unshift("--- ---");
    return projArr;
  } catch (e) {
    console.log(e);
    await logseq.UI.showMsg(
      `Error retrieving projects ${(e as Error).message}`,
      "error",
    );
    return ["--- ---"];
  }
};

export const getAllLabels = async (): Promise<string[]> => {
  const { apiToken } = logseq.settings!;
  if (!apiToken || apiToken === "") return ["--- ---"];
  const api: TodoistApi = new TodoistApi(apiToken);
  try {
    const allLabels: Label[] = await api.getLabels();
    const labelArr = allLabels.map((label) => `${label.name} (${label.id})`);
    labelArr.unshift("--- ---");
    return labelArr;
  } catch (e) {
    console.log(e);
    await logseq.UI.showMsg(
      `Error retrieving labels ${(e as Error).message}`,
      "error",
    );
    return ["--- ---"];
  }
};

export const getIdFromString = (content: string): string => {
  const regExp = /\((.*?)\)/;
  const matched = regExp.exec(content.trim());
  if (matched && matched[1]) {
    return matched[1];
  } else {
    return "";
  }
};
