export const handlePopups = () => {
  document.addEventListener(
    'keydown',
    function (e) {
      if (e.key === 'Escape') {
        logseq.hideMainUI({ restoreEditingCursor: true })
      }
      e.stopPropagation()
    },
    false,
  )
}
