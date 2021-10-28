# Overview

This simple plugin pulls the active tasks from a selected Project of your choice (as indicated in your .env file). I created this plugin as my workflow includes using Todoist as a Quick Capture tool, and Logseq as my main todo manager.

Refer to the [Todoist API](https://developer.todoist.com/rest/v1/#overview) page for the full list of REST APIs if you want to add your own functionalities.

I hope to be able to expand on this project when I have the time.

# Instructions

1. Go to https://developer.todoist.com/appconsole.html and create an App. You will need to create an App (give it any name you like), and you will be able to obtain a **test token**. Note down the test token as this is the API Token that you will need in Step 7.
2. Login to your Todoist (on the web) and navigate to the Project page that you would like to retrieve into Logseq. Note down the number found in the URL, as this is the Project ID that you will need in Step 7.
   ![image](/screenshots/todoist-url.png)
3. Download the release [here](https://github.com/hkgnp/logseq-todoist-plugin-ts/releases/).
4. Extract the zip file to a folder of your choice. You will need to locate this folder later when you are adding the plugin in Logseq. If you are publishing to Github, ensure that this folder is not going to be published as it will contain your Token credentials.
5. Using the Terminal, go to the root folder (where you can find package.json), and run `npm install`. This will install the necessary packages for the plugin.
6. In the same root folder (where you can find package.json), create a file called `.env` using your favourite text editor. Ensure that there is no file extension and the `.env` file is in the same folder as your package.json.
7. In the `.env` file, add in the following and save the file..
   ```
   API_TOKEN=<Insert token number you got from Step 1>
   PROJECT_ID=<Insert Project ID (in Step 2) of the project you would like to pull the tasks from>
   ```
   Your env file should look like the below:
   ![image](/screenshots/sample-env.png)
8. Go to Logseq and ensure that you have Developer mode enabled, before going to the Plugins page.
9. Click "Load unpacked plugin", and navigate to the folder in (2) and click open.
10. An icon will appear in the usual plugins bar. Navigate to a journal page, and click the button. There may be a delay as the API needs to call your tasks from Todoist. This plugin will not be able to be used on non-journal pages.

# Future Enhancements

Please let me know what functionalities you would like to add in Logseq's Discord channel. I hope to add the following:

- Proper settings page instead of needing to create a `.env` file.
- Including slash commands.
- Tasks added via this plugin will be marked as completed in Todoist.
