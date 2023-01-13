import "@logseq/libs";
import handleListeners from "./utils/handleListeners";
import callSettings from "./services/settings";

import React from "react";
import ReactDOM from "react-dom";
import SendTask from "./components/SendTask";
import "./App.css";
import { retrieveTasks, sendTaskToTodoist } from "./services/todoistHelpers";
import { getIdFromString } from "./utils/parseStrings";
import generateUniqueId from "./utils/generateUniqueId";

async function main() {
  console.log("logseq-todoist-plugin loaded");

  handleListeners();

  callSettings();

  // SEND TASK
  logseq.Editor.registerSlashCommand("Todoist: Send Task", async function(e) {
    const { sendDefaultProject, sendDefaultLabel, sendDefaultDeadline } = logseq.settings!;
    let content: string = (await logseq.Editor.getEditingBlockContent()).trim();

    if (content === "") {
      logseq.UI.showMsg("Task cannot be empty!", "error");
      return
    }

    const anyDefaultSettings = sendDefaultProject !== "--- ---" || sendDefaultLabel !== "" || sendDefaultDeadline
    if (anyDefaultSettings) {
      sendTaskToTodoist(
        {
          uuid: e.uuid,
          content,
        }
      );
    } else {
      ReactDOM.render(
        <React.StrictMode>
          <SendTask content={content} uuid={e.uuid} />
        </React.StrictMode>,
        document.getElementById("app")
      );
      logseq.showMainUI();
    }

  });

  // PULL TASKS
  logseq.Editor.registerSlashCommand(
    "Todoist: Retrieve Tasks",
    async function(e) {
      await retrieveTasks(
        e,
        getIdFromString(logseq.settings!.retrieveDefaultProject)
      );
    }
  );

  // PULL TODAY's TASKS
  logseq.Editor.registerSlashCommand(
    "Todoist: Retrieve Today's Tasks",
    async function(e) {
      await retrieveTasks(e, "today");
    }
  );

  // KEEP IN SYNC
  logseq.Editor.registerSlashCommand(
    "Todoist: Insert sync block",
    async function() {
      logseq.UI.showMsg("Please wait", "warning");

      await logseq.Editor.insertAtEditingCursor(
        `{{renderer :todoistsync_${generateUniqueId()}}}`
      );
    }
  );

  logseq.App.onMacroRendererSlotted(async function({ slot, payload }) {
    const [type] = payload.arguments;

    if (!type.startsWith(":todoistsync_")) return;

    logseq.provideModel({
      async todoistSync() {
        await retrieveTasks(
          payload,
          getIdFromString(logseq.settings!.retrieveDefaultProject)
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
