import React, {useState} from "react";


function PostApp() {
    const [thich1, setThich1] = useState(0);
    const [kothich1, setKothich1] = useState(0);

    const [thich2, setThich2] = useState(0);
    const [kothich2, setKothich2] = useState(0);

    const [thich3, setThich3] = useState(0);
    const [kothich3, setKothich3] = useState(0);
  return (
    <div>
        <p>Bài 4: Like/Dislike Post</p>

        <div style={{border: "1px solid gray", padding: 10, marginBottom: 10}}>
        <p>"Học ReactJS có khó không?"</p>
        <button onClick={() => setThich1(thich1 + 1)}>👍 {thich1}</button>
        <button onClick={() => setKothich1(kothich1 + 1)}>👎 {kothich1}</button>
        </div>

        <div style={{border: "1px solid gray", padding: 10, marginBottom: 10}}>
        <p>"Props và State là gì?"</p>
        <button onClick={() => setThich2(thich2 + 1)}>👍 {thich2}</button>
        <button onClick={() => setKothich2(kothich2 + 1)}>👎 {kothich2}</button>
        </div>

        <div style={{border: "1px solid gray", padding: 10, marginBottom: 10}}>
        <p>"Lập trình web có vui không?"</p>
        <button onClick={() => setThich3(thich3 + 1)}>👍 {thich3}</button>
        <button onClick={() => setKothich3(kothich3 + 1)}>👎 {kothich3}</button>
        </div>

    </div>
  );
}

export default PostApp;
