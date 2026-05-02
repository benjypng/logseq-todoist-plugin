export type ToolbarIconState = 'off' | 'on' | 'syncing' | 'error'

export const updateToolbarIcon = (state: ToolbarIconState) => {
  const templates = {
    off: `<a class="button"><span class="todoist-sync-icon">T</span></a>`,
    on: `<a class="button"><span class="todoist-sync-icon on">T</span></a>`,
    syncing: `<a class="button"><span class="todoist-sync-icon syncing">T</span></a>`,
    error: `<a class="button"><span class="todoist-sync-icon error">T</span></a>`,
  } as const
  logseq.App.registerUIItem('toolbar', {
    key: 'logseq-todoist-plugin-sync-status',
    template: templates[state],
  })
}

export const provideToolbarStyles = () => {
  logseq.provideStyle(`
    .todoist-sync-icon {
      font-weight: bold;
      font-size: 16px;
      display: inline-block;
    }
    .todoist-sync-icon.on {
      color: #4caf50;
    }
    .todoist-sync-icon.syncing {
      color: #4caf50;
      animation: todoist-spin 1s linear infinite;
    }
    .todoist-sync-icon.error {
      color: #f44336;
    }
    @keyframes todoist-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `)
}
