import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router";

const API = "http://localhost:5000";

const statusText = (s) => {
  if (s === 0) return "Pending";
  if (s === 1) return "Accepted";
  if (s === 2) return "Rejected";
  if (s === 3) return "Cancelled";
  if (s === 4) return "Completed";
  return "-";
};

const AssignStaff = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const managerId = sessionStorage.getItem("mid");

  const [booking, setBooking] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [staffId, setStaffId] = useState("");
  const [loading, setLoading] = useState(false);

  const loadBooking = async () => {
    try {
      const res = await axios.get(`${API}/manager/booking/${bookingId}`);
      setBooking(res.data);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to load booking");
    }
  };

  const loadStaff = async () => {
    try {
      const res = await axios.get(`${API}/manager/staff/${managerId}`);
      setStaffList(res.data.data || []);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to load staff");
    }
  };

  useEffect(() => {
    if (bookingId) loadBooking();
    if (managerId) loadStaff();
  }, [bookingId, managerId]);

  const handleAssign = async (e) => {
    e.preventDefault();

    if (!staffId) {
      alert("Please select staff");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API}/manager/assign`, {
        bookingId,
        staffId,
      });

      alert(res.data.message || "Assigned successfully");
      navigate("/manager/bookings");
    } catch (err) {
      alert(err?.response?.data?.message || "Assign failed");
    } finally {
      setLoading(false);
    }
  };

  if (!managerId) return <div style={{ padding: 20 }}>Please login</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Assign Staff</h2>

      {booking && (
        <div style={{ border: "1px solid #ccc", padding: 15, marginBottom: 20 }}>
          <p><strong>User:</strong> {booking.userName}</p>
          <p><strong>Vehicle:</strong> {booking.vehicleName}</p>
          <p><strong>From:</strong> {booking.fromPlaceName}</p>
          <p><strong>To:</strong> {booking.toPlaceName}</p>
          <p>
            <strong>Dates:</strong> {booking.bookingFromdate?.slice(0, 10)} to{" "}
            {booking.bookingTodate?.slice(0, 10)}
          </p>
          <p><strong>Amount:</strong> {booking.bookingAmount}</p>
          <p><strong>Status:</strong> {statusText(booking.bookingStatus)}</p>
        </div>
      )}

      <form onSubmit={handleAssign}>
        <select value={staffId} onChange={(e) => setStaffId(e.target.value)}>
          <option value="">-- Select Staff --</option>
          {staffList.map((s) => (
            <option key={s.staffId} value={s.staffId}>
              {s.staffName} {s.stafftypeName ? `(${s.stafftypeName})` : ""}
            </option>
          ))}
        </select>

        <div style={{ marginTop: 15 }}>
          <button type="submit" disabled={loading}>
            {loading ? "Assigning..." : "Assign Staff"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignStaff;