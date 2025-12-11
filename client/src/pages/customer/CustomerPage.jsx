
import React from 'react'
import Navbar from '../../components/Navbar'
import { Outlet } from 'react-router-dom'

function CustomerPage() {
  return (
    <div>
        <Navbar></Navbar>
        <Outlet></Outlet>
    </div>
  )
}

export default CustomerPage