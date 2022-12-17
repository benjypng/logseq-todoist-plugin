export default function handleListeners() {
  //ESC
  document.addEventListener(
    "keydown",
    function (e) {
      if (e.key === "Escape") {
        logseq.hideMainUI({ restoreEditingCursor: true });
      }
      e.stopPropagation();
    },
    false
  );

  // Click
  document.addEventListener("click", (e) => {
    if (!(e.target as HTMLElement).closest("body")) {
      logseq.hideMainUI({ restoreEditingCursor: true });
    }
    e.stopPropagation();
  });
}
