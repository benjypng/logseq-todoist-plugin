import React, { useState } from "react";

export default function SendTask() {
  const [params, setParams] = useState<string>("");

  return (
    <div className="flex justify-end p-3" tabIndex={-1}>
      <div className="absolute top-10 bg-white rounded-lg p-3 w-1/3 border text-sm">
        <h1 className="mb-3 text-black text-xl">Send Task</h1>
      </div>
    </div>
  );
}
