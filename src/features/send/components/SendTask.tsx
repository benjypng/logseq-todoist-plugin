import "./tailwind.css";

import { useState } from "preact/hooks";
import { ChangeEvent } from "react";

import { getIdFromString, getNameFromString } from "../../helpers";
import { sendTask } from "..";

export const SendTask = ({
  projects,
  labels,
  content,
  uuid,
}: {
  projects: string[];
  labels: string[];
  content: string;
  uuid: string;
}) => {
  const [projectId, setProjectId] = useState<string>("");
  const [label, setLabel] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");

  const handleSubmit = async (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendTask(
      uuid,
      content,
      getIdFromString(projectId),
      deadline,
      getNameFromString(label),
    );
    setProjectId("");
    setLabel("");
    setDeadline("");
    logseq.hideMainUI();
  };

  return (
    <div className="flex h-screen justify-end" tabIndex={-1}>
      <div className="sendPopup flex px-3 w-80 items-center bg-gray-50">
        <form className="w-full" onSubmit={handleSubmit}>
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
            Select a Project
            <select
              //@ts-expect-error
              onChange={(ev) => setProjectId(ev.target.value)}
              name="projectId"
              className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            >
              {projects.map((p) => (
                <option>{p}</option>
              ))}
            </select>
          </label>

          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
            Select a Label
            <select
              //@ts-expect-error
              onChange={(ev) => setLabel(ev.target.value)}
              name="label"
              className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            >
              {labels.map((l) => (
                <option>{l}</option>
              ))}
            </select>
          </label>

          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
            Set a Deadline
            <input
              //@ts-expect-error
              onChange={(ev) => setDeadline(ev.target.value)}
              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              type="text"
              name="deadline"
            />
          </label>

          <div className="flex justify-end">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Send Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
