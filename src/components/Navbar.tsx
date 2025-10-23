
import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

const Navbar: React.FC = () => {
  const navigate = useNavigate()
  return (
    <nav>
      <div className="container">
          <h2>Blog</h2>
          <NavLink to="/posts">Trang chủ</NavLink>
          <button onClick={() => navigate('/create')}>Viết bài</button>
      </div>
    </nav>
  )
}

export default Navbar