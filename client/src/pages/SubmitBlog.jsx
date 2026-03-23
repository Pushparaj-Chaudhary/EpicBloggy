import React from 'react';
import Navbar from '../components/Navbar';
import AddBlog from './admin/AddBlog';

const SubmitBlog = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-8 flex flex-col items-center">
                <div className="w-full mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 text-center">Submit a New Blog</h1>
                    <p className="text-center text-gray-500 mt-2">Share your thoughts with the world. Your blog will be published once approved by an admin.</p>
                </div>

                <div className="w-full max-w-3xl flex justify-center rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <AddBlog />
                </div>
            </div>
        </div>
    );
};

export default SubmitBlog;
