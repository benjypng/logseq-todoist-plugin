import "@logseq/libs";
import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin.user";
import { getAllProjects, getAllLabels } from "./todoistHelpers";

export default async function callSettings() {
  const settings: SettingSchemaDesc[] = [
    {
      key: "apiToken",
      type: "string",
      default: "KtE71bDUeY2OpDBr3LQEgWEHUZPFN1yi",
      title: "API Token",
      description:
        "You can retrieve your API token from your Todoist developer dashboard.",
    },
    {
      key: "",
      type: "heading",
      default: "",
      title: "Sending Tasks",
      description: "",
    },
    {
      key: "sendDefaultProject",
      type: "enum",
      default: "",
      enumChoices: await getAllProjects(),
      enumPicker: "select",
      title: "Default Project",
      description: "Default project to send tasks to",
    },
    {
      key: "sendDefaultLabel",
      type: "enum",
      default: "",
      enumChoices: await getAllLabels(),
      enumPicker: "select",
      title: "Default Label",
      description: "Default label to label tasks",
    },
    {
      key: "sendDefaultDeadline",
      type: "boolean",
      default: false,
      title: "Default Deadline",
      description:
        "If set to true, all tasks sent to Todoist will have the deadline set as TODAY",
    },
    {
      key: "sendAppendUri",
      type: "boolean",
      default: true,
      title: "Append Logseq URI",
      description:
        "If set to true, all tasks sent to Todoist will have the Logseq URI appended.",
    },
    {
      key: "",
      type: "heading",
      default: "",
      title: "Pulling Tasks",
      description: "",
    },
    // Default pull project
    // Default pull append todo
    // Default clear tasks
    // Default add project name as parent block
  ];
  logseq.useSettingsSchema(settings);
}
