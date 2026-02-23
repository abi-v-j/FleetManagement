import React from 'react'
import { Route, Routes } from 'react-router'
import GuestRoutes from './GuestRoutes'
import UserRoutes from './UserRoutes'
import AdminLayout from '../Admin/AdminLayout/AdminLayout'
import ManagerLayout from '../Manager/ManagerLayout/ManagerLayout'
import UserLayout from '../User/UserLayout/UserLayout'
import GuestLayout from '../Guest/GuestLayout/GuestLayout'

const GlobalRoutes = () => {
    return( 
    <div>
        <Routes>
            <Route path='admin/*' element={<AdminLayout/>}></Route>
            <Route path='guest/*' element={<GuestLayout/>}></Route>
            <Route path='user/*' element={<UserLayout/>}></Route>
            <Route path='manager/*' element={<ManagerLayout/>}></Route>
            <Route path='staff/*' element={<ManagerLayout/>}></Route>
        </Routes>
    </div> 
        )
}

export default GlobalRoutes