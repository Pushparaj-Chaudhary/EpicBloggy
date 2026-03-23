import React from 'react'
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const CommentTableItem = ({comment, fetchComments}) => {

    const {blog, createdAt, _id } = comment;
    const BlogDate = new Date(createdAt);

    const {axios} = useAppContext()

    const updateStatus = async (status) => {
        try {
            const {data} = await axios.post('/api/admin/update-comment-status', {id: _id, status})
            if(data.success){
                toast.success(data.message)
                fetchComments()
            } else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const deleteComment = async () => {
        try {
            const confirm = window.confirm('Are you sure you want to delete this comment>');
            if(!confirm) return;
            const {data} = await axios.post('/api/admin/delete-comment', {id: _id})
            if(data.success){
                toast.success(data.success)
                fetchComments()
            } else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

  return (
    <tr className='order-y border-gray-300'>
        <td className='px-6 py-4'>
            <b className='font-medium text-gray-600'>Blog</b> : {blog.title}
            <br />
            <br />
            <b className='font-medium text-gray-600'>Name</b> : {comment.user?.name || 'Unknown User'}
            <br />
            <b className='font-medium text-gray-600'>Comment</b> : {comment.content}
        </td>
        <td className='px-6 py-4 max-sm:hidden'>
            {BlogDate.toLocaleDateString()}
        </td>
        <td className='px-6 py-4'>
            <div className='inline-flex items-center gap-4'>
                {comment.status === 'pending' ? (
                    <>
                        <button onClick={() => updateStatus('approved')} className='text-xs border border-green-600 text-green-600 hover:bg-green-50 rounded px-2 py-1 cursor-pointer'>Approve</button>
                        <button onClick={() => updateStatus('rejected')} className='text-xs border border-red-600 text-red-600 hover:bg-red-50 rounded px-2 py-1 cursor-pointer'>Reject</button>
                    </>
                ) : (
                    <p className={`text-xs border rounded-full px-3 py-1 capitalize ${comment.status === 'approved' ? 'bg-green-100 text-green-600 border-green-600' : 'bg-red-100 text-red-600 border-red-600'}`}>{comment.status}</p>
                )}
                <img onClick={deleteComment} src={assets.bin_icon} className='w-5 hover:scale-110 transition-all cursor-pointer ml-2' alt="delete" />
            </div>
        </td>

    </tr>
  )
}

export default CommentTableItem
