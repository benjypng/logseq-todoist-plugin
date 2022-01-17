> In v3.0, you no longer need to obtain the actual Project ID and can just select your desired project from the dropdown list!

<a href="https://www.buymeacoffee.com/hkgnp.dev" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/arial-violet.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

# Overview

This simple plugin has 2 primary functions:

# Sending of tasks to your Inbox in Todoist

This function allows you to quickly send a task to your Inbox in Todoist.

**Sending a task without priority**
![](/screenshots/send-task-todoist.gif)

**Sending a task with priority**

By including a block attribute when composing your task, you are able to send a task to todoist with priority.

```
Do this task
priority:: 4
```

_Optional: You can also specify the project that you want all tasks to be sent to, and label that you want attached to these tasks._

# Pulling in of tasks

**Pulling tasks from specific projects**

![](/screenshots/pull-tasks-todoist.gif)

This function pulls the active tasks (and their sub-tasks as separate, child-blocks) from a selected Project of your choice (as indicated in your settings file). I created this plugin as my workflow includes using Todoist as a Quick Capture tool, and Logseq as my main todo manager. As a result, once the tasks are captured in Logseq, they are removed from Todoist. If the task or sub-task contains a description, it will be included as well. This plugin can be used on all pages except the home page.

I've included a functionality where you can either:

1. Have `TODO` added to the task when you import them into Logseq.

or

2. Include them in Todoist itself before you import them. This gives you the flexibility of adding other attributes such as NOW, WAITING, etc. on Todoist, or even setting it as a Logseq page before it gets imported.

or

3. Both.

**Pulling tasks that are due TODAY, regardless of projects**

Instead of pulling tasks from specific projects, you can pull tasks that are due TODAY, by using the command `/pull today`.

**Scheduled Tasks**

![](/screenshots/scheduled.png)

## Installation (for v2 - when you install from marketplace from 7 Nov 2021 onwards)

1. Go to https://developer.todoist.com/appconsole.html and create an App. You will need to create an App (give it any name you like), and you will be able to obtain a **test token**. Note down the test token as this is the API Token that you will need in Step 3.

2. Head on to the Marketplace and install the logseq-todoist-plugin.

3. After it is installed, click on the plugin icon and indicate your preferences in the settings. Key in your API token that you obtained in Step 1 as well.

   ![](/screenshots/enter-variables2.png)

4. After saving your preferences, you can start using the plugin by using the slash commands: `/pull today's tasks` or `/pull tasks` or `/send tasks`.

   ![](/screenshots/pull-tasks.png)

## Installation (when you install from marketplace before 7 Nov 2021)

1. Go to https://developer.todoist.com/appconsole.html and create an App. You will need to create an App (give it any name you like), and you will be able to obtain a **test token**. Note down the test token as this is the API Token that you will need in Step 7.
2. Login to your Todoist (on the web). Identify the project that you would like to bring in the tasks from. Navigate to that project's page. Note down the number found in the URL, as this is the Project ID that you will need in Step 7.

   ![image](/screenshots/todoist-url.png)

3. Head on to the Marketplace and install the logseq-todoist-plugin.
4. After it is installed, go to your Installed tab and access the plugin's settings by clicking `Open settings`. An empty text file would open.

   ![](/screenshots/plugin-settings.png)

5. Depending on how you would want to use the plugin, you would need to have different settings.
   - If you want to include the prefix (e.g. NOW, LATER, WAITING) in Todoist **before** you import into Logseq, you would only use `projectIdWithPrefix`.
   - If you want the `TODO` prefix to be automatically added **after** you import into Logseq, you would only use `projectIdWithoutPrefix`.
   - If you want both, use `projectIdWithPrefix` and `projectIdWithoutPrefix`.
