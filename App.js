
import React from "react";
import TodoList from "./components/TodoList";
import ColorBoxes from "./components/ColorBoxes";
import Giohang from "./components/Giohang"
import PostApp from "./components/Post"
import Quiz from "./components/Quiz"
function App() {
  return (
    <div>
      <p>Bai1:</p>
    <TodoList/>

    <p>Bai2:</p>
    <ColorBoxes/>

    <p>Bai3:</p>
    <Giohang/>

    <PostApp/>

    <p>Bai5:</p>
    <Quiz/>
    </div>

    
    
  );
}

export default App;
