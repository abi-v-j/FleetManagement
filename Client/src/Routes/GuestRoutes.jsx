import React from 'react'
import Login from '../Guest/Pages/Login/Login'
import UserRegistration from '../Guest/Pages/User/User'
import { Route, Routes } from 'react-router'

const GuestRoutes = () => {
    return( 
    <div>
        <Routes>
            <Route path='' element={<Login/>}></Route>
             <Route path='Userreg' element={<UserRegistration/>}></Route>
        </Routes>
    </div> 
        )
}

export default GuestRoutes