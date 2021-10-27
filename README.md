# Overview

This simple plugin pulls the active tasks from a selected Project of your choice (as indicated in your .env file). I created this plugin as my workflow includes using Todoist as a Quick Capture tool, and Logseq as my main todo manager.

Refer to the [Todoist API](https://developer.todoist.com/rest/v1/#overview) page for the full list of REST APIs if you want to add your own functionalities.

I hope to be able to expand on this project when I have the time.

# Instructions

1. Go to https://developer.todoist.com/appconsole.html and create an App. You will need to create an App (give it any name you like), and you will be able to obtain a **test token**. Copy this test token down somewhere.
2. Download the release [here](https://github.com/hkgnp/logseq-todoist-plugin-ts/releases/tag/v0.1).
3. Extract the zip file to a folder of your choice. You will need to locate this folder later when you are adding the plugin in Logseq.
4. Go to the root folde (where you can find package.json), run 'npm install', and create a file called `.env` using your favourite text editor. Ensure that there is no file extension and the .env file is in the same folder as your package.json. 
5. In the `.env` file, add in the following and save the file. If you are unable to locate the Project ID, please wait while I update the instructions again.
   ```
   API_TOKEN=<Insert token number you got from Step 1>
   PROJECT_ID=<Insert Project ID of the project you would like to pull the tasks from>
   ```
6. Go to Logseq and ensure that you have Developer mode enabled, before going to the Plugins page.
7. Click "Load unpacked plugin", and navigate to the folder in (2) and click open.
8. An icon will appear in the usual plugins bar. Navigate to a journal page, and click the button. There may be a delay as the API needs to call your tasks from Todoist. This plugin will not be able to be used on non-journal pages.

# Future Enhancements

Please let me know what functionalities you would like to add in Logseq's Discord channel. I hope to add the following:

- Proper settings page instead of needing to create a `.env` file.
- Including slash commands.
- Tasks added via this plugin will be marked as completed in Todoist.
