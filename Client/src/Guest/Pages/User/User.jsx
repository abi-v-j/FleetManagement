import axios from "axios";
import React, { useEffect, useState } from "react";

const API = "http://localhost:5000";

export default function User() {
  const [places, setPlaces] = useState([]);

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userContact, setUserContact] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [placeId, setPlaceId] = useState("");

  useEffect(() => {
    axios.get(`${API}/place`).then((res) => {
      setPlaces(res.data.data || []);
    });
  }, []);

  const save = async () => {
    if (!userName || !userEmail || !userContact || !userAddress || !userPassword || !placeId)
      return;

    await axios.post(`${API}/user`, {
      userName,
      userEmail,
      userContact,
      userAddress,
      userPassword,
      placeId,
    });

    // reset form
    setUserName("");
    setUserEmail("");
    setUserContact("");
    setUserAddress("");
    setUserPassword("");
    setPlaceId("");

    alert("Inserted Successfully");
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>User Registration</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 300 }}>
        <input placeholder="Name" value={userName} onChange={(e) => setUserName(e.target.value)} />
        <input placeholder="Email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
        <input placeholder="Contact" value={userContact} onChange={(e) => setUserContact(e.target.value)} />
        <input placeholder="Address" value={userAddress} onChange={(e) => setUserAddress(e.target.value)} />
        <input placeholder="Password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} />

        <select value={placeId} onChange={(e) => setPlaceId(e.target.value)}>
          <option value="">Select Place</option>
          {places.map((p) => (
            <option key={p.placeId} value={p.placeId}>
              {p.placeName}
            </option>
          ))}
        </select>

        <button onClick={save}>Register</button>
      </div>
    </div>
  );
}