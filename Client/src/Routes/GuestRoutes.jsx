import React from 'react'
import Login from '../Guest/Pages/Login/Login'
import { Route, Routes } from 'react-router'
import User from '../Guest/Pages/User/User'

const GuestRoutes = () => {
    return( 
    <div>
        <Routes>
            <Route path='login' element={<Login/>}></Route>
             <Route path='User' element={<User/>}></Route>
        </Routes>
    </div> 
        )
}

export default GuestRoutes