import "@logseq/libs";
import React from "react";
import ReactDOM from "react-dom";
import "./App.css";
import SendTask from "./components/SendTask";
import callSettings from "./services/settings";
import { executeFilter, retrieveTasks, sendTaskToTodoist } from "./services/todoistHelpers";
import generateUniqueId from "./utils/generateUniqueId";
import handleListeners from "./utils/handleListeners";
import { getIdFromString } from "./utils/parseStrings";

async function main() {
  console.log("logseq-todoist-plugin loaded");

  handleListeners();

  callSettings();

  // EXECUTE INLINE FILTER
  logseq.Editor.registerSlashCommand("Todoist: Execute inline filter", async function (e) {
    let content: string = (await logseq.Editor.getEditingBlockContent()).trim();

    if (content === "") {
      logseq.UI.showMsg("Filter cannot be empty!", "error");
      return;
    }
    logseq.UI.showMsg(`Todoist filter ${content}`)
    await executeFilter(e.uuid, content);
  });

  // SEND TASK
  logseq.Editor.registerSlashCommand("Todoist: Send Task", async function (e) {
    const { sendDefaultProject, sendDefaultLabel, sendDefaultDeadline } =
      logseq.settings!;
    let content: string = (await logseq.Editor.getEditingBlockContent()).trim();

    if (content === "") {
      logseq.UI.showMsg("Task cannot be empty!", "error");
      return;
    }

    if (
      sendDefaultProject === "--- ---" ||
      sendDefaultProject === "" ||
      sendDefaultLabel === "--- ---" ||
      sendDefaultLabel === "" ||
      sendDefaultDeadline
    ) {
      ReactDOM.render(
        <React.StrictMode>
          <SendTask content={content} uuid={e.uuid} />
        </React.StrictMode>,
        document.getElementById("app")
      );
      logseq.showMainUI();
    } else {
      await sendTaskToTodoist(
        e.uuid,
        content,
        getIdFromString(sendDefaultProject),
        getIdFromString(sendDefaultLabel),
        sendDefaultDeadline ? "today" : ""
      );
    }
  });

  // PULL TASKS
  logseq.Editor.registerSlashCommand(
    "Todoist: Retrieve Tasks",
    async function (e) {

      await retrieveTasks(e, { projectId: getIdFromString(logseq.settings!.retrieveDefaultProject) });
    }
  );

  // PULL TODAY's TASKS
  logseq.Editor.registerSlashCommand(
    "Todoist: Retrieve Today's Tasks",
    async function (e) {
      await retrieveTasks(e, { filter: "today" });

    }
  );

  // KEEP IN SYNC
  logseq.Editor.registerSlashCommand(
    "Todoist: Insert sync block",
    async function () {
      logseq.UI.showMsg("Please wait", "warning");

      await logseq.Editor.insertAtEditingCursor(
        `{{renderer :todoistsync_${generateUniqueId()}}}`
      );
    }
  );

  logseq.App.onMacroRendererSlotted(async function ({ slot, payload }) {
    const [type] = payload.arguments;

    if (!type.startsWith(":todoistsync_")) return;

    logseq.provideModel({
      async todoistSync() {
        await retrieveTasks(
          payload,
          { projectId: getIdFromString(logseq.settings!.retrieveDefaultProject) }
        );
      },
    });

    logseq.provideUI({
      key: "logseq-todoist-plugin",
      reset: false,
      slot,
      template: `<button class="px-2 py-0 rounded-md bg-red-600 text-white" data-on-click="todoistSync">Todoist Sync</button>`,
    });
  });
}

logseq.ready(main).catch(console.error);
