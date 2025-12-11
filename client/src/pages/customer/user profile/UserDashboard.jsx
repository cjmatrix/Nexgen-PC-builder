import React from 'react'
import { Outlet } from 'react-router-dom'
import AccountSidebar from './components/AccountSidebar'

function UserDashboard() {
  return (
   <div className='bg-gray-100 min-h-screen flex justify-center'>
    <div className='flex w-full max-w-7xl'>
        <AccountSidebar />
        <div className='flex-1'>
            <Outlet />
        </div>
    </div>
</div>
  )
}

export default UserDashboard