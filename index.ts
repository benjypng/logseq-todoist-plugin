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

        try {
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

          // Map only content from tasks to array
          let tasksArr = response.data.map((t) => ({
            content: `TODO ${t.content}`,
          }));

          // Insert tasks below header block
          await logseq.Editor.insertBatchBlock(targetBlock.uuid, tasksArr, {
            sibling: false,
            before: true,
          });
        } catch (e) {
          console.log(e);
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
