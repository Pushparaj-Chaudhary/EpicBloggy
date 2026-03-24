import React, { useState, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast';
import { assets } from '../assets/assets'

const Auth = () => {
    const { axios, setToken, setUser, navigate } = useAppContext();
    const [isLogin, setIsLogin] = useState(true);
    const [isVerify, setIsVerify] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(60);

    useEffect(() => {
        let interval;
        if (isVerify && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isVerify, timer]);

    const handleResendOtp = async () => {
        try {
            const endpoint = isForgotPassword ? '/api/auth/send-reset-otp' : '/api/auth/resend-otp';
            const { data } = await axios.post(endpoint, { email });
            if (data.success) {
                toast.success(data.message);
                setTimer(60);
                setOtp('');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isForgotPassword) {
                if (isVerify) {
                    const { data } = await axios.post('/api/auth/reset-password', { email, otp, newPassword });
                    if (data.success) {
                        toast.success(data.message);
                        setIsForgotPassword(false);
                        setIsVerify(false);
                        setIsLogin(true);
                        setOtp('');
                        setNewPassword('');
                    } else {
                        toast.error(data.message);
                    }
                } else {
                    const { data } = await axios.post('/api/auth/send-reset-otp', { email });
                    if (data.success) {
                        toast.success(data.message);
                        setIsVerify(true);
                        setTimer(60);
                    } else {
                        toast.error(data.message);
                    }
                }
                return;
            }

            if (isVerify) {
                const { data } = await axios.post('/api/auth/verify-email', { email, otp });
                if (data.success) {
                    setToken(data.token);
                    setUser(data.user);
                    localStorage.setItem('token', data.token);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                    toast.success(data.message || "Email verified successfully");
                    
                    setEmail('');
                    setPassword('');
                    setName('');
                    setOtp('');
                    setIsVerify(false);
                    
                    if (data.user.role === 'admin') {
                        navigate('/admin');
                    } else {
                        navigate('/dashboard');
                    }
                } else {
                    toast.error(data.message);
                    setOtp('');
                }
                return;
            }
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const payload = isLogin ? { email, password } : { name, email, password };
            
            const { data } = await axios.post(endpoint, payload);

            if (data.success) {
                if (data.requireOtp || (!isLogin && data.message && data.message.includes('OTP'))) {
                    toast.success(data.message);
                    setIsVerify(true);
                    setTimer(60);
                    return;
                }
                
                setToken(data.token);
                setUser(data.user);
                localStorage.setItem('token', data.token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                toast.success(isLogin ? "Logged in successfully" : "Registered successfully");
                
                setEmail('');
                setPassword('');
                setName('');
                setOtp('');
                
                if (data.user.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }
            } else {
                toast.error(data.message);
                setPassword('');
            }
        } catch (error) {
            toast.error(error.message);
            setPassword('');
        }
    }

    return (
        <div className='flex items-center justify-center h-screen bg-gray-50 px-4 sm:px-0'>
            <div className='w-full max-w-sm p-6 bg-white border border-gray-200 shadow-xl rounded-lg'>
                <div className='flex flex-col items-center justify-center'>
                    <img src={assets.logo} alt="Logo" className="w-28 sm:w-32 mb-2" />
                    <div className='w-full py-4 text-center'>
                        <h1 className='text-3xl font-bold text-gray-800'>
                            {isForgotPassword ? (isVerify ? 'Reset Password' : 'Forgot Password') : (isVerify ? 'Verify Email' : (isLogin ? 'Login' : 'Register'))}
                        </h1>
                        <p className='font-light text-gray-500 mt-2 text-sm'>
                            {isForgotPassword ? (isVerify ? 'Enter the OTP and your new password.' : 'Enter your email to receive a reset OTP.') : (isVerify ? 'Enter the OTP sent to your email.' : (isLogin ? 'Welcome back! Please enter your details.' : 'Create an account to submit blogs and comment.'))}
                        </p>
                    </div>
                    <form onSubmit={handleSubmit} className='mt-2 w-full text-gray-700'>
                        {isForgotPassword ? (
                            isVerify ? (
                                <>
                                    <div className='flex flex-col mb-4'>
                                        <label className='mb-1 font-medium'>One-Time Password (OTP)</label>
                                        <input onChange={e => setOtp(e.target.value)} value={otp} type="text" required placeholder='Enter 6-digit OTP' className='border border-gray-300 rounded p-2 outline-none focus:border-black transition-colors'/>
                                    </div>
                                    <div className='flex flex-col mb-2'>
                                        <label className='mb-1 font-medium'>New Password</label>
                                        <input onChange={e => setNewPassword(e.target.value)} value={newPassword} type="password" required placeholder='••••••••' className='border border-gray-300 rounded p-2 outline-none focus:border-black transition-colors'/>
                                    </div>
                                    <p className='text-sm mt-1 mb-4 text-gray-500 text-right'>
                                        {timer > 0 ? `Resend OTP in ${timer}s` : (
                                            <span onClick={handleResendOtp} className='text-black font-semibold cursor-pointer hover:underline'>Resend OTP</span>
                                        )}
                                    </p>
                                </>
                            ) : (
                                <div className='flex flex-col mb-6'>
                                    <label className='mb-1 font-medium'>Email</label>
                                    <input onChange={e => setEmail(e.target.value)} value={email} type="email" required placeholder='your@email.com' className='border border-gray-300 rounded p-2 outline-none focus:border-black transition-colors'/>
                                </div>
                            )
                        ) : isVerify ? (
                            <div className='flex flex-col mb-4'>
                                <label className='mb-1 font-medium'>One-Time Password (OTP)</label>
                                <input onChange={e => setOtp(e.target.value)} value={otp} type="text" required placeholder='Enter 6-digit OTP' className='border border-gray-300 rounded p-2 outline-none focus:border-black transition-colors'/>
                                <p className='text-sm mt-3 text-gray-500 text-right'>
                                    {timer > 0 ? `Resend OTP in ${timer}s` : (
                                        <span onClick={handleResendOtp} className='text-black font-semibold cursor-pointer hover:underline'>Resend OTP</span>
                                    )}
                                </p>
                            </div>
                        ) : (
                            <>
                                {!isLogin && (
                                    <div className='flex flex-col mb-4'>
                                        <label className='mb-1 font-medium'>Name</label>
                                        <input onChange={e => setName(e.target.value)} value={name} type="text" required placeholder='Your Name' className='border border-gray-300 rounded p-2 outline-none focus:border-black transition-colors'/>
                                    </div>
                                )}
                                <div className='flex flex-col mb-4'>
                                    <label className='mb-1 font-medium'>Email</label>
                                    <input onChange={e => setEmail(e.target.value)} value={email} type="email" required placeholder='your@email.com' className='border border-gray-300 rounded p-2 outline-none focus:border-black transition-colors'/>
                                </div>
                                <div className={isLogin ? 'flex flex-col mb-2' : 'flex flex-col mb-6'}>
                                    <label className='mb-1 font-medium'>Password</label>
                                    <input onChange={e => setPassword(e.target.value)} value={password} type="password" required placeholder='••••••••' className='border border-gray-300 rounded p-2 outline-none focus:border-black transition-colors'/>
                                </div>
                                {isLogin && (
                                    <p className='text-sm text-gray-500 text-right mb-4'>
                                        <span onClick={() => { setIsForgotPassword(true); setIsVerify(false); setOtp(''); setNewPassword(''); }} className='text-black cursor-pointer hover:underline'>Forgot Password?</span>
                                    </p>
                                )}
                            </>
                        )}
                        <button type='submit' className='w-full py-2.5 font-medium bg-black text-white rounded cursor-pointer hover:bg-black/90 transition-all'>
                            {isForgotPassword ? (isVerify ? 'Reset Password' : 'Send OTP') : (isVerify ? 'Verify OTP' : (isLogin ? 'Sign In' : 'Sign Up'))}
                        </button>
                    </form>
                    {!isForgotPassword && (
                        !isVerify ? (
                            <p className='mt-5 text-sm text-gray-600'>
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <span onClick={() => setIsLogin(!isLogin)} className='text-black font-semibold cursor-pointer hover:underline'>
                                    {isLogin ? 'Register here' : 'Login here'}
                                </span>
                            </p>
                        ) : (
                            <p className='mt-5 text-sm text-gray-600'>
                                <span onClick={() => { setIsVerify(false); setIsLogin(true); }} className='text-black font-semibold cursor-pointer hover:underline'>
                                    Back to Login
                                </span>
                            </p>
                        )
                    )}
                    {isForgotPassword && (
                        <p className='mt-5 text-sm text-gray-600'>
                            <span onClick={() => { setIsForgotPassword(false); setIsVerify(false); setIsLogin(true); setEmail(''); }} className='text-black font-semibold cursor-pointer hover:underline'>
                                Back to Login
                            </span>
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Auth;
