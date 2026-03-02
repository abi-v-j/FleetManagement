import React from 'react'
import { Route, Routes } from 'react-router'
import MyProfile from '../User/Pages/MyProfile/MyProfile'
import EditProfile from '../User/Pages/EditProfile/EditProfile'
import ChangePassword from '../User/Pages/ChangePassword/ChangePassword'
import UserFeedback from '../User/Pages/UserFeedback/UserFeedback'
import UserComplaint from '../User/Pages/UserComplaint/UserComplaint'
import VehicleDetails from '../User/Pages/VehicleDetails/VehicleDetails'
import BookVehicle from '../User/Pages/BookVehicle/BookVehicle'
import MyBookings from '../User/Pages/MyBookings/MyBookings'
import SearchVehicle from '../User/Pages/SearchVehicle/SearchVehicle'

const UserRoutes = () => {
    return (
        <Routes>
            <Route path='myprofile' element={<MyProfile />}></Route>
            <Route path='editprofile' element={<EditProfile />}></Route>
            <Route path='changepassword' element={<ChangePassword />}></Route>
            <Route path='complaints' element={<UserComplaint />}></Route>
            <Route path='feedback' element={<UserFeedback />}></Route>
            <Route path='searchVehicle' element={<SearchVehicle />}></Route>
            <Route path="vehicledetails/:vehicleId" element={<VehicleDetails />} />
            <Route path="bookvehicle/:vehicleId" element={<BookVehicle />} />
            <Route path="mybookings" element={<MyBookings />} />
        </Routes>
    )
}

export default UserRoutes