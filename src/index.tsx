import "@logseq/libs";
import handleListeners from "./utils/handleListeners";
import callSettings from "./services/settings";

import React from "react";
import ReactDOM from "react-dom";
import SendTask from "./components/SendTask";
import "./App.css";
import { sendTaskToLogseq } from "./services/todoistHelpers";
import getIdFromString from "./utils/getIdFromString";

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
      await sendTaskToLogseq(
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
  logseq.Editor.registerSlashCommand("Todoist: Pull Tasks", async function () {
    // Insert here
  });

  // PULL TODAY's TASKS
  logseq.Editor.registerSlashCommand(
    "Todoist: Pull Today's Tasks",
    async function () {
      // Insert here
    }
  );
}

logseq.ready(main).catch(console.error);
