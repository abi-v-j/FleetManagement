import React from 'react'
import { Route, Routes } from 'react-router'
import MyProfile from '../Staff/Pages/MyProfile/MyProfile'
import EditProfile from '../Staff/Pages/EditProfile/EditProfile'
import ChangePassword from '../Staff/Pages/ChangePassword/ChangePassword'

const StaffRoutes = () => {
    return (
        <Routes>
            <Route path='myprofile' element={<MyProfile />}></Route>
            <Route path='editprofile' element={<EditProfile />}></Route>
            <Route path='changepassword' element={<ChangePassword />}></Route>

        </Routes>
    )
}

export default StaffRoutes