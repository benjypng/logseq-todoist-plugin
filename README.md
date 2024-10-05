[:gift_heart: Sponsor this project on Github](https://github.com/sponsors/hkgnp) or [:coffee: Get me a coffee](https://www.buymeacoffee.com/hkgnp.dev) if you like this plugin!

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
- You can also choose `/Todoist: Send Task (manual)` to trigger the popup.

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
