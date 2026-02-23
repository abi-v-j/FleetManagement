import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000";

const MyProfile = () => {
  const [data, setData] = useState(null);
  const uid = sessionStorage.getItem("uid");

  useEffect(() => {
    if (!uid) return;

    axios.get(`${API}/user/${uid}`)
      .then((res) => setData(res.data))
      .catch(() => alert("Failed to load profile"));
  }, [uid]);

  if (!uid) return <div>Please login</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h3>My Profile</h3>

      <table border="1" cellPadding="8">
        <tbody>
          <tr>
            <td>Name</td>
            <td>{data.userName}</td>
          </tr>
          <tr>
            <td>Email</td>
            <td>{data.userEmail}</td>
          </tr>
          <tr>
            <td>Contact</td>
            <td>{data.userContact}</td>
          </tr>
          <tr>
            <td>Address</td>
            <td>{data.userAddress}</td>
          </tr>
          <tr>
            <td>Place</td>
            <td>{data.placeName || "-"}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default MyProfile;