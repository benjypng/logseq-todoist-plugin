import '@logseq/libs';
import axios from 'axios';
require('dotenv').config();

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

        // Get tasks from Todoist
        let response = await axios.get(
          'https://api.todoist.com/rest/v1/tasks',
          {
            params: { project_id: process.env.PROJECT_ID },
            headers: {
              Authorization: `Bearer ${process.env.API_TOKEN}`,
            },
          }
        );
        console.log(response.data);
        // Map only content from tasks to array
        let tasksContentArr = response.data.map((t) => ({
          content: `TODO ${t.content}`,
        }));

        // Map id from tasks to mark as complete in Todoist
        let tasksIdArr = response.data.map((i) => i.id);

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
                Authorization: `Bearer ${process.env.API_TOKEN}`,
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
