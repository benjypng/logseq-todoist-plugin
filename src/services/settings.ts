import "@logseq/libs";
import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin.user";

const settings: SettingSchemaDesc[] = [
  {
    key: "apiToken",
    type: "string",
    default: "abc",
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
  // Default send project
  // Default send label
  // Default send deadline
  // Append logseq uri
  //
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

export default settings;
