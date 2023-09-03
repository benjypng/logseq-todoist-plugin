import "@logseq/libs";
import "./App.css";
import handleListeners from "./utils/handleListeners";
import { callSettings } from "./settings";
import { retrieveTasks } from "./features/retrieve";
import { PluginSettings } from "./settings/types";
import { render } from "preact";
import { SendTask } from "./features/send/components/SendTask";
import { sendTask } from "./features/send";
import { getAllLabels, getAllProjects } from "./services/todoistHelpers";

const main = async () => {
  console.log("logseq-todoist-plugin loaded");
  handleListeners();
  await callSettings();

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
  // @ts-ignore
  const { sendDefaultProject, sendDefaultLabel }: PluginSettings =
    logseq.settings!;
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
          content={content}
          uuid={e.uuid}
        />,
        document.getElementById("app") as HTMLElement,
      );
      logseq.showMainUI();
    } else {
      // TODO: Insert send task here
      await sendTask(e.uuid, content);
    }
  });
};

logseq.ready(main).catch(console.error);
