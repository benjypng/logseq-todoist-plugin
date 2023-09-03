import { getAllLabels, getAllProjects } from "../../services/todoistHelpers";

import "./send-task.css";

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
  const handleSubmit = async () => {
    await logseq.Editor.updateBlock(uuid, "HELLO WORLD");
  };

  return (
    <div className="flex justify-end p-3" tabIndex={-1}>
      <div className="absolute top-10 card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Sending {content}</h2>
          <div className="form-control w-full max-w-xs">
            <label className="label">
              <span className="label-text">Select a project</span>
            </label>
            <select className="select select-bordered">
              {projects && projects.map((p) => <option>{p}</option>)}
            </select>

            <label className="label">
              <span className="label-text">Select a label</span>
            </label>
            <select className="select select-bordered">
              {labels && labels.map((p) => <option>{p}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
