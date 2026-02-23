import React from "react";
import styles from "./Navbar.module.css";
import { Search } from "lucide-react";

const Navbar = () => {
  return (
    <div className={styles.navbar}>
      
      {/* LEFT */}
      <h3 className={styles.title}>Dashboard</h3>

      {/* CENTER SEARCH */}
      <div className={styles.searchBox}>
        <Search size={18} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search here..."
          className={styles.searchInput}
        />
      </div>

      {/* RIGHT */}
      <div className={styles.right}>
        <span className={styles.name}>Admin</span>
        <img
          src="https://i.pravatar.cc/150?img=12"
          alt="Admin"
          className={styles.avatar}
        />
      </div>

    </div>
  );
};

export default Navbar;