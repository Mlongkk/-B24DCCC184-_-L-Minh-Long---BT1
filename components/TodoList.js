import React, { useState } from "react";

export default function TodoList() {
  const [task, setTask] = useState("");
  const [list, setList] = useState([]);

  const addTask = () => {
    if (task.trim() !== "") {
      setList([...list, task]);
      setTask("");
    }
  };

  return (
    <div>
      <input
        type="text"
        value={task}
        placeholder="Nhập công việc"
        onChange={(e) => setTask(e.target.value)}
      />
      <button onClick={addTask}>Thêm</button>
      <ul>
        {list.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </div>
  );
}


