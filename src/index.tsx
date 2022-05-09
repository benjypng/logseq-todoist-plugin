import "@logseq/libs";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { callSettings } from "./callSettings";
import { handleClosePopup } from "./handleClosePopup";
import sendTaskToTodoist from "./send-task-to-todoist";
import { insertTasksIntoLogseq } from "./helpersLogseq";

const main = async () => {
  console.log("Logseq-Todoist-Plugin loaded");

  callSettings();

  handleClosePopup();

  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById("app")
  );

  // Register push command
  logseq.Editor.registerSlashCommand("todoist - send task", async () => {
    const currBlockContent = await logseq.Editor.getEditingBlockContent();
    const currBlock = await logseq.Editor.getCurrentBlock();
    const currBlockProperties = await logseq.Editor.getBlockProperties(
      currBlock!.uuid
    );

    if (currBlockContent) {
      // Send task without priority
      if (Object.keys(currBlockProperties).length === 0) {
        sendTaskToTodoist.sendTaskOnlyToTodoist(currBlockContent);
        logseq.App.showMsg(`
          [:div.p-2
            [:h1 "Task (without priority) sent to your Todoist Inbox!"]
            [:h2.text-xl "${currBlockContent}"]]`);
      } else {
        // Send task with priority
        const contentWithoutPriority = currBlockContent.substring(
          0,
          currBlockContent.indexOf("\n")
        );
        sendTaskToTodoist.sendTaskAndPriorityToTodist(
          contentWithoutPriority,
          parseInt(currBlockProperties.priority)
        );
        logseq.App.showMsg(`
          [:div.p-2
              [:h1 "Task (with priority) sent to your Todoist Inbox!"]
            [:h2.text-xl "${contentWithoutPriority}"]]
        `);
      }
    } else {
      logseq.App.showMsg(
        "Please use this command at the end of writing out your task"
      );
    }
  });

  // Register pull command
  logseq.Editor.registerSlashCommand("todoist - pull tasks", async () => {
    await insertTasksIntoLogseq();
  });

  // Register pull today's tasks command
  logseq.Editor.registerSlashCommand(
    `todoist - pull today's tasks`,
    async () => {
      await insertTasksIntoLogseq("today");
    }
  );

  // Create UI for inserting env variables in settings
  const createModel = () => {
    return {
      show() {
        logseq.showMainUI();
      },
    };
  };

  logseq.provideModel(createModel());

  // Register UI
  logseq.App.registerUIItem("toolbar", {
    key: "logseq-todoist-plugin",
    template: `
        <a data-on-click="show"
          class="button">
          <i class="ti ti-checkbox"></i>
        </a>
  `,
  });
};

logseq.ready(main).catch(console.error);
