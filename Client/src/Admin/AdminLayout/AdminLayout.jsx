import React from "react";
import Styles from "./AdminLayout.module.css";
import Sidebar from "../Components/Sidebar/Sidebar";
import AdminRoutes from "../../Routes/AdminRoutes";
import Navbar from "../Components/Navbar/Navbar";

const AdminLayout = () => {
  return (
    <div className={Styles.layout}>
      <aside className={Styles.sidebar}>
        <Sidebar />
      </aside>

      <main className={Styles.main}>
        <div className={Styles.navbar}>
          <Navbar />
        </div>

        <div className={Styles.content}>
          <AdminRoutes />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;