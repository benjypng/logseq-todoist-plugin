import React, { useEffect, useState } from "react";
import {
  getAllLabels,
  getAllProjects,
  sendTaskToLogseq,
} from "../services/todoistHelpers";
import getIdFromString from "../utils/getIdFromString";

export default function SendTask(props: { content: string; uuid: string }) {
  const [params, setParams] = useState<{
    project: string;
    label: string;
    deadline: string;
  }>({
    project: "",
    label: "",
    deadline: "",
  });
  const [projects, setProjects] = useState<string[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(function () {
    (async function () {
      setProjects(await getAllProjects());
      setLabels(await getAllLabels());
      setLoaded(true);
    })();
  }, []);

  function handleForm(
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) {
    setParams({ ...params, [e.target.name]: e.target.value });
  }

  function sendTask() {
    const { project, label, deadline } = params;
    sendTaskToLogseq(props.uuid, props.content, project, label, deadline);
    logseq.hideMainUI();
    setParams({
      project: "",
      label: "",
      deadline: "",
    });
  }

  return (
    <div className="flex justify-end p-3" tabIndex={-1}>
      <div className="absolute top-10 bg-white rounded-lg p-3 w-1/3 border text-sm">
        <h1 className="mb-0 text-black text-lg">Send Task</h1>
        <h2 className="mb-3 text-black text-xl">{props.content}</h2>
        {/* Input properties */}
        <p className="mb-3">Send task with the following properties:</p>

        {!loaded && <p className="mb-3">Loading projects and labels...</p>}

        {loaded && (
          <div>
            Project
            <select
              name="project"
              className="px-2 py-1 rounded-md mb-3 w-full h-6 border text-xs"
              onChange={handleForm}
            >
              {projects.map((project) => (
                <option value={getIdFromString(project)}>{project}</option>
              ))}
            </select>
          </div>
        )}

        {loaded && (
          <div>
            Label
            <select
              name="label"
              className="px-2 py-1 rounded-md mb-3 w-full h-6 border text-xs"
              onChange={handleForm}
            >
              {labels.map((label) => (
                <option value={getIdFromString(label)}>{label}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          Deadline
          <input
            id="deadline-field"
            type="text"
            name="deadline"
            placeholder="Enter deadline; accepts Todoist strings, i.e. tomorrow at 12pm"
            className="px-2 py-1 rounded-md mb-3 w-full h-6 border"
            value={params.deadline}
            onChange={handleForm}
          />
        </div>

        <button
          onClick={sendTask}
          className="border border-purple-600 text-black px-1 rounded-md hover:text-white hover:bg-purple-600"
        >
          Send Task
        </button>
      </div>
    </div>
  );
}
