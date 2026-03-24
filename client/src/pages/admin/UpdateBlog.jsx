import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { assets, blogCategories } from '../../assets/assets'
import Quill from 'quill'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { parse } from 'marked'

const UpdateBlog = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { axios, user } = useAppContext();
    const [isUpdating, setIsUpdating] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const editorRef = useRef(null)
    const quillRef = useRef(null)

    const [image, setImage] = useState(null);
    const [currentImage, setCurrentImage] = useState('');
    const [title, setTitle] = useState('');
    const [subTitle, setSubTitle] = useState('');
    const [category, setCategory] = useState('Startup');
    const [isPublished, setIsPublished] = useState(false);
    const [description, setDescription] = useState('');

    const generateContent = async () => {
        if (!title) return toast.error('Please enter a title')

        try {
            setLoading(true);
            const { data } = await axios.post('/api/blog/generate', { prompt: title })
            if (data.success) {
                quillRef.current.root.innerHTML = parse(data.content)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const fetchBlog = async () => {
        try {
            const { data } = await axios.get(`/api/blog/${id}`)
            if (data.success) {
                const blogData = data.blog;
                setTitle(blogData.title);
                setSubTitle(blogData.subTitle);
                setCategory(blogData.category);
                setCurrentImage(blogData.image);
                setIsPublished(blogData.status === 'approved');
                setDescription(blogData.description);
                
                if (quillRef.current) {
                    quillRef.current.root.innerHTML = blogData.description;
                }
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setFetching(false)
        }
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            setIsUpdating(true)

            const blog = {
                id,
                title, subTitle,
                description: quillRef.current.root.innerHTML,
                category,
                isPublished
            }

            const formData = new FormData();
            formData.append('blog', JSON.stringify(blog))
            if (image) {
                formData.append('image', image)
            }

            const { data } = await axios.post('/api/blog/update', formData);

            if (data.success) {
                toast.success(data.message);
                navigate('/admin/updateBlogs')
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsUpdating(false);
        }
    }

    useEffect(() => {
        fetchBlog()
    }, [id])

    useEffect(() => {
        if (!fetching && editorRef.current && !quillRef.current) {
            quillRef.current = new Quill(editorRef.current, { theme: 'snow' })
            if (description) {
                quillRef.current.root.innerHTML = description;
            }
        }
    }, [fetching, description])

    if (fetching) {
        return <div className="flex-1 p-10 flex justify-center items-center">Loading...</div>
    }

    return (
        <form onSubmit={onSubmitHandler} className='flex-1 border-0 pl-10 text-gray-600 h-full relative'>
             {/* Back Button */}
            <div className='absolute top-2 left-2'>
                 <button type="button" onClick={() => navigate('/admin/updateBlogs')} className='text-sm border rounded px-3 py-1 bg-white hover:bg-gray-100 flex items-center gap-2'>
                    &larr; Back
                 </button>
            </div>
            <div className='bg-white border-0 w-full max-w-3xl sm:m-10 mt-20'>
                <p>Upload thumbnail</p>
                <label htmlFor="image">
                    <img src={image ? URL.createObjectURL(image) : currentImage} alt="" className='mt-2 h-16 rounded cursor-pointer object-cover hidden' id="preview-img" onLoad={(e) => e.target.classList.remove('hidden')} onError={(e) => {e.target.src = assets.upload_area; e.target.classList.remove('hidden')}} />
                    {!currentImage && !image && <img src={assets.upload_area} alt="" className='mt-2 h-16 rounded cursor-pointer' />}
                    <input onChange={(e) => setImage(e.target.files[0])} type="file" id='image' hidden />
                </label>
                <p className='text-xs text-gray-400 mt-1'>Leave empty to keep current image</p>

                <p className='mt-4'>Blog Title</p>
                <input type="text" placeholder='Type here' className='w-full max-w-lg mt-2 p-2 border border-gray-300 outline-none rounded' onChange={(e) => setTitle(e.target.value)} value={title} />

                <p className='mt-4'>Sub Title</p>
                <input type="text" placeholder='Type here' className='w-full max-w-lg mt-2 p-2 border border-gray-300 outline-none rounded' onChange={(e) => setSubTitle(e.target.value)} value={subTitle} />

                <p className='mt-4'>Blog Description</p>
                <div className='max-w-lg h-auto pb-10 pt-2 relative mb-4'>
                    <div ref={editorRef} className='h-64 sm:h-72'></div>

                    {loading && (
                        <div className='absolute right-0 top-0 bottom-0 left-0 flex items-center justify-center bg-black/10 mt-2 z-10'>
                            <div className='w-8 h-8 rounded-full border-2 border-t-white animate-spin'></div>
                        </div>)}

                    <button disabled={loading} type='button' onClick={generateContent} className='absolute bottom-2 right-2 ml-2 text-xs text-white bg-black/70 px-4 py-1.5 rounded hover:underline cursor-pointer z-10'>Generate with AI</button>
                </div>

                <p className='mt-4'>Blog category</p>
                <select onChange={(e) => setCategory(e.target.value)} value={category} name="category" className='mt-2 px-3 py-2 border text-gray-500 border-gray-300 outline-none rounded'>
                    <option value="">Select category</option>
                    {blogCategories.map((item, index) => {
                        return <option value={item} key={index}>{item}</option>
                    })}
                </select>

                {user?.role === 'admin' && (
                    <div className='flex gap-2 mt-4'>
                        <p>Publish Now</p>
                        <input type="checkbox" checked={isPublished} className='scale-125 cursor-pointer' onChange={e => setIsPublished(e.target.checked)} />
                    </div>
                )}

                <br />

                <button disabled={isUpdating} type='submit' className='my-8 w-40 h-10 bg-black text-white rounded cursor-pointer text-sm'>{isUpdating ? 'Updating...' : 'Update Blog'} </button>

            </div>

        </form>
    )
}

export default UpdateBlog
