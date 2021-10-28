import '@logseq/libs';
import axios from 'axios';
import env from './endpoints.config';

const main = async () => {
  console.log('Plugin loaded');

  logseq.provideModel({
    pullActiveTaks: async () => {
      // Get current page
      let currentPage = await logseq.Editor.getCurrentPage();

      // Check currentPage so error message shows on homepage and check journal so error message shows on pages
      if (currentPage && currentPage['journal?'] == true) {
        // Get tree
        let pageBlocksTree = await logseq.Editor.getCurrentPageBlocksTree();
        let targetBlock = pageBlocksTree[0];

        // Insert header block
        targetBlock = await logseq.Editor.insertBlock(
          currentPage.name,
          '[[Tasks Inbox]]',
          {
            isPageBlock: true,
          }
        );

        let response;
        let response2;
        try {
          // Get tasks from Todoist for Projects without Prefix
          response = await axios.get('https://api.todoist.com/rest/v1/tasks', {
            params: { project_id: env.projectIdWithoutPrefix },
            headers: {
              Authorization: `Bearer ${env.apiToken}`,
            },
          });

          // Get tasks from Todoist for Projects with Prefix
          response2 = await axios.get('https://api.todoist.com/rest/v1/tasks', {
            params: { project_id: env.projectIdWithPrefix },
            headers: {
              Authorization: `Bearer ${env.apiToken}`,
            },
          });

          console.log(response.data, response2.data);
        } catch (e) {
          logseq.App.showMsg(
            'There is an error retrieving your tasks from Todoist. Please try again later.'
          );
          return;
        }

        if (response.data !== [] || response2.data !== []) {
          // Map only content from tasks to array
          // Map tasks without Prefix
          let withoutPrefixArr = response.data.map((t) => ({
            content: `TODO ${t.content}`,
          }));

          // Map tasks with Prefix
          let withPrefixArr = response2.data.map((t) => ({
            content: `${t.content}`,
          }));

          let tasksContentArr = [...withoutPrefixArr, ...withPrefixArr];

          // Map id from tasks without Prefix to mark as complete in Todoist
          let tasksIdWithoutPrefixArr = response.data.map((i) => i.id);

          // Map id from tasks with Prefix to mark as complete in Todoist
          let tasksIdWithPrefixArr = response2.data.map((i) => i.id);

          let tasksIdArr = [
            ...tasksIdWithoutPrefixArr,
            ...tasksIdWithPrefixArr,
          ];

          try {
            // Insert tasks below header block
            await logseq.Editor.insertBatchBlock(
              targetBlock.uuid,
              tasksContentArr,
              {
                sibling: false,
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
              console.log(`Clearing ${i} `);
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
        } else {
          logseq.App.showMsg(
            'There are no tasks in your designated Project on Todoist. Please ensure there is at least one task before you click on the plugin button again.'
          );
          return;
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
