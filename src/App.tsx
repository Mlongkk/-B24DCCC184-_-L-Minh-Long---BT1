
import React, { useState, useMemo } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import PostList from './components/PostList'
import PostDetail from './components/PostDetail'
import PostForm from './components/PostForm'

export type Category = 'Công nghệ' | 'Du lịch' | 'Ẩm thực' | 'Đời sống' | 'Khác'

export interface Post {
  id: string
  title: string
  author: string
  thumbnail: string
  content: string
  category: Category
  createdAt: string // ISO date
}

const SAMPLE_POSTS: Post[] = [
  {
    id: '1',
    title: 'Hướng dẫn React Router với TypeScript',
    author: 'Minh Long',
    thumbnail: 'https://picsum.photos/seed/r1/600/400',
    content: 'Đây là bài viết mẫu giới thiệu cách dùng React Router với TypeScript. '.repeat(20),
    category: 'Công nghệ',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: '10 quán cafe nên thử ở Hà Nội',
    author: 'Lan Anh',
    thumbnail: 'https://picsum.photos/seed/r2/600/400',
    content: 'Danh sách quán cafe với không gian đẹp, giá cả hợp lý và đồ uống ngon. '.repeat(20),
    category: 'Du lịch',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: '3',
    title: 'Công thức món xào đơn giản',
    author: 'Ngọc',
    thumbnail: 'https://picsum.photos/seed/r3/600/400',
    content: 'Món xào thơm ngon cho bữa tối nhanh gọn. '.repeat(20),
    category: 'Ẩm thực',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
  {
    id: '4',
    title: 'Làm thế nào để giữ tinh thần lạc quan',
    author: 'Huy',
    thumbnail: 'https://picsum.photos/seed/r4/600/400',
    content: 'Một vài thói quen nhỏ để cải thiện tinh thần và năng suất. '.repeat(20),
    category: 'Đời sống',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
  {
    id: '5',
    title: 'Xu hướng công nghệ năm 2025',
    author: 'Thảo',
    thumbnail: 'https://picsum.photos/seed/r5/600/400',
    content: 'Các công nghệ nổi bật và phân tích xu hướng. '.repeat(20),
    category: 'Công nghệ',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
  },
  {
    id: '6',
    title: 'Mẹo du lịch tiết kiệm',
    author: 'An',
    thumbnail: 'https://picsum.photos/seed/r6/600/400',
    content: 'Cách lên kế hoạch và tiết kiệm chi phí khi đi du lịch. '.repeat(20),
    category: 'Du lịch',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
  },
]

function App() {
  const [posts, setPosts] = useState<Post[]>(() => {
    const raw = localStorage.getItem('posts_v1')
    if (raw) {
      try {
        return JSON.parse(raw) as Post[]
      } catch {
        return SAMPLE_POSTS
      }
    }
    return SAMPLE_POSTS
  })

  React.useEffect(() => {
    localStorage.setItem('posts_v1', JSON.stringify(posts))
  }, [posts])

  const createPost = (p: Omit<Post, 'id' | 'createdAt'>) => {
    const newPost: Post = {
      ...p,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
    }
    setPosts((s) => [newPost, ...s])
  }

  const updatePost = (id: string, data: Omit<Post, 'id' | 'createdAt'>) => {
    setPosts((s) => s.map((x) => (x.id === id ? { ...x, ...data } : x)))
  }

  const deletePost = (id: string) => {
    setPosts((s) => s.filter((x) => x.id !== id))
  }

  const postsById = useMemo(() => {
    const map = new Map<string, Post>()
    posts.forEach((p) => map.set(p.id, p))
    return map
  }, [posts])

  return (
    <div>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/posts" replace />} />
          <Route
            path="/posts"
            element={<PostList posts={posts} onDelete={deletePost} />}
          />
          <Route
            path="/create"
            element={<PostForm onSubmit={createPost} />}
          />
          <Route
            path="/posts/create"
            element={<PostForm onSubmit={createPost} />}
          />
          <Route
            path="/posts/:id"
            element={<PostDetail postsById={postsById} onDelete={deletePost} />}
          />
          <Route
            path="/posts/edit/:id"
            element={<PostForm onSubmit={() => {}} editMode posts={posts} onUpdate={updatePost} />}
          />
          <Route path="*" element={<div>Trang không tồn tại</div>} />
        </Routes>
      </div>
    </div>
  )
}

export default App










