import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const UserDashboard = () => {
    const { axios, user, token } = useAppContext();
    const navigate = useNavigate();
    const [myBlogs, setMyBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        
        const fetchMyBlogs = async () => {
            try {
                // Since there is no specific /api/blog/my endpoint in the backend, we can just fetch all blogs 
                // Wait, we didn't create a 'my blogs' endpoint on the backend.
                // Let's create one now on the backend instead, or filter here. But it's better to add the endpoint.
                const { data } = await axios.get('/api/blog/my-blogs');
                if (data.success) {
                    setMyBlogs(data.blogs);
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyBlogs();
    }, [token, navigate, axios]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}</h1>
                    <button 
                        onClick={() => navigate('/submit-blog')}
                        className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
                    >
                        Submit New Blog
                    </button>
                </div>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">My Submitted Blogs</h3>
                    </div>
                    {loading ? (
                        <div className="p-6 text-center text-gray-500">Loading...</div>
                    ) : myBlogs.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">You haven't submitted any blogs yet.</div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {myBlogs.map(blog => (
                                <li key={blog._id} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <h4 className="text-lg font-medium text-gray-900">{blog.title}</h4>
                                        <p className="text-sm text-gray-500">{new Date(blog.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusColor(blog.status)}`}>
                                        {blog.status}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
