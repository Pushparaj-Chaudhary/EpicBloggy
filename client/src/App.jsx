import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Blog from './pages/Blog'
import Layout from './pages/admin/Layout'
import Dashboard from './pages/admin/Dashboard'
import AddBlog from './pages/admin/AddBlog'
import UpdateBlogList from './pages/admin/UpdateBlogList'
import UpdateBlog from './pages/admin/UpdateBlog'

import Auth from './pages/Auth'
import UserDashboard from './pages/UserDashboard'
import SubmitBlog from './pages/SubmitBlog'
import 'quill/dist/quill.snow.css'
import { Toaster } from 'react-hot-toast'
import { useAppContext } from './context/AppContext'
import Comments from './pages/admin/Comments'

const App = () => {

  const {token, user} = useAppContext();

  return (
    <div>
      <Toaster />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Auth />} />
        <Route path='/dashboard' element={token ? <UserDashboard /> : <Auth />} />
        <Route path='/submit-blog' element={token ? <SubmitBlog /> : <Auth />} />
        <Route path='/blog/:id' element={<Blog />} />
        <Route path='/admin' element={token && user?.role === 'admin' ? <Layout /> : <Auth />}>
          <Route index element={<Dashboard />} />
          <Route path='addBlog' element={<AddBlog />} />
          <Route path='updateBlogs' element={<UpdateBlogList />} />
          <Route path='updateBlog/:id' element={<UpdateBlog />} />

          <Route path='comments' element={<Comments />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
