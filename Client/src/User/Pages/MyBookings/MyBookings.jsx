import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000";

const statusText = (s) => {
  if (s === 0) return "Pending";
  if (s === 1) return "Accepted";
  if (s === 2) return "Rejected";
  if (s === 3) return "Cancelled";
  if (s === 4) return "Completed";
  return "-";
};

const MyBookings = () => {
  const uid = sessionStorage.getItem("uid");
  const [list, setList] = useState([]);

  const load = () =>
    axios
      .get(`${API}/booking/user/${uid}`)
      .then((r) => setList(r.data.data || []))
      .catch(() => alert("Failed to load bookings"));

  useEffect(() => {
    if (uid) load();
  }, [uid]);

  const cancel = async (bookingId) => {
    try {
      await axios.put(`${API}/booking/cancel/${bookingId}`);
      alert("Cancelled");
      load();
    } catch (e) {
      alert(e?.response?.data?.message || "Cancel failed");
    }
  };

  if (!uid) return <div style={{ padding: 20 }}>Please login</div>;

  return (
    <div style={{ padding: 16 }}>
      <h3>My Bookings</h3>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Photo</th>
            <th>From</th>
            <th>To</th>
            <th>Dates</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {list.map((b) => (
            <tr key={b.bookingId}>
              <td>{b.vehicleName || "-"}</td>
              <td>
                {b.vehiclePhoto ? (
                  <img
                    src={`${API}${b.vehiclePhoto}`}
                    alt=""
                    width="80"
                    height="50"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  "-"
                )}
              </td>
              <td>{b.fromPlaceName || "-"}</td>
              <td>{b.toPlaceName || "-"}</td>
              <td>
                {b.bookingFromdate?.slice(0, 10)} to {b.bookingTodate?.slice(0, 10)}
              </td>
              <td>{b.bookingAmount}</td>
              <td>{statusText(b.bookingStatus)}</td>
              <td>
                {(b.bookingStatus === 0 || b.bookingStatus === 1) ? (
                  <button onClick={() => cancel(b.bookingId)}>Cancel</button>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}

          {!list.length && (
            <tr>
              <td colSpan="8">No bookings</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MyBookings;