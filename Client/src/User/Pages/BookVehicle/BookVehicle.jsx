import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router";

const API = "http://localhost:5000";

const BookVehicle = () => {
  const { vehicleId } = useParams();
  const navigate = useNavigate();

  const uid = sessionStorage.getItem("uid");

  const [vehicle, setVehicle] = useState(null);
  const [places, setPlaces] = useState([]);

  const [bookingFromdate, setBookingFromdate] = useState("");
  const [bookingTodate, setBookingTodate] = useState("");
  const [bookingFromplaceId, setBookingFromplaceId] = useState("");
  const [bookingToplaceId, setBookingToplaceId] = useState("");

  const [available, setAvailable] = useState(null); // null/true/false

  useEffect(() => {
    axios.get(`${API}/vehicle/${vehicleId}`).then((r) => setVehicle(r.data));
    axios.get(`${API}/place`).then((r) => setPlaces(r.data.data || []));
  }, [vehicleId]);

  const { days, amount } = useMemo(() => {
    if (!vehicle?.vehiclePrice || !bookingFromdate || !bookingTodate) return { days: 0, amount: 0 };

    const from = new Date(bookingFromdate);
    const to = new Date(bookingTodate);
    if (isNaN(from) || isNaN(to) || from > to) return { days: 0, amount: 0 };

    const msDay = 24 * 60 * 60 * 1000;
    const d = Math.max(1, Math.ceil((to - from) / msDay) + 1); // inclusive
    return { days: d, amount: Number(vehicle.vehiclePrice) * d };
  }, [vehicle, bookingFromdate, bookingTodate]);

  const checkAvailability = async () => {
    try {
      if (!bookingFromdate || !bookingTodate) return alert("Select dates");
      const res = await axios.post(`${API}/booking/check`, {
        vehicleId,
        bookingFromdate,
        bookingTodate,
      });
      setAvailable(res.data.available);
      alert(res.data.available ? "Available ✅" : "Not Available ❌");
    } catch (e) {
      alert(e?.response?.data?.message || "Check failed");
    }
  };

  const bookNow = async () => {
    try {
      if (!uid) return alert("Please login");
      if (!bookingFromdate || !bookingTodate) return alert("Select dates");
      if (!bookingFromplaceId || !bookingToplaceId) return alert("Select places");
      if (days === 0) return alert("Invalid dates");
      if (available === false) return alert("Not available for selected dates");

      const res = await axios.post(`${API}/booking`, {
        userId: uid,
        vehicleId,
        bookingFromdate,
        bookingTodate,
        bookingFromplaceId,
        bookingToplaceId,
      });

      alert(`${res.data.message}\nDays: ${res.data.days}\nAmount: ${res.data.bookingAmount}`);
      navigate("/user/home");
    } catch (e) {
      alert(e?.response?.data?.message || "Booking failed");
    }
  };

  if (!vehicle) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h3>Book Vehicle</h3>

      <table border="1" cellPadding="8">
        <tbody>
          <tr>
            <td>Vehicle</td>
            <td>
              <b>{vehicle.vehicleName}</b>
            </td>
          </tr>

          <tr>
            <td>Photo</td>
            <td>
              {vehicle.vehiclePhoto ? (
                <img
                  src={`${API}${vehicle.vehiclePhoto}`}
                  alt=""
                  width="200"
                  height="120"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                "-"
              )}
            </td>
          </tr>

          <tr>
            <td>From Date</td>
            <td>
              <input
                type="date"
                value={bookingFromdate}
                onChange={(e) => {
                  setBookingFromdate(e.target.value);
                  setAvailable(null);
                }}
              />
            </td>
          </tr>

          <tr>
            <td>To Date</td>
            <td>
              <input
                type="date"
                value={bookingTodate}
                onChange={(e) => {
                  setBookingTodate(e.target.value);
                  setAvailable(null);
                }}
              />
            </td>
          </tr>

          <tr>
            <td>From Place</td>
            <td>
              <select value={bookingFromplaceId} onChange={(e) => setBookingFromplaceId(e.target.value)}>
                <option value="">Select</option>
                {places.map((p) => (
                  <option key={p.placeId} value={p.placeId}>
                    {p.placeName}
                  </option>
                ))}
              </select>
            </td>
          </tr>

          <tr>
            <td>To Place</td>
            <td>
              <select value={bookingToplaceId} onChange={(e) => setBookingToplaceId(e.target.value)}>
                <option value="">Select</option>
                {places.map((p) => (
                  <option key={p.placeId} value={p.placeId}>
                    {p.placeName}
                  </option>
                ))}
              </select>
            </td>
          </tr>

          <tr>
            <td>Days</td>
            <td>{days}</td>
          </tr>

          <tr>
            <td>Total Amount</td>
            <td>{amount}</td>
          </tr>

          <tr>
            <td>Availability</td>
            <td>
              {available === null ? "-" : available ? "Available ✅" : "Not Available ❌"}
            </td>
          </tr>

          <tr>
            <td colSpan="2" align="center">
              <button onClick={checkAvailability}>Check Availability</button>{" "}
              <button onClick={bookNow}>Book Now</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default BookVehicle;