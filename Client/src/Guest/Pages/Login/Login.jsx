import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";

const API = "http://localhost:5000/login";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(API, { email, password });
      const { role, id, message } = res.data;

      alert(message);

     
      if (role === "admin") {
        sessionStorage.setItem("aid", id);
        navigate("/admin/home");
      } else if (role === "manager") {
        sessionStorage.setItem("mid", id);
        navigate("/manager/home");
      } else if (role === "staff") {
        sessionStorage.setItem("sid", id);
        navigate("/staff/home");
      } else if (role === "user") {
        sessionStorage.setItem("uid", id);
        navigate("/user/home");
      } else {
        alert("Invalid role");
      }
    } catch (e) {
      alert(e?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Login</h3>
      <table border="1" cellPadding="8">
        <tbody>
          <tr>
            <td>Email</td>
            <td>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </td>
          </tr>
          <tr>
            <td>Password</td>
            <td>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </td>
          </tr>
          <tr>
            <td colSpan="2" align="center">
              <button onClick={handleLogin}>Login</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}