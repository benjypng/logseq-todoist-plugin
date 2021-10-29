import '@logseq/libs';
import axios from 'axios';
import env from './endpoints.config';
import handleTasks from './handle-tasks';

const main = async () => {
  console.log('Plugin loaded');

  logseq.provideModel({
    pullActiveTaks: async () => {
      // Get current page
      let currentPage = await logseq.Editor.getCurrentPage();

      // Check currentPage so error message shows on homepage and check journal so error message shows on pages
      if (currentPage && currentPage['journal?'] == true) {
        // Insert header block
        let targetBlock = await logseq.Editor.insertBlock(
          currentPage.name,
          '[[Tasks Inbox]]',
          {
            isPageBlock: true,
          }
        );

        let tasksWithPrefix = await handleTasks.handleTasksWithPrefix();
        let tasksWithoutPrefix = await handleTasks.handleTasksWithoutPrefix();

        if (
          !tasksWithPrefix.tasksIdWithPrefixArr &&
          !tasksWithoutPrefix.tasksIdWithoutPrefixArr
        ) {
          logseq.App.showMsg(
            'There are no tasks in your indicated project(s).'
          );
          return;
        } else {
          let tasksContentArr = [
            ...tasksWithPrefix.withPrefixArr,
            ...tasksWithoutPrefix.withoutPrefixArr,
          ];
          let tasksIdArr = [
            ...tasksWithPrefix.tasksIdWithPrefixArr,
            ...tasksWithoutPrefix.tasksIdWithoutPrefixArr,
          ];

          try {
            // Insert tasks below header block
            await logseq.Editor.insertBatchBlock(
              targetBlock.uuid,
              tasksContentArr,
              {
                sibling: !parent,
                before: true,
              }
            );
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
        logseq.App.showMsg('This function is only available on a Journal page');
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
