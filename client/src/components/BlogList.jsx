import { useState } from 'react'
import { blogCategories } from '../assets/assets'
import { motion } from "motion/react"
import BlogCard from './BlogCard'
import { useAppContext } from '../context/AppContext'
import { useEffect } from 'react'

const BlogList = () => {

  const [menu, setMenu] = useState("All");
  const [page, setPage] = useState(1);
  const { blogs, input, fetchBlogs, totalPages, currentPage } = useAppContext();

  useEffect(() => {
    fetchBlogs(page, 8, menu);
  }, [page, menu]);

  const handleCategoryChange = (val) => {
    setMenu(val);
    setPage(1); // Reset to first page on category change
  };

  const filteredBlogs = () => {
    if (input === '') {
      return blogs;
    }
    return blogs.filter((blog) => blog.title.toLowerCase().includes(input.toLowerCase()))
  }

  return (
    <div>
      <div className='flex justify-center gap-2.5 sm:gap-8 my-10 relative'>
        {blogCategories.map((item) => (
          <div key={item} className='relative text-sm sm:text-base'>
            <button onClick={() => handleCategoryChange(item)} className={`cursor-pointer text-gray-500 ${menu === item && 'text-white px-4 pt-0.5'}`}>
              {item}
              {menu === item && (
                <motion.div layoutId='underline' transition={{ type: 'spring', stiffness: 500, damping: 30 }} className='absolute left-0 right-0 top-0 h-7 -z-1 bg-black rounded-full'></motion.div>
              )}
            </button>
          </div>
        ))}
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 mb-12 max-w-7xl mx-auto px-20 justify-center'>
        {filteredBlogs().map((blog) => <BlogCard key={blog._id} blog={blog} />)}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
         <div className="flex justify-center items-center gap-4 mb-24 mt-8">
            <button 
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 border rounded-full text-sm font-medium ${currentPage === 1 ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-400 text-gray-700 hover:bg-gray-50 cursor-pointer'}`}
            >
                Previous
            </button>
            <span className="text-gray-600 font-medium">Page {currentPage} of {totalPages}</span>
            <button 
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 border rounded-full text-sm font-medium ${currentPage === totalPages ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-400 text-gray-700 hover:bg-gray-50 cursor-pointer'}`}
            >
                Next
            </button>
         </div>
      )}
    </div>
  )
}

export default BlogList
