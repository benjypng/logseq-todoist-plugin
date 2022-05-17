import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

export async function sendTask(content: string, uuid: string) {
  ReactDOM.render(
    <React.StrictMode>
      <App content={content} uuid={uuid} />
    </React.StrictMode>,
    document.getElementById("app")
  );

  logseq.showMainUI();
}
