import React from "react";
import { NavLink, useNavigate } from "react-router";
import Styles from "./Sidebar.module.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className={Styles.sidebar}>
      <h2 className={Styles.logo}>
        {role === "admin" ? "Admin Panel" : "Manager Panel"}
      </h2>

      <nav className={Styles.nav}>
        {role === "admin" && (
          <>
            <NavLink to="/admin/dashboard" className={Styles.link}>
              Dashboard
            </NavLink>
            <NavLink to="/admin/users" className={Styles.link}>
              Manage Users
            </NavLink>
            <NavLink to="/admin/trips" className={Styles.link}>
              All Trips
            </NavLink>
          </>
        )}

        {role === "manager" && (
          <>
            <NavLink to="/manager/dashboard" className={Styles.link}>
              Dashboard
            </NavLink>
            <NavLink to="/manager/assign-trip" className={Styles.link}>
              Assign Trip
            </NavLink>
            <NavLink to="/manager/manage-trips" className={Styles.link}>
              Manage Trips
            </NavLink>
            <NavLink to="/manager/drivers" className={Styles.link}>
              Drivers List
            </NavLink>
          </>
        )}
      </nav>

      <button onClick={handleLogout} className={Styles.logout}>
        Logout
      </button>
    </div>
  );
};

export default Sidebar;