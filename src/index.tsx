import '@logseq/libs';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import handleTasks from './handle-tasks';
import axios from 'axios';
import sendTaskToTodoist from './send-task-to-todoist';

const main = async () => {
  console.log('Logseq-Todoist-Plugin loaded');

  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('app')
  );

  // Register push command
  logseq.Editor.registerSlashCommand('todoist - send task', async () => {
    const currentBlockContent = await logseq.Editor.getEditingBlockContent();
    const currentBlock = await logseq.Editor.getCurrentBlock();
    const currentBlockProperties = await logseq.Editor.getBlockProperties(
      currentBlock!.uuid
    );

    if (currentBlockContent) {
      if (Object.keys(currentBlockProperties).length === 0) {
        sendTaskToTodoist.sendTaskOnlyToTodoist(currentBlockContent);
        logseq.App.showMsg(`
          [:div.p-2
            [:h1 "Task (without priority) sent to your Todoist Inbox!"]
            [:h2.text-xl "${currentBlockContent}"]]`);
      } else {
        const contentWithoutPriority = currentBlockContent.substring(
          0,
          currentBlockContent.indexOf('\n')
        );
        sendTaskToTodoist.sendTaskAndPriorityToTodist(
          contentWithoutPriority,
          parseInt(currentBlockProperties.priority)
        );
        logseq.App.showMsg(`
          [:div.p-2
              [:h1 "Task (with priority) sent to your Todoist Inbox!"]
            [:h2.text-xl "${contentWithoutPriority}"]]
        `);
      }
    } else {
      logseq.App.showMsg(
        'Please use this command at the end of writing out your task'
      );
    }
  });

  logseq.Editor.registerSlashCommand('todoist - pull tasks', async () => {
    let tasksWithPrefix = await handleTasks.handleTasksWithPrefix();
    let tasksWithoutPrefix = await handleTasks.handleTasksWithoutPrefix();

    if (
      tasksWithPrefix?.withPrefixArr.length === 0 &&
      tasksWithoutPrefix?.withoutPrefixArr.length === 0
    ) {
      logseq.App.showMsg('There are no tasks in your indicated projects.');
      return;
    } else if (tasksWithPrefix && tasksWithoutPrefix) {
      // Insert header block
      let currBlock = await logseq.Editor.getCurrentBlock();
      await logseq.Editor.updateBlock(currBlock!.uuid, '[[Tasks Inbox]]');

      let tasksContentArr = [
        ...tasksWithPrefix.withPrefixArr,
        ...tasksWithoutPrefix.withoutPrefixArr,
      ];

      let tasksIdArr = [
        ...tasksWithPrefix.tasksIdWithPrefixArr,
        ...tasksWithoutPrefix.tasksIdWithoutPrefixArr,
      ];

      try {
        if (currBlock) {
          // Insert tasks below header block
          await logseq.Editor.insertBatchBlock(
            currBlock.uuid,
            tasksContentArr,
            {
              sibling: !parent,
              before: true,
            }
          );
        }
      } catch (e) {
        logseq.App.showMsg(
          'There is an error inserting your tasks. No tasks have been removed from Todoist.'
        );
        return;
      }

      try {
        // Mark tasks as complete in Todoist
        for (let i of tasksIdArr) {
          console.log(`Clearing ${i}`);
          await axios({
            url: `https://api.todoist.com/rest/v1/tasks/${i}/close`,
            method: 'POST',
            headers: {
              Authorization: `Bearer ${logseq.settings?.apiToken}`,
            },
          });
        }
      } catch (e) {
        logseq.App.showMsg(
          'There is an error removing your tasks from Todoist. Please remove them directly from Todoist.'
        );
        return;
      }
    }
  });

  const createModel = () => {
    return {
      show() {
        logseq.showMainUI();
      },
    };
  };

  logseq.provideModel(createModel());

  // Register UI
  logseq.App.registerUIItem('toolbar', {
    key: 'logseq-todoist-plugin',
    template: `
        <a data-on-click="show"
          class="button">
          <i class="ti ti-checkbox"></i>
        </a>
  `,
  });
};

logseq.ready(main).catch(console.error);
