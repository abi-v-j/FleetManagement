import React from "react";
import { useLocation } from "react-router";
import Styles from "./Navbar.module.css";

const Navbar = () => {
  const location = useLocation();
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name") || "User";

  const getTitle = () => {
    if (location.pathname.includes("dashboard")) return "Dashboard";
    if (location.pathname.includes("assign-trip")) return "Assign Trip";
    if (location.pathname.includes("manage-trips")) return "Manage Trips";
    if (location.pathname.includes("drivers")) return "Drivers List";
    if (location.pathname.includes("users")) return "Manage Users";
    return role === "admin" ? "Admin Panel" : "Manager Panel";
  };

  return (
    <div className={Styles.navbar}>
      <h2 className={Styles.title}>{getTitle()}</h2>

      <div className={Styles.right}>
        <span className={Styles.role}>
          {role?.toUpperCase()}
        </span>

        <span className={Styles.name}>
          {name}
        </span>
      </div>
    </div>
  );
};

export default Navbar;