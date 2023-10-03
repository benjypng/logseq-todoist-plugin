import "@logseq/libs";
import handleListeners from "./utils/handleListeners";
import { callSettings } from "./settings";
import { retrieveTasks } from "./features/retrieve";
import { PluginSettings } from "./settings/types";
import { render } from "preact";
import { SendTask } from "./features/send/components/SendTask";
import { removeTaskFlags, sendTask } from "./features/send";
import {
  getAllProjects,
  getAllLabels,
  getIdFromString,
} from "./features/helpers";
import { handleSyncPage } from "./features/sync";

const main = async () => {
  console.log("logseq-todoist-plugin loaded");

  handleListeners();

  const { apiToken, syncToken, syncPage } =
    logseq.settings! as Partial<PluginSettings>;
  if (!apiToken || apiToken === "") {
    // Check if it's a new install
    await logseq.UI.showMsg(
      "Please key in your API key before using the plugin",
      "error",
    );
  }

  if (!syncToken || syncToken === "") {
    logseq.updateSettings({
      syncToken: "*",
    });
  }
  if (syncPage) {
    handleSyncPage();
  }

  const projects = await getAllProjects();
  const labels = await getAllLabels();
  callSettings(projects, labels);

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
  logseq.Editor.registerSlashCommand("Todoist: Send Task", async (e) => {
    const { sendDefaultProject } = logseq.settings! as Partial<PluginSettings>;
    const content: string = await logseq.Editor.getEditingBlockContent();
    if (!content || content.length === 0) {
      await logseq.UI.showMsg("Cannot send empty task", "error");
      return;
    }
    if (
      sendDefaultProject === "--- ---" ||
      !sendDefaultProject ||
      sendDefaultProject === ""
    ) {
      const msg = await logseq.UI.showMsg("Loading projects and tasks");
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
      await sendTask(e.uuid, content, getIdFromString(sendDefaultProject));
    }
  });
};

logseq.ready(main).catch(console.error);
