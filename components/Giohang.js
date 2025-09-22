import React, { useState } from "react";

export default function Giohang() {
  const [list, setList] = useState([]);
  const [tien, setTien] = useState(0);

  return (
    <div>
        <p>Sách - 10000đ <button onClick={()=>{
        setList([...list, "Sách - 10000đ"], setTien(tien+10000))
      }}>Thêm vào giỏ</button></p>
      

        <p>Bút - 5000đ <button onClick={()=>{
        setList([...list, "Bút - 5000đ"], setTien(tien+5000))
      }}>Thêm vào giỏ</button></p>
      

        <p>Vở - 7000đ <button onClick={()=>{
        setList([...list, "Vở - 7000đ"], setTien(tien+7000))
      }}>Thêm vào giỏ</button></p>
      


      <ul>
        {list.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>

      <p>Tổng tiền: {tien}đ</p>
    </div>
  );
}


