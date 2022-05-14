import {
  clearTasks,
  getIdFromProjectAndLabel,
  pullTasks,
} from "./helpersTodoist";

export async function insertTasksIntoLogseq(todayOrNot?: string) {
  const tasksContentArr = await pullTasks(
    getIdFromProjectAndLabel(logseq.settings!.pullDefaultProject) ?? "",
    todayOrNot
  );

  if (tasksContentArr.tasksArr.length === 0) {
    logseq.App.showMsg("There are no tasks in your indicated projects.");
    return;
  } else {
    // Insert header block
    let currBlock = await logseq.Editor.getCurrentBlock();

    try {
      if (currBlock) {
        // Insert tasks below header block
        await logseq.Editor.insertBatchBlock(
          currBlock.uuid,
          tasksContentArr.tasksArr,
          {
            sibling: true,
            before: false,
          }
        );

        await logseq.Editor.exitEditingMode();
      }
    } catch (e) {
      logseq.App.showMsg(
        "There is an error inserting your tasks. No tasks have been removed from Todoist."
      );
      return;
    }

    await logseq.Editor.exitEditingMode();

    if (logseq.settings?.clearTasks) {
      try {
        // Mark tasks as complete in Todoist
        console.log(tasksContentArr.tasksIdArr);
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
