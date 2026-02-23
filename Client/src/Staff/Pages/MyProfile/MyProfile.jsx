import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000";

const MyProfile = () => {
  const [data, setData] = useState(null);
  const sid = sessionStorage.getItem("sid");

  useEffect(() => {
    if (!sid) return;

    axios
      .get(`${API}/staff/${sid}`)
      .then((res) => setData(res.data))
      .catch(() => alert("Failed to load profile"));
  }, [sid]);

  if (!sid) return <div>Please login</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h3>My Profile (Staff)</h3>

      <table border="1" cellPadding="8">
        <tbody>
          <tr>
            <td>Photo</td>
            <td>
              {data.staffPhoto ? (
                <img
                  src={`${API}${data.staffPhoto}`}
                  alt=""
                  width="80"
                  height="80"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                "-"
              )}
            </td>
          </tr>

          <tr>
            <td>Name</td>
            <td>{data.staffName}</td>
          </tr>
          <tr>
            <td>Email</td>
            <td>{data.staffEmail}</td>
          </tr>
          <tr>
            <td>Contact</td>
            <td>{data.staffContact}</td>
          </tr>
          <tr>
            <td>Address</td>
            <td>{data.staffAddress}</td>
          </tr>
          <tr>
            <td>Place</td>
            <td>{data.placeName || "-"}</td>
          </tr>
          <tr>
            <td>Staff Type</td>
            <td>{data.stafftypeName || "-"}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default MyProfile;