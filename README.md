[:gift_heart: Sponsor this project on Github](https://github.com/sponsors/hkgnp) or [:coffee: Get me a coffee](https://www.buymeacoffee.com/hkgnp.dev) if you like this plugin!

> This plugin is currently not receiving PRs.
> 2023-09-04: This plugin has just been refactored. Todoist Sync has been removed due to feature instability. A new set of videos for the README will be added at a later date.

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

# Installation

1. Go to https://developer.todoist.com/appconsole.html and create an App. You will need to create an App (give it any name you like), and you will be able to obtain a **test token**. Note down the test token as this is the API Token that you will need in Step 3.

2. Head on to the Marketplace and install the logseq-todoist-plugin.

3. After it is installed, click on the plugin icon and indicate your preferences in the settings. Key in your API token that you obtained in Step 1 as well.

![](/screenshots/enter-variables2.png)

# Development

## First run

1. Clone/fork the repo.
2. Go to the Plugins page on Logseq (`t p`).
3. Uninstall the plugin.
4. Run `npm run build` to build the project.
5. Click on "Load unpacked plugin" and choose the root directory (the one that contains the `dist` dir just created).

## Changes

1. Change the code.
2. Run `npm run build`.
3. Go to the Plugins page on Logseq (`t p`).
4. Click on "Reload".
5. Test your changes.
