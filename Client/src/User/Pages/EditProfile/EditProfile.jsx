import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";

const API = "http://localhost:5000";

const EditProfile = () => {
  const navigate = useNavigate();
  const uid = sessionStorage.getItem("uid");

  const [places, setPlaces] = useState([]);

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userContact, setUserContact] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [placeId, setPlaceId] = useState("");

  useEffect(() => {
    if (!uid) return;

    axios.get(`${API}/place`).then((r) => setPlaces(r.data.data || []));

    axios
      .get(`${API}/user/${uid}`)
      .then((res) => {
        const d = res.data;
        setUserName(d.userName || "");
        setUserEmail(d.userEmail || "");
        setUserContact(d.userContact || "");
        setUserAddress(d.userAddress || "");
        setPlaceId(d.placeId || "");
      })
      .catch(() => alert("Failed to load profile"));
  }, [uid]);

  const update = async () => {
    try {
      if (!userName || !userEmail || !userContact || !userAddress || !placeId) {
        return alert("All fields required");
      }

      const res = await axios.put(`${API}/user/${uid}`, {
        userName,
        userEmail,
        userContact,
        userAddress,
        placeId,
      });

      alert(res.data.message || "Updated");
      sessionStorage.setItem("userName", userName);
      navigate("/user/myprofile");
    } catch (e) {
      alert(e?.response?.data?.message || "Update failed");
    }
  };

  if (!uid) return <div>Please login</div>;

  return (
    <div style={{ padding: 20 }}>
      <h3>Edit Profile</h3>

      <table border="1" cellPadding="8">
        <tbody>
          <tr>
            <td>Name</td>
            <td>
              <input value={userName} onChange={(e) => setUserName(e.target.value)} />
            </td>
          </tr>

          <tr>
            <td>Email</td>
            <td>
              <input value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
            </td>
          </tr>

          <tr>
            <td>Contact</td>
            <td>
              <input value={userContact} onChange={(e) => setUserContact(e.target.value)} />
            </td>
          </tr>

          <tr>
            <td>Address</td>
            <td>
              <input value={userAddress} onChange={(e) => setUserAddress(e.target.value)} />
            </td>
          </tr>

          <tr>
            <td>Place</td>
            <td>
              <select value={placeId} onChange={(e) => setPlaceId(e.target.value)}>
                <option value="">Select place</option>
                {places.map((p) => (
                  <option key={p.placeId} value={p.placeId}>
                    {p.placeName}
                  </option>
                ))}
              </select>
            </td>
          </tr>

          <tr>
            <td colSpan="2" align="center">
              <button onClick={update}>Update</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default EditProfile;