6. After deciding on how you want to use the plugin, key in your settings into the file. Please see below for samples.

   ```
   If you want to include the prefix (e.g. NOW, LATER, WAITING) in Todoist **before** you import into Logseq, you would only use `projectIdWithPrefix`.
   {
      "apiToken": "2389asdkjhk921903lkasjd02193",
      "projectIdWithPrefix": "2277097414"
   }

   If you want the `TODO` prefix to be automatically added **after** you import into Logseq, you would only use `projectIdWithoutPrefix`.
   {
      "apiToken": "2389asdkjhk921903lkasjd02193",
      "projectIdWithoutPrefix": "2276796290",
   }

   If you want both, use `projectIdWithPrefix` and `projectIdWithoutPrefix`.
   {
      "apiToken": "2389asdkjhk921903lkasjd02193",
      "projectIdWithoutPrefix": "2276796290",
      "projectIdWithPrefix": "2277097414"
   }
   ```

7. Save the file and close it.
8. Restart Logseq.
9. Click on the icon on the Toolbar to start using it! Please note that the plugin can only be used on journal pages and normal pages, but not the homepage.

# Future Enhancements

Please let me know what functionalities you would like to add in Logseq's Discord channel or in the forums.

## Manual Updating to a new release

After extracting the new zip file, please run `npm run build` again, and reload the plugin in Logseq.

## Manual Installation

1. Go to https://developer.todoist.com/appconsole.html and create an App. You will need to create an App (give it any name you like), and you will be able to obtain a **test token**. Note down the test token as this is the API Token that you will need in Step 7.
2. Login to your Todoist (on the web). Identify the project that you would like to bring in the tasks from. Navigate to that project's page. Note down the number found in the URL, as this is the Project ID that you will need in Step 7.
   ![image](/screenshots/todoist-url.png)
3. Download the release [here](https://github.com/hkgnp/logseq-todoist-plugin-ts/releases/).
4. Extract the zip file to a folder of your choice. You will need to locate this folder later when you are adding the plugin in Logseq. If you are publishing to Github, ensure that this folder is not going to be published as it will contain your Token credentials.
5. In the same root folder (where you can find package.json), create a file called `.env` using your favourite text editor. Ensure that there is no file extension and the `.env` file is in the same folder as your package.json.
6. Depending on how you would like to use the plugin, your `.env` file would look different. See below for examples.

   - If you want to include the prefix (e.g. NOW, LATER, WAITING) in Todoist **before** you import into Logseq, you would only use `PROJECT_ID_WITH_PREFIX`.
   - If you want the `TODO` prefix to be automatically added **after** you import into Logseq, you would only use `PROJECT_ID_WITHOUT_PREFIX`.
   - If you want both, use `PROJECT_ID_WITH_PREFIX` and `PROJECT_ID_WITHOUT_PREFIX`.

   ```
   API_TOKEN=<Insert token number you got from Step 1>

   // For the section below, you can either include both, or fill in only one (see image below for example)

   PROJECT_ID_WITHOUT_PREFIX=<Insert Project ID (in Step 2) of the project you would like to pull the tasks from. These tasks will be given a prefix TODO when importing to Logseq>

   PROJECT_ID_WITH_PREFIX=<Insert Project ID (in Step 2) of the project you would like to pull the tasks from. These tasks will not be given any prefix so you will need to incorporate them inside Todoist itself>
   ```

   Your env file should look like one of the below.

   - Tasks in Project 2345697 will be given the prefix TODO after you import.
   - Tasks in Project 298010283 will not be given any prefix after you import, hence you have the flexibility to add them in Todoist.
     ![image](/screenshots/sample-env.png)

7. **RUN THIS STEP ONLY AFTER YOU CREATED THE `.env` file in Step 6** Using the Terminal, go to the root folder (where you can find package.json), and run `npm install && npm run build`. This will install the necessary packages for the plugin. Please ensure that you already have NodeJS installed, if not, [click here to download](https://nodejs.org/en/download/).
8. Go to Logseq and ensure that you have Developer mode enabled, before going to the Plugins page.
9. Click "Load unpacked plugin", and navigate to the folder in (2) and click open.
10. An icon will appear in the usual plugins bar. Navigate to a journal page, and click the button. There may be a delay as the API needs to call your tasks from Todoist. This plugin will not be able to be used on non-journal pages.
