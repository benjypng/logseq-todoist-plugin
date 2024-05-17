[:gift_heart: Sponsor this project on Github](https://github.com/sponsors/hkgnp) or [:coffee: Get me a coffee](https://www.buymeacoffee.com/hkgnp.dev) if you like this plugin!

> This plugin is currently not receiving PRs.

> 2023-09-04: This plugin has just been refactored with breaking changes. Versioning for releases has been revamped in favour of `sematic-release`. Todoist Sync has been removed due to feature instability. A new set of videos for the README will be added at a later date.

# Overview

This simple plugin has 2 primary features:

## Retrieving tasks from Todoist.

You can retrieve tasks in 3 ways:

- Retrieving tasks from a default project (indicated in plugin settings);
- Retrieving today's tasks, regardless of the project; and
- Retrieving tasks based on a custom filter. Key in the desired filter in any block, and type `/Todoist: Retrieve Custom Filter`

## Sending tasks to Todoist

You can send tasks in 2 ways:

- If you set a default project to send tasks to, just trigger `/Todoist: Send Task` on the block containing the task.
- If no default project is indicated, there will be a popup to specify the necessary parameters.

## Preferences

The plugin settings page contains other preferences to customise how you want tasks to be retrieved or sent to Todoist.

# Hiding block properties

The plugin automatically creates the following block properties: `todoistid`, `comments`, `atttachments`. If you wish to hide them, you can find the below flag in `config.edn` and make the changes:

```
 ;; hide specific properties for blocks
 ;; E.g. :block-hidden-properties #{:created-at :updated-at}
 :block-hidden-properties #{:todoistid :comments :attachments}
```

# Installation

1. Go to https://developer.todoist.com/appconsole.html and create an App. You will need to create an App (give it any name you like), and you will be able to obtain a **test token**. Note down the test token as this is the API Token that you will need in Step 3.

2. Head on to the Marketplace and install the logseq-todoist-plugin.

3. After it is installed, click on the plugin icon and indicate your preferences in the settings. Key in your API token that you obtained in Step 1 as well.

![](/screenshots/enter-variables2.png)

# Development

## First run

1. Clone/fork the repo.
2. Open a terminal. Run `pnpm --version` and make sure you have version 7 installed (e.g. `7.33.7`).
3. Run `pnpm run build` to build the project.
4. Open Logseq, go to "Settings / Advanced", turn on "Developer mode".
5. Go to the Plugins page (press `t` and `p`).
6. Uninstall `logseq-todoist-plugin`.
7. Click on the "Load unpacked plugin" button and choose the root directory (the one that contains the `dist` dir just created).
8. Go to the plugin settings, paste your Todoist API token and configure other settings as you wish.

## Changes

1. Change the code.
2. Run `pnpm run build`.
3. Go to the Plugins page on Logseq (press `t` and `p`).
4. Click on "Reload".
5. Test your changes.
