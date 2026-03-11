import React from "react";
import { Routes, Route, Navigate } from "react-router";
import ManagerDashboard from "../Manager/Pages/ManagerDashboard/ManagerDashboard";
import MyProfile from "../Manager/Pages/MyProfile/MyProfile";
import EditProfile from "../Manager/Pages/EditProfile/EditProfile";
import ChangePassword from "../Manager/Pages/ChangePassword/ChangePassword";
import ViewBookings from "../Manager/Pages/ViewBookings/ViewBookings";
import AssignStaff from "../Manager/Pages/AssignStaff/AssignStaff";

const ManagerRoutes = () => {
  return (
    <Routes>
      <Route path='myprofile' element={<MyProfile />}></Route>
      <Route path='editprofile' element={<EditProfile />}></Route>
      <Route path='changepassword' element={<ChangePassword />}></Route>
      <Route path='viewbookings' element={<ViewBookings />}></Route>
      <Route path="assign/:bookingId" element={<AssignStaff />} />


    </Routes>
  );
};

export default ManagerRoutes;