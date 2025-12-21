# 🧠 logseq-todoist-plugin
![Version](https://img.shields.io/github/v/release/benjypng/logseq-todoist-plugin?style=flat-square&color=0969da) ![Downloads](https://img.shields.io/github/downloads/benjypng/logseq-todoist-plugin/total?style=flat-square&color=orange) ![License](https://img.shields.io/github/license/benjypng/logseq-todoist-plugin?style=flat-square)

> Sync, send and receive tasks to/from Todoist.

---

## ✨ Features
* **Retrieve tasks from Todoist:** Retrieve tasks from a preset project, today's tasks or based on a custom filter.
* **Send tasks to Todoist:** Send tasks to a preset project, or customise where to send it to..
* **Sync tasks with Todoist (beta):** Keep tasks in Logseq and Todoist in sync.

## 📸 Screenshots / Demo
*To be added.*

## ⚙️ Installation
1.  Open Logseq.
2.  Go to the **Marketplace** (Plugins > Marketplace).
3.  Search for **logseq-todoist-plugin**.
4.  Click **Install**.

## 🛠 Usage & Settings

#### API Token
1. Go to https://developer.todoist.com/appconsole.html and create an App. You will need to create an App (give it any name you like), and you will be able to obtain a **test token**. Note down the test token as this is the API Token that you will need in Step 3.
2. In the plugin settings, enter your API token that you obtained in Step 1 as well.

#### Retrieving Tasks
You can retrieve tasks in 3 ways:

- Retrieving tasks from a default project (indicated in plugin settings);
- Retrieving today's tasks, regardless of the project; and
- Retrieving tasks based on a custom filter. Key in the desired filter in any block, and type `/Todoist: Retrieve Custom Filter`

#### Sending Tasks
You can send tasks in 2 ways:

- If you set a default project to send tasks to, just trigger `/Todoist: Send Task` on the block containing the task.
- If no default project is indicated, there will be a popup to specify the necessary parameters.
- You can also choose `/Todoist: Send Task (manual)` to trigger the popup.

#### Syncing Tasks (only for DB graphs)
1. Indicate a sync page in the plugin settings. Only tasks added here will be kept in sync with Todoist. New tasks from Todoist are added here as well.
2. Trigger the command palette (`Mod+Shift+p`) and use the command `Start Todoist Sync Crobjob`. You can also trigger a manual sync if you don't want it to be automated by using `Trigger Todoist Sync`.
3. To stop the automated sync, use `Stop Todoist Sync Crobjob`.
4. Navigate to the page defined in (1), and start adding in tasks there.
5. For now, only task status (Todo, Done) is supported. Other task properties are not supported.

## ☕️ Support
If you enjoy this plugin, please consider supporting the development!

<div align="center">
  <a href="https://github.com/sponsors/benjypng">
    <img src="https://img.shields.io/badge/Sponsor-GitHub-ea4aaa?style=for-the-badge&logo=github" alt="Sponsor on Github" />
  </a>
  <a href="https://www.buymeacoffee.com/hkgnp.dev">
    <img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me a Coffee" />
  </a>
</div>

## 🤝 Contributing
Issues are welcome. If you find a bug, please open an issue. Pull requests are not accepted at the moment as I am not able to commit to reviewing them in a timely fashion.
