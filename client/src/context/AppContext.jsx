import { useContext, createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom'
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const navigate = useNavigate();

    const [token, setToken] = useState(null)
    const [user, setUser] = useState(null)
    const [blogs, setBlogs] = useState([]);
    const [input, setInput] = useState("")
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchBlogs = async (page = 1, limit = 8, category = 'All') => {
        try{
            const {data} = await axios.get(`/api/blog/all?page=${page}&limit=${limit}&category=${category}`)
            if (data.success) {
               setBlogs(data.blogs);
               setTotalPages(data.totalPages);
               setCurrentPage(data.currentPage);
            } else {
               toast.error(data.message);
            }
        } catch(error){
            toast.error(error.message);
        }
    }

    const fetchUser = async (authToken) => {
        try {
            axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
            const { data } = await axios.get('/api/auth/me');
            if (data.success) {
                setUser(data.user);
            } else {
                setToken(null);
                setUser(null);
                localStorage.removeItem('token');
            }
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        // Initial fetch occurs when components like BlogList mount

        const storedToken = localStorage.getItem('token');
        if(storedToken){
            setToken(storedToken);
            fetchUser(storedToken);
        }
    },[]);

    const value = {
        axios, navigate, token, setToken, user, setUser, blogs, setBlogs, input, setInput, fetchBlogs, totalPages, currentPage
    }
    
    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
};

export const useAppContext = ()=>{
    return useContext(AppContext);
};