import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";

const API = "http://localhost:5000";

const ChangePassword = () => {
  const navigate = useNavigate();
  const sid = sessionStorage.getItem("sid");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const change = async () => {
    try {
      if (!oldPassword || !newPassword || !confirmPassword)
        return alert("All fields required");

      if (newPassword !== confirmPassword)
        return alert("New password and confirm password not same");

      const res = await axios.put(`${API}/staff/changepassword/${sid}`, {
        oldPassword,
        newPassword,
      });

      alert(res.data.message || "Changed");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      navigate("/staff/myprofile");
    } catch (e) {
      alert(e?.response?.data?.message || "Change password failed");
    }
  };

  if (!sid) return <div>Please login</div>;

  return (
    <div style={{ padding: 20 }}>
      <h3>Change Password (Staff)</h3>

      <table border="1" cellPadding="8">
        <tbody>
          <tr>
            <td>Old Password</td>
            <td>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </td>
          </tr>

          <tr>
            <td>New Password</td>
            <td>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </td>
          </tr>

          <tr>
            <td>Confirm Password</td>
            <td>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </td>
          </tr>

          <tr>
            <td colSpan="2" align="center">
              <button onClick={change}>Change</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ChangePassword;