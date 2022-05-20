import "@logseq/libs";
import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";
import { callSettings } from "./callSettings";
import { handleClosePopup } from "./handleClosePopup";
import { insertTasksIntoLogseq } from "./helpersLogseq";
import {
  getIdFromProjectAndLabel,
  removePrefix,
  sendTaskFunction,
} from "./helpersTodoist";
import { sendTask } from "./sendTask";

const main = async () => {
  console.log("logseq-todoist-plugin loaded");

  callSettings();

  handleClosePopup();

  // Register push command
  logseq.Editor.registerSlashCommand("todoist - send task", async (e) => {
    const {
      sendDefaultProject,
      sendDefaultLabel,
      sendDefaultDeadline,
      appendLogseqUri,
      appendTodoistUrl,
    } = logseq.settings!;

    const currBlk = (await logseq.Editor.getBlock(e.uuid)) as BlockEntity;

    await new Promise((r) => setTimeout(r, 2000));

    if (!sendDefaultProject && !sendDefaultLabel && !sendDefaultDeadline) {
      await sendTask(currBlk.content, currBlk.uuid);
    } else {
      let data: {
        content: string;
        project_id?: number;
        due_string?: string;
        label_ids?: number[];
      } = {
        content: appendLogseqUri
          ? `[${removePrefix(
              currBlk.content
            )}](logseq://graph/logseq?block-id=${currBlk.uuid})`
          : removePrefix(currBlk.content),
      };
      if (sendDefaultProject && sendDefaultProject !== "---")
        data["project_id"] = parseInt(
          getIdFromProjectAndLabel(sendDefaultProject) as string
        );
      if (sendDefaultDeadline) data["due_string"] = "today";
      if (sendDefaultLabel && sendDefaultLabel !== "---")
        data["label_ids"] = [
          parseInt(getIdFromProjectAndLabel(sendDefaultLabel) as string),
        ];

      const sendResponse = await sendTaskFunction(data);
      if (appendTodoistUrl) {
        await logseq.Editor.updateBlock(
          currBlk.uuid,
          `[${currBlk.content}](${sendResponse.url})`
        );
      }
      window.setTimeout(async function () {
        await logseq.Editor.exitEditingMode();
        logseq.App.showMsg(`
         [:div.p-2
           [:h1 "Task!"]
           [:h2.text-xl "${currBlk.content}"]]`);
      }, 500);
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
};

logseq.ready(main).catch(console.error);
