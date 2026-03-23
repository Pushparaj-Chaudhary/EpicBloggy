import React from 'react'
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const BlogTableItem = ({blog, fetchBlogs, index}) => {

    const {title, createdAt} = blog;
    const BlogDate = new Date(createdAt)

    const {axios} = useAppContext();

    const deleteBlog = async ()=>{
        const confirm = window.confirm('Are you sure want to delete this blog?')
        if(!confirm) return;
        try {
            const { data } = await axios.post('/api/blog/delete', {id: blog._id})
            if(data.success){
                toast.success(data.message);
                await fetchBlogs()
            }else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const updateStatus = async (status)=>{
        try {
            const { data } = await axios.post('/api/admin/update-blog-status', {id: blog._id, status})
            if(data.success){
                toast.success(data.message);
                await fetchBlogs()
            }else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

  return (
    <tr className='border-y border-gray-300'>
        <th className='px-2 py-4'>{ index }</th>
        <td className='px-2 py-4'>{ title }</td>
        <td className='px-2 py-4 max-sm:hidden'>{ BlogDate.toDateString() }</td>
        <td className='px-2 py-4 max-sm:hidden'>
            <p className={`capitalize ${blog.status === 'approved' ? 'text-green-600' : blog.status === 'rejected' ? 'text-red-600' : 'text-orange-700'}`}>{blog.status}</p>
        </td>
        <td className='px-2 py-4 flex text-xs gap-3'>
            {blog.status === 'pending' && (
                <>
                    <button onClick={() => updateStatus('approved')} className='text-green-600 border border-green-600 px-2 py-0.5 mt-1 rounded cursor-pointer hover:bg-green-50'>Approve</button>
                    <button onClick={() => updateStatus('rejected')} className='text-red-600 border border-red-600 px-2 py-0.5 mt-1 rounded cursor-pointer hover:bg-red-50'>Reject</button>
                </>
            )}
            <img src={assets.cross_icon} className='w-8 hover:scale-110 transition-all cursor-pointer' alt="delete" onClick={deleteBlog}/>
        </td>
    </tr>
  )
}

export default BlogTableItem
