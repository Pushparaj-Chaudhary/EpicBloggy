import React from 'react'

const Newsletter = () => {
  return (
    <div className='flex flex-col items-center justify-center text-center space-y-2 mt-0 mb-32 px-4 md:px-0'>
      <h1 className='md:text-4xl text-2xl font-semibold'>Never Miss a Blog!</h1>
      <p className='md:text-lg text-gray-500/70 pb-8'>Subscribe to explore fresh stories, travel journeys, cultural vibes, and the latest tech ideas.</p>
      <form className='flex items-center justify-between max-w-2xl w-full md:h-13 h-12'>
        <input className='border border-gray-300 rounded-md h-full border-r-0 outline-none w-full rounded-r-none px-3 text-gray-500' type="text" placeholder='Enter your email id' required/>
        <button type='submit' className='md:px-12 px-8 h-full text-white bg-black/80 hover:bg-black trasition-all cursor-pointer rounded-md rounded-1-none'>Subscribe</button>
      </form>

    </div>
  )
}

export default Newsletter
