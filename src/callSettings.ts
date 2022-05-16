import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin";
import { getAllLabels, getAllProjects } from "./helpersTodoist";

export const callSettings = async () => {
  let allProjects: any[] = await getAllProjects();
  allProjects = allProjects.map(
    (i: { name: string; id: string }) => `${i.name} (${i.id})`
  );
  let allLabels: any[] = await getAllLabels();
  allLabels = allLabels.map(
    (i: { name: string; id: string }) => `${i.name} (${i.id})`
  );

  const settings: SettingSchemaDesc[] = [
    {
      key: "apiToken",
      title: "API token",
      description: "Your API token, generated from the Todoist Developer page.",
      type: "string",
      default: "",
    },
    {
      key: "pullDefaultProject",
      title: "Pulling Tasks - Default Project",
      description: "Default project to pull tasks from.",
      type: "enum",
      enumPicker: "select",
      enumChoices: allProjects,
      default: "",
    },
    {
      key: "pullDefaultAppend",
      title: "Pulling Tasks - Append TODO by Default",
      description:
        "Indicate if you would like to append a TODO by default to each pulled item.",
      type: "boolean",
      default: true,
    },
    {
      key: "addParentBlock",
      title: "Pulling Tasks - Add Project Name as Parent Block",
      description:
        "Indicate if you would like to add the project name as the parent block, with the tasks nested under it.",
      type: "boolean",
      default: "false",
    },
    {
      key: "clearTasks",
      title: "Pulling Tasks - Clear task after pulling them into Todoist",
      description:
        "Indicate if you would like to clear the tasks in Todoist after pulling them over.",
      type: "boolean",
      default: true,
    },
    {
      key: "sendDefaultProject",
      title: "Sending Tasks - Default Project",
      description: "Default project to send tasks to.",
      type: "enum",
      enumPicker: "select",
      enumChoices: allProjects,
      default: "",
    },
    {
      key: "sendDefaultDeadline",
      title: "Sending Tasks - Default Deadline",
      description: "Set deadline as TODAY for all tasks sent to Todoist.",
      type: "boolean",
      default: false,
    },
    {
      key: "sendDefaultLabel",
      title: "Sending Tasks - Default Label",
      description: "Set label for all tasks sent to Todoist.",
      type: "enum",
      enumPicker: "select",
      enumChoices: allLabels,
      default: "",
    },
  ];
  logseq.useSettingsSchema(settings);
};
