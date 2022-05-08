import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin";
import axios from "axios";

const allProjects = async () => {
  let response = await axios.get(`https://api.todoist.com/rest/v1/projects`, {
    headers: {
      Authorization: `Bearer ${logseq.settings!.apiToken}`,
    },
  });

  return response.data.map((p: any) => p.name);
};

export const callSettings = async () => {
  const opts = await allProjects();
  console.log(opts);
  const settings: SettingSchemaDesc[] = [
    {
      key: "layer1",
      type: "string",
      default: "> Layer 1",
      description:
        "Specifies the name of the Layer 1 block that your highlights would go under. Supports markdown.",
      title: "Name of Layer 1 block",
    },
    {
      key: "layer1Highlights",
      type: "enum",
      enumPicker: "select",
      enumChoices: opts,
      default: "",
      description:
        "Indicate whether you use bold or highlights for your 1st layer.",
      title: "Layer 1 Highlight Method",
    },
  ];
  logseq.useSettingsSchema(settings);
};
