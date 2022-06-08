import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

export async function sendTask(content: string, uuid: string, graphName: string) {
  ReactDOM.render(
    <React.StrictMode>
      <App content={content} uuid={uuid} graphName={graphName}/>
    </React.StrictMode>,
    document.getElementById("app")
  );

  logseq.showMainUI();
}
