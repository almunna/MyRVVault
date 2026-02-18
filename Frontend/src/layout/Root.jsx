import React from 'react'
import { Navbar } from '../shared/Navbar'
import { Outlet } from 'react-router-dom'
import { Footer } from '../shared/Footer'

export const Root = () => {
  return (
    <div className=' '>
        <Navbar></Navbar>
        <div className='min-h-[50vh]'>
          <Outlet></Outlet>
        </div>
        <Footer></Footer>
    </div>
  )
}
