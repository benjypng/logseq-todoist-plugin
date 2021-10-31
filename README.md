# Overview

This simple plugin has 2 primary functions:

## Sending of tasks to your Inbox in Todoist

![](/screenshots/send-task-todoist.gif)

This function allows you to quickly send a task to your Inbox in Todoist.

## Pulling in of tasks

![](/screenshots/pull-tasks-todoist.gif)

This function pulls the active tasks (and their sub-tasks as separate, child-blocks) from a selected Project of your choice (as indicated in your .env file). I created this plugin as my workflow includes using Todoist as a Quick Capture tool, and Logseq as my main todo manager. As a result, once the tasks are captured in Logseq, they are removed from Todoist.

This plugin can be used on all pages except the home page.

I've included a functionality where you can either:

1. Have `TODO` added to the task when you import them into Logseq.

or

2. Include them in Todoist itself before you import them. This gives you the flexibility of adding other attributes such as NOW, WAITING, etc. on Todoist, or even setting it as a Logseq page before it gets imported.

or

3. Both.

This is controlled by what you include in your `.env` file, and the Project that you use in Logseq:

- For (1), your `.env` file will only contain `PROJECT_ID_WITHOUT_PREFIX`.
- For (2), your `.env` file will only contain `PROJECT_ID_WITH_PREFIX`.
- For (3), your `.env` file will contain both variables above.

Big thanks to [Todoist](https://developer.todoist.com/rest/v1/#overview) for adding in their REST APIs on top of their SYNC APIs!

# Updating to a new release

After extracting the new zip file, please run `npm run build` again, and reload the plugin in Logseq.

# Installation

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

# Future Enhancements

Please let me know what functionalities you would like to add in Logseq's Discord channel or in the forums.
