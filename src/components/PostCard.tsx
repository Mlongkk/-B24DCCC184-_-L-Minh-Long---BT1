
import React from 'react'
import { Post } from '../App'
import { useNavigate } from 'react-router-dom'

interface Props { post: Post; onDelete: (id: string) => void }

const PostCard: React.FC<Props> = ({ post, onDelete }) => {
  const navigate = useNavigate()
  const onRemove = () => {
    if (confirm('Bạn có chắc muốn xóa bài viết này?')) onDelete(post.id)
  }

  return (
    <div>
      <img src={post.thumbnail} alt={post.title}/>
      <div>
        <h2>{post.title}</h2>
        <div>{post.author} • {new Date(post.createdAt).toLocaleDateString()}</div>
        <p>{post.content.slice(0, 100)}{post.content.length > 100 ? '...' : ''}</p>
        <div>
          <button onClick={() => navigate(`/posts/${post.id}`)}>Đọc thêm</button>
          <button onClick={() => navigate(`/posts/edit/${post.id}`)}>Sửa</button>
          <button onClick={onRemove}>Xóa</button>
        </div>
      </div>
    </div>
  )
}

export default PostCard