import React from "react";
import Styles from "./AdminDashboard.module.css";

const Dashboard = () => {
  return (
    <div className={Styles.adminDashboard}>
      {/* Header */}
      <header className={Styles.adminHeader}>
        <h2>Admin Dashboard</h2>
        <input type="text" placeholder="Search here..." />
      </header>

      {/* Stat Cards */}
      <section className={Styles.statsGrid}>
        <div className={Styles.statCard}>
          <span>Total Vehicles</span>
          <h3>25</h3>
          <p className={Styles.positive}>+10% from last week</p>
        </div>

        <div className={Styles.statCard}>
          <span>Active Drivers</span>
          <h3>18</h3>
          <p className={Styles.positive}>+8% from last week</p>
        </div>

        <div className={Styles.statCard}>
          <span>Ongoing Trips</span>
          <h3>7</h3>
          <p className={Styles.neutral}>Live tracking</p>
        </div>

        <div className={Styles.statCard}>
          <span>Pending Maintenance</span>
          <h3>3</h3>
          <p className={Styles.warning}>Needs attention</p>
        </div>
      </section>

      {/* Table */}
      <section className={Styles.tableCard}>
        <h3>Recent Trips</h3>
        <table>
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Driver</th>
              <th>Destination</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>001</td>
              <td>Abid</td>
              <td>Ras Laffan</td>
              <td className={`${Styles.status} ${Styles.completed}`}>
                Completed
              </td>
            </tr>
            <tr>
              <td>002</td>
              <td>Ashraf</td>
              <td>Al Wakra</td>
              <td className={`${Styles.status} ${Styles.ongoing}`}>
                Ongoing
              </td>
            </tr>
            <tr>
              <td>003</td>
              <td>Ajnas</td>
              <td>HIA</td>
              <td className={`${Styles.status} ${Styles.pending}`}>
                Pending
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default Dashboard;