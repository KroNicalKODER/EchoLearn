import React from 'react'

const Navbar = () => {
  return (
    <div className='flex justify-between items-center px-4 py-3'>
        <div className="font-semibold text-2xl">Echo-Learn</div>
        <div className="">
            <ul className='flex gap-4'>
                <li>Home</li>
                <li>About</li>
                <li>Contact Us</li>
            </ul>
        </div>
    </div>
  )
}

export default Navbar
