import { Task } from "@doist/todoist-api-typescript";
import axios from "axios";
import { insertTasks } from "../retrieve";
import { BlockEntity, IDatom } from "@logseq/libs/dist/LSPlugin";

export const syncTasks = async () => {
  try {
    const response = await axios({
      method: "post",
      url: "https://api.todoist.com/sync/v9/sync",
      headers: {
        Authorization: `Bearer ${logseq.settings?.apiToken}`,
        "Content-Type": `application/x-www-form-urlencoded`,
      },
      data: {
        sync_token: logseq.settings?.syncToken,
        resource_types: '["all"]',
      },
    });

    const results = response.data;
    logseq.updateSettings({
      syncToken: results.sync_token,
    });
    return results;
  } catch (e) {
    console.error(e);
  }
};

export const handleSyncPage = async () => {
  const { syncPage } = logseq.settings!;
  const syncObj = await syncTasks();
  const allTasks: Task[] = syncObj.items;

  // Create page
  let page = await logseq.Editor.getPage(syncPage.toLowerCase());
  if (!page) {
    page = await logseq.Editor.createPage(
      syncPage,
      {},
      { redirect: false, createFirstBlock: false },
    );
  }

  // Handle no tasks retrieved
  if (allTasks.length === 0) {
    await logseq.UI.showMsg("There are no tasks");
    return;
  }

  // Insert tasks
  const batchBlock = await insertTasks(allTasks);
  await logseq.Editor.insertBatchBlock(page!.uuid, batchBlock);

  const pbt = await logseq.Editor.getPageBlocksTree(page!.uuid);
  for (const { uuid } of pbt) {
    logseq.DB.onBlockChanged(uuid, async (block) => {
      if (block.marker === "DONE") {
        const response = await axios({
          method: "post",
          url: "https://api.todoist.com/sync/v9/sync",
          headers: {
            Authorization: `Bearer ${logseq.settings?.apiToken}`,
          },
          data: {
            sync_token: logseq.settings?.syncToken,
            resource_types: ["items"],
            commands: [
              {
                type: "item_complete",
                uuid: block.uuid,
                args: { id: block.properties?.todoistid },
              },
            ],
          },
        });
        console.log(response.data);
      }
    });
  }
};
