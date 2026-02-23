import axios from "axios";
import React, { useEffect, useState } from "react";

const API = "http://localhost:5000";

export default function Manager() {
  const [list, setList] = useState([]);
  const [places, setPlaces] = useState([]);
  const [editId, setEditId] = useState("");

  const [managerName, setManagerName] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [managerContact, setManagerContact] = useState("");
  const [managerAddress, setManagerAddress] = useState("");
  const [managerPassword, setManagerPassword] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [managerPhoto, setManagerPhoto] = useState(null); // file

  const load = () => axios.get(`${API}/manager`).then((r) => setList(r.data.data || []));
  const loadPlaces = () => axios.get(`${API}/place`).then((r) => setPlaces(r.data.data || []));

  useEffect(() => {
    load();
    loadPlaces();
  }, []);

  const reset = () => {
    setEditId("");
    setManagerName("");
    setManagerEmail("");
    setManagerContact("");
    setManagerAddress("");
    setManagerPassword("");
    setPlaceId("");
    setManagerPhoto(null);
  };

  const save = async () => {
    if (!managerName.trim() || !managerEmail.trim() || !managerContact.trim() || !managerPassword.trim() || !placeId)
      return;

    const fd = new FormData();
    fd.append("managerName", managerName);
    fd.append("managerEmail", managerEmail);
    fd.append("managerContact", managerContact);
    fd.append("managerAddress", managerAddress);
    fd.append("managerPassword", managerPassword);
    fd.append("placeId", placeId);
    if (managerPhoto) fd.append("managerPhoto", managerPhoto);

    if (editId) await axios.put(`${API}/manager/${editId}`, fd);
    else await axios.post(`${API}/manager`, fd);

    reset();
    load();
  };

  const edit = (m) => {
    setEditId(m.managerId);
    setManagerName(m.managerName || "");
    setManagerEmail(m.managerEmail || "");
    setManagerContact(m.managerContact || "");
    setManagerAddress(m.managerAddress || "");
    setManagerPassword(m.managerPassword || "");
    setPlaceId(m.placeId || "");
    setManagerPhoto(null); // user can select new file if wanted
  };

  const remove = async (id) => {
    await axios.delete(`${API}/manager/${id}`);
    load();
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <input placeholder="Name" value={managerName} onChange={(e) => setManagerName(e.target.value)} />
        <input placeholder="Email" value={managerEmail} onChange={(e) => setManagerEmail(e.target.value)} />
        <input placeholder="Contact" value={managerContact} onChange={(e) => setManagerContact(e.target.value)} />
        <input placeholder="Address" value={managerAddress} onChange={(e) => setManagerAddress(e.target.value)} />
        <input placeholder="Password" value={managerPassword} onChange={(e) => setManagerPassword(e.target.value)} />

        <select value={placeId} onChange={(e) => setPlaceId(e.target.value)}>
          <option value="">Select place</option>
          {places.map((p) => (
            <option key={p.placeId} value={p.placeId}>
              {p.placeName}
            </option>
          ))}
        </select>

        <input type="file" onChange={(e) => setManagerPhoto(e.target.files?.[0] || null)} />

        <button onClick={save}>{editId ? "Update" : "Save"}</button>
        {editId && <button onClick={reset}>Cancel</button>}
      </div>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Photo</th>
            <th>Name</th>
            <th>Email</th>
            <th>Contact</th>
            <th>Place</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {list.map((m) => (
            <tr key={m.managerId}>
              <td>
                {m.managerPhoto ? (
                  <img
                    src={`${API}${m.managerPhoto}`}
                    alt=""
                    width="50"
                    height="50"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  "-"
                )}
              </td>
              <td>{m.managerName}</td>
              <td>{m.managerEmail}</td>
              <td>{m.managerContact}</td>
              <td>{m.placeName || "-"}</td>
              <td>
                <button onClick={() => edit(m)}>Edit</button>{" "}
                <button onClick={() => remove(m.managerId)}>Delete</button>
              </td>
            </tr>
          ))}

          {!list.length && (
            <tr>
              <td colSpan="6">No managers</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}