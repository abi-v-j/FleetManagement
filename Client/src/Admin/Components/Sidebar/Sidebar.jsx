import React from "react";
import Styles from "./Sidebar.module.css";
import { Link } from "react-router";
import pic from "/logo.png";
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import AirportShuttleIcon from "@mui/icons-material/AirportShuttle";
import NavigationIcon from "@mui/icons-material/Navigation";
import HailIcon from "@mui/icons-material/Hail";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import NoteAltIcon from '@mui/icons-material/NoteAlt';

const Sidebar = () => {
  return (
    <aside className={Styles.container}>
      {/* Logo */}
      <div className={Styles.logo}>
        <img src={pic} alt="Logo" />
        <h3>Fleet Admin</h3>
      </div>

      {/* Menu */}
      <nav className={Styles.menu}>
        <Link to="/admin/" className={Styles.item}>
          <BusinessCenterIcon /> <span>Dashboard</span>
        </Link>

     
        <Link to="/admin/adminregistration" className={Styles.item}>
          <NoteAltIcon /> <span>Admin Registration</span>
        </Link>

        <Link to="/admin/managerregistration" className={Styles.item}>
          <NoteAltIcon /> <span>Manager Registration</span>
        </Link>

        <Link to="/admin/staffregistration" className={Styles.item}>
          <NoteAltIcon /> <span>Staff Registration</span>
        </Link>

     
        <Link to="/admin/viewuser" className={Styles.item}>
          <HailIcon /> <span>User Management</span>
        </Link>

        <Link to="/admin/reports" className={Styles.item}>
          <BarChartIcon /> <span>Reports</span>
        </Link>

       
        <Link to="/admin/district" className={Styles.item}>
          <HomeIcon /> <span>District</span>
        </Link>

        <Link to="/admin/stafftype" className={Styles.item}>
          <HomeIcon /> <span>StaffType</span>
        </Link>

        
       


      </nav>
    </aside>
  );
};

export default Sidebar;