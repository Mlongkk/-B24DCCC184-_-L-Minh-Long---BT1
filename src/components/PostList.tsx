
import React, { useState } from 'react'
import { Post } from '../App'
import PostCard from './PostCard'

interface Props {
  posts: Post[]
  onDelete: (id: string) => void
}

const PostList: React.FC<Props> = ({ posts, onDelete }) => {
  const [filter, setFilter] = useState('')

  const filtered = posts.filter((p) => p.title.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div>
        <h1 >Danh sách bài viết</h1>
        <div >Tổng: {posts.length} bài</div>
        {filtered.map((p) => (
          <PostCard key={p.id} post={p} onDelete={onDelete} />
        ))}
    </div>
  )
}

export default PostList