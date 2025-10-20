import React, {useEffect, useState} from "react";
import axios from "axios";
import {Link} from "react-router-dom";

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export default function StudentList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get<Student[]>("https://jsonplaceholder.typicode.com/users")
      .then((res) => setStudents(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Đang tải danh sách sinh viên...</p>;

  return (
    <div>
      <h2>Danh sách sinh viên</h2>
      <ul>
        {students.map((st) => (
          <li key={st.id}>
            <Link to={`/bai2/${st.id}`}>{st.name}</Link> - {st.email}
          </li>
        ))}
      </ul>
    </div>
  );
}

