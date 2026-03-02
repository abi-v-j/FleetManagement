import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import Style from "./Navbar.module.css";

import {
  MenuRounded as MenuIcon,
  CloseRounded as CloseIcon,
  KeyboardArrowDownRounded as DownIcon,
  PersonRounded as PersonIcon,
  DirectionsCarRounded as CarIcon,
  FeedbackRounded as FeedbackIcon,
  ReportProblemRounded as ComplaintIcon,
  LockRounded as LockIcon,
  BookRounded as BookingIcon,
  LogoutRounded as LogoutIcon,
} from "@mui/icons-material";

const navItem = ({ isActive }) =>
  `${Style.navLink} ${isActive ? Style.navLinkActive : ""}`;

function useOutsideClick(ref, handler) {
  useEffect(() => {
    const onClick = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler();
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [ref, handler]);
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(""); // "profile" | "vehicles" | ""
  const wrapRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  useOutsideClick(wrapRef, () => setOpenMenu(""));

  // close dropdown + mobile on route change
  useEffect(() => {
    setOpenMenu("");
    setMobileOpen(false);
  }, [location.pathname]);

  const logout = () => {
    sessionStorage.removeItem("uid");
    navigate("/login");
  };

  const profileItems = [
    { to: "/user/myprofile", label: "My Profile", icon: <PersonIcon fontSize="small" /> },
    { to: "/user/editprofile", label: "Edit Profile", icon: <PersonIcon fontSize="small" /> },
    { to: "/user/changepassword", label: "Change Password", icon: <LockIcon fontSize="small" /> },
  ];

  const vehicleItems = [
    { to: "/user/mybookings", label: "My Bookings", icon: <BookingIcon fontSize="small" /> },
    // VehicleDetails / BookVehicle are dynamic routes, so we don’t show them as menu items.
  ];

  return (
    <div className={Style.shell} ref={wrapRef}>
      <div className={Style.navbar}>
        {/* Left */}
        <div className={Style.left}>
          <Link to="/user/myprofile" className={Style.brand}>
            <span className={Style.brandDot} />
            <span className={Style.brandText}>User Panel</span>
          </Link>
        </div>

        {/* Center (desktop links) */}
        <div className={Style.center}>
          <NavLink className={navItem} to="/user/complaints">
            <ComplaintIcon fontSize="small" />
            Complaints
          </NavLink>

          <NavLink className={navItem} to="/user/feedback">
            <FeedbackIcon fontSize="small" />
            Feedback
          </NavLink>

          {/* Profile dropdown */}
          <div className={Style.dropdown}>
            <button
              className={`${Style.dropBtn} ${openMenu === "profile" ? Style.dropBtnActive : ""}`}
              onClick={() => setOpenMenu((p) => (p === "profile" ? "" : "profile"))}
              type="button"
            >
              <PersonIcon fontSize="small" />
              Profile
              <DownIcon className={`${Style.chev} ${openMenu === "profile" ? Style.chevOpen : ""}`} />
            </button>

            <AnimatePresence>
              {openMenu === "profile" && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  className={Style.menu}
                >
                  {profileItems.map((it) => (
                    <NavLink key={it.to} to={it.to} className={Style.menuItem}>
                      <span className={Style.menuIcon}>{it.icon}</span>
                      <span>{it.label}</span>
                    </NavLink>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Vehicles dropdown */}
          <div className={Style.dropdown}>
            <button
              className={`${Style.dropBtn} ${openMenu === "vehicles" ? Style.dropBtnActive : ""}`}
              onClick={() => setOpenMenu((p) => (p === "vehicles" ? "" : "vehicles"))}
              type="button"
            >
              <CarIcon fontSize="small" />
              Vehicles
              <DownIcon className={`${Style.chev} ${openMenu === "vehicles" ? Style.chevOpen : ""}`} />
            </button>

            <AnimatePresence>
              {openMenu === "vehicles" && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  className={Style.menu}
                >
                  {vehicleItems.map((it) => (
                    <NavLink key={it.to} to={it.to} className={Style.menuItem}>
                      <span className={Style.menuIcon}>{it.icon}</span>
                      <span>{it.label}</span>
                    </NavLink>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right */}
        <div className={Style.right}>
          <button className={Style.logoutBtn} onClick={logout} type="button">
            <LogoutIcon fontSize="small" />
            Logout
          </button>

          {/* Mobile toggle */}
          <button
            className={Style.mobileBtn}
            onClick={() => setMobileOpen((s) => !s)}
            type="button"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={Style.mobileMenu}
          >
            <NavLink className={navItem} to="/user/complaints">
              <ComplaintIcon fontSize="small" />
              Complaints
            </NavLink>

            <NavLink className={navItem} to="/user/feedback">
              <FeedbackIcon fontSize="small" />
              Feedback
            </NavLink>

            <div className={Style.mobileSection}>
              <div className={Style.mobileSectionTitle}>Profile</div>
              {profileItems.map((it) => (
                <NavLink key={it.to} className={navItem} to={it.to}>
                  {it.icon}
                  {it.label}
                </NavLink>
              ))}
            </div>

            <div className={Style.mobileSection}>
              <div className={Style.mobileSectionTitle}>Vehicles</div>
              {vehicleItems.map((it) => (
                <NavLink key={it.to} className={navItem} to={it.to}>
                  {it.icon}
                  {it.label}
                </NavLink>
              ))}
            </div>

            <button className={`${Style.logoutBtn} ${Style.logoutMobile}`} onClick={logout} type="button">
              <LogoutIcon fontSize="small" />
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}