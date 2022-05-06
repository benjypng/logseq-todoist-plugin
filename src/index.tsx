import "@logseq/libs";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import handleTasks from "./handleTasks";
import { handleClosePopup } from "./handleClosePopup";
import sendTaskToTodoist from "./send-task-to-todoist";

const main = async () => {
  console.log("Logseq-Todoist-Plugin loaded");

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
    let tasksWithPrefix = await handleTasks.handleTasksWithPrefix();
    let tasksWithoutPrefix = await handleTasks.handleTasksWithoutPrefix();

    if (
      tasksWithPrefix?.withPrefixArr.length === 0 &&
      tasksWithoutPrefix?.withoutPrefixArr.length === 0
    ) {
      logseq.App.showMsg("There are no tasks in your indicated projects.");
      return;
    } else if (tasksWithPrefix && tasksWithoutPrefix) {
      let tasksContentArr = [
        ...tasksWithPrefix.withPrefixArr,
        ...tasksWithoutPrefix.withoutPrefixArr,
      ];

      let tasksIdArr = [
        ...tasksWithPrefix.tasksIdWithPrefixArr,
        ...tasksWithoutPrefix.tasksIdWithoutPrefixArr,
      ];

      // Insert header block
      let currBlock = await logseq.Editor.getCurrentBlock();

      try {
        if (currBlock) {
          // Insert tasks below header block
          await logseq.Editor.insertBatchBlock(
            currBlock.uuid,
            tasksContentArr,
            {
              sibling: true,
              before: false,
            }
          );
          //          Behaviour of removing block seems to have changed
          //          await logseq.Editor.removeBlock(currBlock.uuid);
        }
      } catch (e) {
        logseq.App.showMsg(
          "There is an error inserting your tasks. No tasks have been removed from Todoist."
        );
        return;
      }

      if (logseq.settings?.clearTasks) {
        try {
          // Mark tasks as complete in Todoist
          handleTasks.clearTasks(tasksIdArr);
        } catch (e) {
          logseq.App.showMsg(
            "There is an error removing your tasks from Todoist. Please remove them directly from Todoist."
          );
          return;
        }
      }
    }
  });

  // Register pull today's tasks command
  logseq.Editor.registerSlashCommand(
    `todoist - pull today's tasks`,
    async () => {
      const tasksArr = await handleTasks.pullTodaysTask("today");
      const currBlock = await logseq.Editor.getCurrentBlock();

      if (currBlock && tasksArr) {
        await logseq.Editor.updateBlock(currBlock!.uuid, "Tasks for Today");

        await logseq.Editor.insertBatchBlock(
          currBlock.uuid,
          tasksArr.tasksArr,
          {
            sibling: !parent,
            before: true,
          }
        );

        if (logseq.settings?.clearTasks) {
          try {
            // Mark tasks as complete in Todoist
            handleTasks.clearTasks(tasksArr.tasksIdArr);
          } catch (e) {
            logseq.App.showMsg(
              "There is an error removing your tasks from Todoist. Please remove them directly from Todoist."
            );
            return;
          }
        }
      } else {
        logseq.App.showMsg(
          "Error. Please double check the README on how to use this command."
        );
      }
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
