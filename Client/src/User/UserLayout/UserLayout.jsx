import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../Components/Navbar/Navbar";
import UserRoutes from "../../Routes/UserRoutes";
import Style from "./UserLayout.module.css";

const UserLayout = () => {
  const navigate = useNavigate();

  // 🔒 Protect user routes
  useEffect(() => {
    const uid = sessionStorage.getItem("uid");
    if (!uid) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className={Style.page}>
      <Navbar />

      <main className={Style.content}>
        <UserRoutes />
      </main>
    </div>
  );
};

export default UserLayout;