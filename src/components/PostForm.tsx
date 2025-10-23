
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Post, Category } from '../App'

interface Props {
  onSubmit: (post: Omit<Post, 'id' | 'createdAt'>) => void
  editMode?: boolean
  posts?: Post[]
  onUpdate?: (id: string, data: Omit<Post, 'id' | 'createdAt'>) => void
}

const categories: Category[] = ['Công nghệ', 'Du lịch', 'Ẩm thực', 'Đời sống', 'Khác']

const PostForm: React.FC<Props> = ({ onSubmit, editMode, posts = [], onUpdate }) => {
  const navigate = useNavigate()
  const params = useParams()
  const editingId = params.id

  const initial = {
    title: '',
    author: '',
    thumbnail: '',
    content: '',
    category: 'Khác' as Category,
  }

  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (editMode && editingId) {
      const p = posts.find((x) => x.id === editingId)
      if (p) {
        setForm({ title: p.title, author: p.author, thumbnail: p.thumbnail, content: p.content, category: p.category })
      }
    }
  }, [editMode, editingId, posts])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.title || form.title.trim().length < 10) e.title = 'Tiêu đề bắt buộc và ít nhất 10 ký tự'
    if (!form.author || form.author.trim().length < 3) e.author = 'Tác giả bắt buộc và ít nhất 3 ký tự'
    if (!form.content || form.content.trim().length < 50) e.content = 'Nội dung bắt buộc và ít nhất 50 ký tự'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    if (editMode && editingId && onUpdate) {
      onUpdate(editingId, form)
      alert('Cập nhật thành công!')
      navigate(`/posts/${editingId}`)
    } else {
      onSubmit(form)
      alert('Đăng bài thành công!')
      navigate('/posts')
    }
  }

  return (
    <div>
      <h2>{editMode ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Tiêu đề</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}/>
          {errors.title && <div>{errors.title}</div>}
        </div>

        <div>
          <label>Tác giả</label>
          <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })}/>
          {errors.author && <div>{errors.author}</div>}
        </div>

        <div>
          <label>URL ảnh thumbnail</label>
          <input value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}/>
        </div>

        <div>
          <label>Thể loại</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })}>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label>Nội dung</label>
          <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={12}/>
          {errors.content && <div >{errors.content}</div>}
        </div>

        <div>
          <button type="submit">{editMode ? 'Cập nhật' : 'Đăng bài'}</button>
          <button type="button" onClick={() => {
            if (editMode && editingId) navigate(`/posts/${editingId}`)
            else navigate('/posts')
          }}>Hủy</button>
        </div>
      </form>
    </div>
  )
}

export default PostForm
