import React from "react";
import Styles from "./ManagerDashboard.module.css"; 

const ManagerDashboard = () => {
  return (
    <div className={Styles.adminDashboard}>
      <header className={Styles.adminHeader}>
        <h2>Manager Dashboard</h2>
        <input type="text" placeholder="Search trips or drivers..." />
      </header>

      <section className={Styles.statsGrid}>
        <div className={Styles.statCard}>
          <span>Trips Assigned Today</span>
          <h3>12</h3>
          <p className={Styles.positive}>+4 from yesterday</p>
        </div>

        <div className={Styles.statCard}>
          <span>Active Drivers</span>
          <h3>15</h3>
          <p className={Styles.positive}>On duty</p>
        </div>

        <div className={Styles.statCard}>
          <span>Ongoing Trips</span>
          <h3>6</h3>
          <p className={Styles.neutral}>Currently in progress</p>
        </div>

        <div className={Styles.statCard}>
          <span>Unassigned Trips</span>
          <h3>3</h3>
          <p className={Styles.warning}>Needs assignment</p>
        </div>
      </section>

      <section className={Styles.tableCard}>
        <h3>Recent Assigned Trips</h3>
        <table>
          <thead>
            <tr>
              <th>Trip ID</th>
              <th>Driver</th>
              <th>Destination</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>T-101</td>
              <td>Rahman</td>
              <td>Ras Laffan</td>
              <td className={`${Styles.status} ${Styles.completed}`}>
                Completed
              </td>
            </tr>
            <tr>
              <td>T-102</td>
              <td>Khalid</td>
              <td>Al Wakra</td>
              <td className={`${Styles.status} ${Styles.ongoing}`}>
                Ongoing
              </td>
            </tr>
            <tr>
              <td>T-103</td>
              <td>Mohammed</td>
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

export default ManagerDashboard;