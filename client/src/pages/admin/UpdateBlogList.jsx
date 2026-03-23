import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import BlogTableItem from '../../components/admin/BlogTableItem'
import { assets } from '../../assets/assets'

const UpdateBlogList = () => {
    const [blogs, setBlogs] = useState([])
    const { axios } = useAppContext()

    const fetchAdminBlogs = async () => {
        try {
            const { data } = await axios.get('/api/admin/blogs')
            if (data.success) {
                setBlogs(data.blogs)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        fetchAdminBlogs()
    }, [])

    return (
        <div className='flex-1 p-4 md:p-10 bg-blue-50/50 min-h-screen'>
            <div className='flex items-center gap-3 m-4 mt-6 text-gray-600'>
                <img src={assets.list_icon} alt="" className="w-5" />
                <p className="text-xl font-medium">Update Blogs</p>
            </div>

            <div className='relative max-w-4xl overflow-x-auto shadow rounded-lg scrollbar-hide bg-white'>
                <table className='w-full text-sm text-gray-500'>
                    <thead className='text-xs text-gray-600 text-left uppercase bg-gray-50 border-b'>
                        <tr>
                            <th scope='col' className='px-2 py-4 xl:px-6'> # </th>
                            <th scope='col' className='px-2 py-4'> Blog Title </th>
                            <th scope='col' className='px-2 py-4 max-sm:hidden'> Date </th>
                            <th scope='col' className='px-2 py-4 max-sm:hidden'> Status </th>
                            <th scope='col' className='px-2 py-4'> Actions </th>
                        </tr>
                    </thead>
                    <tbody>
                        {blogs.map((blog, index) => {
                            const BlogDate = new Date(blog.createdAt);
                            return (
                                <tr key={blog._id} className='border-y border-gray-300'>
                                    <th className='px-2 py-4'>{index + 1}</th>
                                    <td className='px-2 py-4'>{blog.title}</td>
                                    <td className='px-2 py-4 max-sm:hidden'>{BlogDate.toDateString()}</td>
                                    <td className='px-2 py-4 max-sm:hidden'>
                                        <p className={`capitalize ${blog.status === 'approved' ? 'text-green-600' : blog.status === 'rejected' ? 'text-red-600' : 'text-orange-700'}`}>{blog.status}</p>
                                    </td>
                                    <td className='px-2 py-4 flex text-xs gap-3'>
                                        <Link to={`/admin/updateBlog/${blog._id}`} className='text-blue-600 border border-blue-600 px-3 py-1 mt-1 rounded cursor-pointer hover:bg-blue-50 bg-transparent text-center flex items-center justify-center font-medium'>Edit</Link>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default UpdateBlogList
