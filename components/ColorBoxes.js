import React, { useState } from "react";

function ColorBox({ color }) {
  return (
    <div
      style={{
        width: 100,
        height: 100,
        backgroundColor: color,
        margin: 5,
        display: "inline-block"
      }}
    ></div>
  );
}

function ColorBoxes() {
  const [color, setColor] = useState("red");

  return (
    <div>
      <button onClick={() => setColor("red")}>red</button>
      <button onClick={() => setColor("green")}>green</button>
      <button onClick={() => setColor("blue")}>blue</button>
      <button onClick={() => setColor("yellow")}>yellow</button>

      <div>
        <ColorBox color={color} />
      </div>
    </div>
  );
}

export default ColorBoxes;
