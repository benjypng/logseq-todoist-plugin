import axios from "axios";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

export async function sendTask(content: string) {
  ReactDOM.render(
    <React.StrictMode>
      <App content={content} />
    </React.StrictMode>,
    document.getElementById("app")
  );

  logseq.showMainUI();
}
