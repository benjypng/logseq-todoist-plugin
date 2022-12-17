import "@logseq/libs";
import settings from "./services/settings";
import handleListeners from "./utils/handleListeners";

import React from "react";
import ReactDOM from "react-dom";
import SendTask from "./components/SendTask";
import "./App.css";

async function main() {
  console.log("logseq-todoist-plugin loaded");

  handleListeners();

  // SEND TASK
  logseq.Editor.registerSlashCommand("Todoist: Send Task", async function () {
    ReactDOM.render(
      <React.StrictMode>
        <SendTask />
      </React.StrictMode>,
      document.getElementById("app")
    );
    logseq.showMainUI();
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

logseq.useSettingsSchema(settings).ready(main).catch(console.error);
