import React, {useEffect, useState} from "react";
import axios from "axios";
import {useParams, Link} from "react-router-dom";

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  website: string;
}

export default function StudentDetail() {
  const {id} = useParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get<Student>(`https://jsonplaceholder.typicode.com/users/${id}`)
      .then((res) => setStudent(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Đang tải chi tiết...</p>;
  if (!student) return <p>Không tìm thấy sinh viên.</p>;

  return (
    <div>
      <h2>Chi tiết sinh viên</h2>
      <p>Tên: {student.name}</p>
      <p>Email: {student.email}</p>
      <p>Điện thoại: {student.phone}</p>
      <p>Website: {student.website}</p>
      <Link to="/bai2">⬅ Quay lại danh sách</Link>
    </div>
  );
}
