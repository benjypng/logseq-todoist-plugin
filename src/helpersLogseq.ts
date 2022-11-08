import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";
import { clearTasks, getProjectName, pullTasks } from "./helpersTodoist";

export async function insertTasksIntoLogseq(condition: string) {
  let tasksContentArr: { tasksArr: any[]; tasksIdArr: any[] };

  if (condition !== "today" && logseq.settings!.pullDefaultProject === "---") {
    logseq.App.showMsg(
      "Please choose a default project when using this command, or use Pull today's tasks instead.",
      "error"
    );
    return;
  }

  tasksContentArr = await pullTasks(condition);

  if (tasksContentArr.tasksArr.length === 0) {
    logseq.App.showMsg(
      "There are no tasks in your indicated projects.",
      "error"
    );
    return;
  } else {
    const currBlk = (await logseq.Editor.getCurrentBlock()) as BlockEntity;

    if (condition !== "today") {
      if (logseq.settings!.addParentBlock) {
        const projectNameBlk = await logseq.Editor.insertBlock(
          currBlk!.uuid,
          `[[${await getProjectName(condition)}]]`,
          { sibling: true }
        );
        await logseq.Editor.insertBatchBlock(
          projectNameBlk!.uuid,
          tasksContentArr.tasksArr,
          { sibling: false }
        );
      } else {
        await logseq.Editor.insertBatchBlock(
          currBlk!.uuid,
          tasksContentArr.tasksArr,
          { before: false, sibling: true }
        );
      }
    } else {
      if (logseq.settings!.addParentBlock) {
        // Sort tasks by project_id
        // Get unique project ids and create their headers into blocks
        // Sort tasks by project_id
        // Get unique project ids and create their headers into blocks
        // Loop through the array of tasks and create each block individually
        const sortedArr = tasksContentArr.tasksArr.sort(
          (a, b) => a.project_id - b.project_id
        );

        let createdParents = [0];
        let parentBlkUUID = ["0"];

        for (let i of sortedArr) {
          if (i.project_id !== createdParents[createdParents.length - 1]) {
            createdParents.push(i.project_id);

            const parentBlk = await logseq.Editor.insertBlock(
              parentBlkUUID.length === 1
                ? currBlk!.uuid
                : parentBlkUUID[parentBlkUUID.length - 1],
              `[[${await getProjectName(i.project_id)}]]`,
              { sibling: true }
            );

            parentBlkUUID.push(parentBlk!.uuid);

            await logseq.Editor.insertBlock(parentBlk!.uuid, i.content, {
              sibling: false,
            });
          } else {
            await logseq.Editor.insertBlock(
              parentBlkUUID[parentBlkUUID.length - 1],
              i.content,
              { sibling: false }
            );
          }
        }
      } else {
        await logseq.Editor.insertBatchBlock(
          currBlk!.uuid,
          tasksContentArr.tasksArr,
          { before: false, sibling: true }
        );
      }
    }

    await logseq.Editor.removeBlock(currBlk.uuid);

    if (logseq.settings?.clearTasks) {
      try {
        // Mark tasks as complete in Todoist
        clearTasks(tasksContentArr.tasksIdArr);
      } catch (e) {
        logseq.App.showMsg(
          "There is an error removing your tasks from Todoist. Please remove them directly from Todoist."
        );
        return;
      }
    }
  }
}
