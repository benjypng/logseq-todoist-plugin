import '@logseq/libs';
import env from './endpoints.config';
import axios from 'axios';
import handleTasks from './handle-tasks';
import sendTask from './send-task-to-todoist';

const main = async () => {
  console.log('Plugin loaded');

  logseq.Editor.registerSlashCommand('todoist - send task', async () => {
    const currentBlock = await logseq.Editor.getEditingBlockContent();
    if (currentBlock) {
      sendTask.sendToTodoist(currentBlock);
      logseq.App.showMsg(`
        [:div.p-2
          [:h1 "Task sent to your Todoist Inbox!"]
          [:h2.text-xl "${currentBlock}"]]
      `);
    } else {
      logseq.App.showMsg(
        'Please use this command at the end of writing out your task'
      );
    }
  });

  logseq.provideModel({
    pullActiveTaks: async () => {
      // Get current page
      let currentPage = await logseq.Editor.getCurrentPage();

      // Check currentPage so error message shows on homepage and check journal so error message shows on pages
      if (currentPage) {
        let tasksWithPrefix = await handleTasks.handleTasksWithPrefix();
        let tasksWithoutPrefix = await handleTasks.handleTasksWithoutPrefix();

        if (
          tasksWithPrefix?.withPrefixArr.length === 0 &&
          tasksWithoutPrefix?.withoutPrefixArr.length === 0
        ) {
          logseq.App.showMsg(
            'There are no tasks in your indicated project(s).'
          );
          return;
        } else if (tasksWithPrefix && tasksWithoutPrefix) {
          // Insert header block
          let targetBlock = await logseq.Editor.insertBlock(
            currentPage.name,
            '[[Tasks Inbox]]',
            {
              isPageBlock: true,
            }
          );

          let tasksContentArr = [
            ...tasksWithPrefix.withPrefixArr,
            ...tasksWithoutPrefix.withoutPrefixArr,
          ];

          let tasksIdArr = [
            ...tasksWithPrefix.tasksIdWithPrefixArr,
            ...tasksWithoutPrefix.tasksIdWithoutPrefixArr,
          ];

          try {
            if (targetBlock) {
              // Insert tasks below header block
              await logseq.Editor.insertBatchBlock(
                targetBlock.uuid,
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
                  Authorization: `Bearer ${env.apiToken}`,
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
      } else {
        // Display error message if trying to add reflection on non-Journal page
        logseq.App.showMsg(
          'This function is not available on the home page. Please try it on a Journal page or a regular page.'
        );
      }
    },
  });

  // Register UI
  logseq.App.registerUIItem('toolbar', {
    key: 'logseq-todoist-plugin',
    template: `
        <a data-on-click="pullActiveTaks"
          class="button">
          <i class="ti ti-checkbox"></i>
        </a>
  `,
  });
};

logseq.ready(main).catch(console.error);
