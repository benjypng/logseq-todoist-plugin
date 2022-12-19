import "@logseq/libs";
import handleListeners from "./utils/handleListeners";
import callSettings from "./services/settings";

import React from "react";
import ReactDOM from "react-dom";
import SendTask from "./components/SendTask";
import "./App.css";
import { retrieveTasks, sendTaskToLogseq } from "./services/todoistHelpers";
import { getIdFromString } from "./utils/parseStrings";
import generateUniqueId from "./utils/generateUniqueId";

async function main() {
  console.log("logseq-todoist-plugin loaded");

  handleListeners();

  callSettings();

  // SEND TASK
  logseq.Editor.registerSlashCommand("Todoist: Send Task", async function (e) {
    const { sendDefaultProject, sendDefaultLabel, sendDefaultDeadline } =
      logseq.settings!;
    let content: string = (await logseq.Editor.getEditingBlockContent()).trim();

    if (
      sendDefaultProject !== "--- ---" ||
      sendDefaultLabel !== "--- ---" ||
      sendDefaultDeadline
    ) {
      sendTaskToLogseq(
        e.uuid,
        content,
        getIdFromString(sendDefaultProject),
        getIdFromString(sendDefaultLabel),
        sendDefaultDeadline ? "today" : ""
      );
    } else {
      if (content === "") {
        logseq.UI.showMsg("Task cannot be empty!", "error");
        return;
      } else {
        ReactDOM.render(
          <React.StrictMode>
            <SendTask content={content} uuid={e.uuid} />
          </React.StrictMode>,
          document.getElementById("app")
        );
        logseq.showMainUI();
      }
    }
  });

  // PULL TASKS
  logseq.Editor.registerSlashCommand(
    "Todoist: Retrieve Tasks",
    async function (e) {
      retrieveTasks(
        e,
        getIdFromString(logseq.settings!.retrieveDefaultProject)
      );
    }
  );

  // PULL TODAY's TASKS
  logseq.Editor.registerSlashCommand(
    "Todoist: Retrieve Today's Tasks",
    async function (e) {
      retrieveTasks(e, "today");
    }
  );

  logseq.Editor.registerSlashCommand(
    "Todoist: Insert sync block",
    async function () {
      await logseq.Editor.insertAtEditingCursor(
        `{{renderer :todoistsync_${generateUniqueId()}}}`
      );
    }
  );
}

logseq.ready(main).catch(console.error);
