
import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Post } from '../App'

interface Props { postsById: Map<string, Post>, onDelete: (id: string) => void }

const PostDetail: React.FC<Props> = ({ postsById, onDelete }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  if (!id) return <div>Không tìm thấy ID</div>
  const post = postsById.get(id)
  if (!post) return <div>Bài viết không tồn tại</div>

  const onRemove = () => {
    if (confirm('Bạn có chắc muốn xóa bài viết này?')) {
      onDelete(id)
      navigate('/posts')
    }
  }

  return (
    <div>

      <h1>{post.title}</h1>
      <div>{post.author} • {new Date(post.createdAt).toLocaleString()}</div>
      <img src={post.thumbnail} alt={post.title}/>
      <div>{post.content}</div>
      <button onClick={() => navigate('/posts')}>Quay lại</button>
      <button onClick={() => navigate(`/posts/edit/${post.id}`)}>Chỉnh sửa</button>
      <button onClick={onRemove}>Xóa bài viết</button>
    </div>
  )
}

export default PostDetail
