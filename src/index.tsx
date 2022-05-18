import "@logseq/libs";
import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";
import { callSettings } from "./callSettings";
import { handleClosePopup } from "./handleClosePopup";
import { insertTasksIntoLogseq } from "./helpersLogseq";
import { sendTask } from "./sendTask";

const main = async () => {
  console.log("logseq-todoist-plugin loaded");

  callSettings();

  handleClosePopup();

  // Register push command
  logseq.Editor.registerSlashCommand("todoist - send task", async (e) => {
    const currBlk = (await logseq.Editor.getBlock(e.uuid)) as BlockEntity;
    window.setTimeout(function () {
      sendTask(currBlk.content, currBlk.uuid);
    }, 100);
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
};

logseq.ready(main).catch(console.error);
