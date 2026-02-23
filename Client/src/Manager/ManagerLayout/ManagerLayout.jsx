import React from "react";
import Styles from "./ManagerLayout.module.css"; 
import Sidebar from "../Components/Sidebar/Sidebar";
import ManagerRoutes from "../../Routes/ManagerRoutes";
import Navbar from "../Components/Navbar/Navbar";

const ManagerLayout = () => {
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
          <ManagerRoutes />
        </div>
      </main>
    </div>
  );
};

export default ManagerLayout;