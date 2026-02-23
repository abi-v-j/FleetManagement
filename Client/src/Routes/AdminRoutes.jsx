import React from 'react'
import Place from '../Admin/Pages/Place/Place'
import { Route, Routes } from 'react-router'
import DriverRegistration from '../Admin/Pages/Driver/DriverRegistration'
import ManagerRegistration from '../Admin/Pages/ManagerRegistration/ManagerRegistration'
import AdminDashboard from '../Admin/Pages/AdminDashboard/AdminDashboard'
import AdminRegistration from '../Admin/Pages/AdminRegistration/AdminRegistration'
import StaffRegistration from '../Admin/Pages/Staff/StaffRegistration'
import Vehicle from '../Admin/Pages/Vehicle/Vehicle'
import Gallery from '../Admin/Pages/Gallery/Gallery'
import Stafftype from '../Admin/Pages/StaffType/StaffType'
const AdminRoutes = () => {
    return (
        <div>
            <Routes>
                <Route path='/' element={<AdminDashboard />}></Route>
                <Route path='place' element={<Place />}></Route>
                <Route path='driverregistration' element={<DriverRegistration />}></Route>
                <Route path='managerregistration' element={<ManagerRegistration />}></Route>
                <Route path='adminregistration' element={<AdminRegistration />}></Route>
                <Route path='staffregistration' element={<StaffRegistration />}></Route>
                <Route path='managerregistration' element={<ManagerRegistration />}></Route>
                <Route path='stafftype' element={<Stafftype />}></Route>
                <Route path='vehicle' element={<Vehicle />}></Route>
                <Route path='gallery/:vehicleId' element={<Gallery />}></Route>

            </Routes>
        </div>
    )
}

export default AdminRoutes
