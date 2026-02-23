import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API = "http://localhost:5000";

const SearchVehicle = () => {
  const [list, setList] = useState([]);

  const [q, setQ] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [seat, setSeat] = useState("");

  const load = () =>
    axios.get(`${API}/vehicle`).then((r) => setList(r.data.data || []));

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    const min = minPrice === "" ? null : Number(minPrice);
    const max = maxPrice === "" ? null : Number(maxPrice);
    const seats = seat === "" ? null : Number(seat);

    return list.filter((v) => {
      const name = (v.vehicleName || "").toLowerCase();
      const desc = (v.vehicleDescription || "").toLowerCase();
      const price = Number(v.vehiclePrice);
      const seatcount = Number(v.vehicleSeatcount);

      if (text && !(name.includes(text) || desc.includes(text))) return false;
      if (min !== null && price < min) return false;
      if (max !== null && price > max) return false;
      if (seats !== null && seatcount !== seats) return false;

      return true;
    });
  }, [list, q, minPrice, maxPrice, seat]);

  return (
    <div style={{ padding: 16 }}>
      <h3>Search Vehicles</h3>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <input
          placeholder="Search name/description"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <input
          placeholder="Min price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          placeholder="Max price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <input
          placeholder="Seat count"
          value={seat}
          onChange={(e) => setSeat(e.target.value)}
        />

        <button
          onClick={() => {
            setQ("");
            setMinPrice("");
            setMaxPrice("");
            setSeat("");
          }}
        >
          Clear
        </button>

        <button onClick={load}>Refresh</button>
      </div>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Photo</th>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Seats</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((v) => (
            <tr key={v.vehicleId}>
              <td>
                {v.vehiclePhoto ? (
                  <img
                    src={`${API}${v.vehiclePhoto}`}
                    alt=""
                    width="80"
                    height="50"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  "-"
                )}
              </td>
              <td>{v.vehicleName}</td>
              <td>{v.vehicleDescription}</td>
              <td>{v.vehiclePrice}</td>
              <td>{v.vehicleSeatcount}</td>
              <td>
                <Link to={`/user/vehicle/${v.vehicleId}`}>View Details</Link>
              </td>
            </tr>
          ))}

          {!filtered.length && (
            <tr>
              <td colSpan="6">No vehicles found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SearchVehicle;