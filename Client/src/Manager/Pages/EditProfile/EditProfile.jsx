import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";

const API = "http://localhost:5000";

const EditProfile = () => {
  const navigate = useNavigate();
  const mid = sessionStorage.getItem("mid");

  const [places, setPlaces] = useState([]);

  const [managerName, setManagerName] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [managerContact, setManagerContact] = useState("");
  const [managerAddress, setManagerAddress] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [managerPhoto, setManagerPhoto] = useState(null);

  useEffect(() => {
    if (!mid) return;

    axios.get(`${API}/place`).then((r) => setPlaces(r.data.data || []));

    axios
      .get(`${API}/manager/${mid}`)
      .then((res) => {
        const d = res.data;
        setManagerName(d.managerName || "");
        setManagerEmail(d.managerEmail || "");
        setManagerContact(d.managerContact || "");
        setManagerAddress(d.managerAddress || "");
        setPlaceId(d.placeId || "");
      })
      .catch(() => alert("Failed to load profile"));
  }, [mid]);

  const update = async () => {
    try {
      if (!managerName || !managerEmail || !managerContact || !managerAddress || !placeId)
        return alert("All fields required");

      const fd = new FormData();
      fd.append("managerName", managerName);
      fd.append("managerEmail", managerEmail);
      fd.append("managerContact", managerContact);
      fd.append("managerAddress", managerAddress);
      fd.append("placeId", placeId);
      if (managerPhoto) fd.append("managerPhoto", managerPhoto);

      const res = await axios.put(`${API}/manager/${mid}`, fd);

      alert(res.data.message || "Updated");
      sessionStorage.setItem("name", managerName); // optional
      navigate("/manager/myprofile");
    } catch (e) {
      alert(e?.response?.data?.message || "Update failed");
    }
  };

  if (!mid) return <div>Please login</div>;

  return (
    <div style={{ padding: 20 }}>
      <h3>Edit Profile (Manager)</h3>

      <table border="1" cellPadding="8">
        <tbody>
          <tr>
            <td>Name</td>
            <td>
              <input value={managerName} onChange={(e) => setManagerName(e.target.value)} />
            </td>
          </tr>

          <tr>
            <td>Email</td>
            <td>
              <input value={managerEmail} onChange={(e) => setManagerEmail(e.target.value)} />
            </td>
          </tr>

          <tr>
            <td>Contact</td>
            <td>
              <input value={managerContact} onChange={(e) => setManagerContact(e.target.value)} />
            </td>
          </tr>

          <tr>
            <td>Address</td>
            <td>
              <input value={managerAddress} onChange={(e) => setManagerAddress(e.target.value)} />
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
            <td>Photo</td>
            <td>
              <input type="file" onChange={(e) => setManagerPhoto(e.target.files?.[0] || null)} />
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