import React, { useState } from 'react'
import Sidebar from './Sidebar'

const Loyaout = ({children}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className='bg-white dark:bg-gray-900 duration-300 text-black dark:text-white flex h-screen overflow-hidden'>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'} h-screen overflow-hidden`}>
        <main className="flex-1 p-6 overflow-hidden h-full">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Loyaout