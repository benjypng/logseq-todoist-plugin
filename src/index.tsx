import "@logseq/libs";
import React from "react";
import ReactDOM from "react-dom";
import "./App.css";
import SendTask from "./components/SendTask";
import generateUniqueId from "./utils/generateUniqueId";
import handleListeners from "./utils/handleListeners";
import { getIdFromString } from "./utils/parseStrings";
import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";
import { TodoistApi } from "@doist/todoist-api-typescript";
import { callSettings } from "./settings";
import { retrieveTasks } from "./features/retrieve";

const main = async () => {
  console.log("logseq-todoist-plugin loaded");
  handleListeners();
  await callSettings();

  // RETRIEVE TASKS
  logseq.Editor.registerSlashCommand("Todoist: Retrieve Tasks", async (e) => {
    await retrieveTasks(e.uuid);
  });
  logseq.Editor.registerSlashCommand(
    "Todoist: Retrieve Today's Tasks",
    async (e) => {
      await retrieveTasks(e.uuid, "today");
    },
  );
  logseq.Editor.registerSlashCommand(
    "Todoist: Retrieve Custom Filter",
    async (e) => {
      const content = await logseq.Editor.getEditingBlockContent();
      await retrieveTasks(e.uuid, content);
    },
  );

  // // SEND TASKS
  //
  // // EXECUTE INLINE FILTER
  // logseq.Editor.registerSlashCommand(
  //     "Todoist: Execute inline filter",
  //     async function (e) {
  //         let content: string = (
  //             await logseq.Editor.getEditingBlockContent()
  //         ).trim();
  //
  //         if (content === "") {
  //             logseq.UI.showMsg("Filter cannot be empty!", "error");
  //             return;
  //         }
  //         logseq.UI.showMsg(`Todoist filter ${content}`);
  //         await executeFilter(e.uuid, content);
  //     }
  // );
  //
  // // SEND TASK
  // logseq.Editor.registerSlashCommand("Todoist: Send Task", async function (e) {
  //     const {sendDefaultProject, sendDefaultLabel, sendDefaultDeadline} =
  //         logseq.settings!;
  //     let content: string = (await logseq.Editor.getEditingBlockContent()).trim();
  //
  //     if (content === "") {
  //         logseq.UI.showMsg("Task cannot be empty!", "error");
  //         return;
  //     }
  //
  //     if (
  //         sendDefaultProject === "--- ---" ||
  //         sendDefaultProject === "" ||
  //         sendDefaultLabel === "--- ---" ||
  //         sendDefaultLabel === "" ||
  //         sendDefaultDeadline
  //     ) {
  //         ReactDOM.render(
  //             <React.StrictMode>
  //                 <SendTask content={content} uuid={e.uuid}/>
  //             </React.StrictMode>,
  //             document.getElementById("app")
  //         );
  //         logseq.showMainUI();
  //     } else {
  //         await sendTaskToTodoist(
  //             e.uuid,
  //             content,
  //             getIdFromString(sendDefaultProject),
  //             getIdFromString(sendDefaultLabel),
  //             sendDefaultDeadline ? "today" : ""
  //         );
  //     }
  // });
  //
  // // PULL TASKS
  // logseq.Editor.registerSlashCommand(
  //     "Todoist: Retrieve Tasks",
  //     async function (e) {
  //         await retrieveTasks(e, {
  //             projectId: getIdFromString(logseq.settings!.retrieveDefaultProject),
  //         });
  //     }
  // );
  //
  // // PULL TODAY's TASKS
  // logseq.Editor.registerSlashCommand(
  //     "Todoist: Retrieve Today's Tasks",
  //     async function (e) {
  //         await retrieveTasks(e, {filter: "today"});
  //     }
  // );
  //
  // // KEEP IN SYNC
  // logseq.Editor.registerSlashCommand(
  //     "Todoist: Insert sync block",
  //     async function () {
  //         logseq.UI.showMsg("Please wait", "warning");
  //
  //         await logseq.Editor.insertAtEditingCursor(
  //             `{{renderer :todoistsync_${generateUniqueId()}}}`
  //         );
  //     }
  // );
  //
  // logseq.App.onMacroRendererSlotted(async function ({slot, payload}) {
  //     const api = new TodoistApi(logseq.settings!.apiToken);
  //     const [type] = payload.arguments;
  //     if (!type.startsWith(":todoistsync_")) return;
  //     let blk = await logseq.Editor.getBlock(payload.uuid, {
  //         includeChildren: true,
  //     });
  //     for (const child of blk!.children! as BlockEntity[]) {
  //         if (!child.properties!.todoistid) {
  //             console.log(child);
  //         }
  //     }
  //
  //     logseq.provideModel({
  //         async todoistSync() {
  //             if (blk!.children!.length === 0) {
  //                 await retrieveTasks(payload, {});
  //             } else {
  //                 for (const child of blk!.children! as BlockEntity[]) {
  //                     await logseq.Editor.removeBlock(child.uuid);
  //                 }
  //                 await retrieveTasks(payload, {});
  //             }
  //
  //             blk = await logseq.Editor.getBlock(payload.uuid, {
  //                 includeChildren: true,
  //             });
  //             for (const child of blk!.children! as BlockEntity[]) {
  //                 logseq.DB.onBlockChanged(child.uuid, async function (e) {
  //                     if (e.marker === "DONE") {
  //                         await api.closeTask(e.properties!.todoistid.toString());
  //                     } else if (e.marker === "TODO") {
  //                         await api.reopenTask(e.properties!.todoistid.toString());
  //                     }
  //                 });
  //             }
  //         },
  //     });
  //
  //     logseq.provideUI({
  //         key: "logseq-todoist-plugin",
  //         reset: true,
  //         slot,
  //         template: `<button class="px-2 py-0 rounded-md bg-red-600 text-white" data-on-click="todoistSync">Todoist Sync</button>`,
  //     });
  // });
};

logseq.ready(main).catch(console.error);
