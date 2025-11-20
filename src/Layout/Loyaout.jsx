import React, { useState } from 'react'
import Sidebar from './Sidebar'

const Loyaout = ({children}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className='bg-white duration-300 text-gray-950 flex h-screen overflow-hidden'>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'} h-screen overflow-hidden bg-gray-50`}>
        <main className="flex-1 p-6 overflow-auto h-full">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Loyaout