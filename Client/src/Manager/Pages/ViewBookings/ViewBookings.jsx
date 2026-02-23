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

const ViewBookings = () => {
  const placeId = sessionStorage.getItem("placeId");
  const [list, setList] = useState([]);

  const load = () =>
    axios
      .get(`${API}/manager/bookings/${placeId}`)
      .then((r) => setList(r.data.data || []))
      .catch(() => alert("Failed to load bookings"));

  useEffect(() => {
    if (placeId) load();
  }, [placeId]);

  const accept = async (id) => {
    try {
      await axios.put(`${API}/manager/booking/accept/${id}`);
      load();
    } catch (e) {
      alert(e?.response?.data?.message || "Accept failed");
    }
  };

  const reject = async (id) => {
    try {
      await axios.put(`${API}/manager/booking/reject/${id}`);
      load();
    } catch (e) {
      alert(e?.response?.data?.message || "Reject failed");
    }
  };

  if (!placeId) return <div style={{ padding: 20 }}>Please login</div>;

  return (
    <div style={{ padding: 16 }}>
      <h3>Bookings (Manager)</h3>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>User</th>
            <th>Vehicle</th>
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
              <td>
                {b.userName}<br />
                {b.userEmail}<br />
                {b.userContact}
              </td>

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
                <div>{b.vehicleName}</div>
              </td>

              <td>{b.fromPlaceName || "-"}</td>
              <td>{b.toPlaceName || "-"}</td>

              <td>
                {b.bookingFromdate?.slice(0, 10)} to {b.bookingTodate?.slice(0, 10)}
              </td>

              <td>{b.bookingAmount}</td>
              <td>{statusText(b.bookingStatus)}</td>

              <td>
                {b.bookingStatus === 0 ? (
                  <>
                    <button onClick={() => accept(b.bookingId)}>Accept</button>{" "}
                    <button onClick={() => reject(b.bookingId)}>Reject</button>
                  </>
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

export default ViewBookings;