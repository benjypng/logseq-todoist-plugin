import "@logseq/libs";
import "./App.css";
import handleListeners from "./utils/handleListeners";
import { callSettings } from "./settings";
import { retrieveTasks } from "./features/retrieve";
import { PluginSettings } from "./settings/types";
import { render } from "preact";
import { SendTask } from "./features/send/components/SendTask";
import { removeTaskFlags, sendTask } from "./features/send";
import { getAllProjects, getAllLabels } from "./features/helpers";

const main = async () => {
  console.log("logseq-todoist-plugin loaded");
  handleListeners();
  const { apiToken } = logseq.settings!;
  if (!apiToken || apiToken === "") {
    // Check if it's a new install
    await logseq.UI.showMsg(
      "Please key in your API key before using the plugin",
      "error",
    );
    return;
  }
  callSettings();

  // RETRIEVE TASKS
  logseq.Editor.registerSlashCommand("Todoist: Retrieve Tasks", async (e) => {
    await retrieveTasks(e.uuid);
  });
  logseq.Editor.registerSlashCommand(
    "Todoist: Retrieve Today's Tasks",
    async (e) => {
      await retrieveTasks(e.uuid, "today");
    },
  );
  logseq.Editor.registerSlashCommand(
    "Todoist: Retrieve Custom Filter",
    async (e) => {
      const content = await logseq.Editor.getEditingBlockContent();
      await retrieveTasks(e.uuid, content);
    },
  );

  // SEND TASKS
  const { sendDefaultProject, sendDefaultLabel } =
    logseq.settings! as Partial<PluginSettings>;
  logseq.Editor.registerSlashCommand("Todoist: Send task", async (e) => {
    const content: string = await logseq.Editor.getEditingBlockContent();
    if (!content || content.length === 0) {
      await logseq.UI.showMsg("Cannot send empty task", "error");
      return;
    }
    if (sendDefaultProject === "--- ---" || sendDefaultLabel === "--- ---") {
      const msg = await logseq.UI.showMsg("Loading projects and tasks");
      const projects = await getAllProjects();
      const labels = await getAllLabels();
      logseq.UI.closeMsg(msg);
      // Render popup
      render(
        <SendTask
          projects={projects}
          labels={labels}
          content={removeTaskFlags(content).trim()}
          uuid={e.uuid}
        />,
        document.getElementById("app") as HTMLElement,
      );
      logseq.showMainUI();
    } else {
      await sendTask(e.uuid, content);
    }
  });
};

logseq.ready(main).catch(console.error);
