import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";

const API = "http://localhost:5000";

const EditProfile = () => {
  const navigate = useNavigate();
  const sid = sessionStorage.getItem("sid");

  const [places, setPlaces] = useState([]);
  const [types, setTypes] = useState([]);

  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffContact, setStaffContact] = useState("");
  const [staffAddress, setStaffAddress] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [stafftypeId, setStafftypeId] = useState("");
  const [staffPhoto, setStaffPhoto] = useState(null);

  useEffect(() => {
    if (!sid) return;

    axios.get(`${API}/place`).then((r) => setPlaces(r.data.data || []));
    axios.get(`${API}/stafftype`).then((r) => setTypes(r.data.data || []));

    axios
      .get(`${API}/staff/${sid}`)
      .then((res) => {
        const d = res.data;
        setStaffName(d.staffName || "");
        setStaffEmail(d.staffEmail || "");
        setStaffContact(d.staffContact || "");
        setStaffAddress(d.staffAddress || "");
        setPlaceId(d.placeId || "");
        setStafftypeId(d.stafftypeId || "");
      })
      .catch(() => alert("Failed to load profile"));
  }, [sid]);

  const update = async () => {
    try {
      if (!staffName || !staffEmail || !staffContact || !staffAddress || !placeId || !stafftypeId)
        return alert("All fields required");

      const fd = new FormData();
      fd.append("staffName", staffName);
      fd.append("staffEmail", staffEmail);
      fd.append("staffContact", staffContact);
      fd.append("staffAddress", staffAddress);
      fd.append("placeId", placeId);
      fd.append("stafftypeId", stafftypeId);
      if (staffPhoto) fd.append("staffPhoto", staffPhoto);

      const res = await axios.put(`${API}/staff/${sid}`, fd);

      alert(res.data.message || "Updated");
      sessionStorage.setItem("name", staffName);
      navigate("/staff/myprofile");
    } catch (e) {
      alert(e?.response?.data?.message || "Update failed");
    }
  };

  if (!sid) return <div>Please login</div>;

  return (
    <div style={{ padding: 20 }}>
      <h3>Edit Profile (Staff)</h3>

      <table border="1" cellPadding="8">
        <tbody>
          <tr>
            <td>Name</td>
            <td>
              <input value={staffName} onChange={(e) => setStaffName(e.target.value)} />
            </td>
          </tr>

          <tr>
            <td>Email</td>
            <td>
              <input value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} />
            </td>
          </tr>

          <tr>
            <td>Contact</td>
            <td>
              <input value={staffContact} onChange={(e) => setStaffContact(e.target.value)} />
            </td>
          </tr>

          <tr>
            <td>Address</td>
            <td>
              <input value={staffAddress} onChange={(e) => setStaffAddress(e.target.value)} />
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
            <td>Staff Type</td>
            <td>
              <select value={stafftypeId} onChange={(e) => setStafftypeId(e.target.value)}>
                <option value="">Select staff type</option>
                {types.map((t) => (
                  <option key={t.stafftypeId} value={t.stafftypeId}>
                    {t.stafftypeName}
                  </option>
                ))}
              </select>
            </td>
          </tr>

          <tr>
            <td>Photo</td>
            <td>
              <input type="file" onChange={(e) => setStaffPhoto(e.target.files?.[0] || null)} />
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