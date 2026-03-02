import React, { useEffect, useMemo, useRef, useState } from "react";
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

  const [availability, setAvailability] = useState("idle"); 
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const debounceRef = useRef(null);

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    axios.get(`${API}/vehicle/${vehicleId}`).then((r) => setVehicle(r.data));
    axios.get(`${API}/place`).then((r) => setPlaces(r.data.data || []));
  }, [vehicleId]);

  // ---------------- REAL TIME CALCULATION ----------------
  const { days, amount, validDates } = useMemo(() => {
    if (!vehicle?.vehiclePrice || !bookingFromdate || !bookingTodate)
      return { days: 0, amount: 0, validDates: false };

    const from = new Date(bookingFromdate);
    const to = new Date(bookingTodate);

    if (isNaN(from) || isNaN(to) || from > to)
      return { days: 0, amount: 0, validDates: false };

    const msDay = 24 * 60 * 60 * 1000;
    const d = Math.max(1, Math.ceil((to - from) / msDay) + 1);

    return {
      days: d,
      amount: Number(vehicle.vehiclePrice) * d,
      validDates: true,
    };
  }, [vehicle, bookingFromdate, bookingTodate]);

  // ---------------- AUTO AVAILABILITY CHECK ----------------
  useEffect(() => {
    setAvailability("idle");
    setMessage("");

    if (!validDates) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        setAvailability("checking");

        const res = await axios.post(`${API}/booking/check`, {
          vehicleId,
          bookingFromdate,
          bookingTodate,
        });

        if (res.data.available) {
          setAvailability("available");
        } else {
          setAvailability("unavailable");
        }
      } catch (e) {
        setAvailability("idle");
        setMessage(e?.response?.data?.message || "Availability check failed");
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [vehicleId, bookingFromdate, bookingTodate, validDates]);

  // ---------------- VALIDATIONS ----------------
  const validPlaces =
    bookingFromplaceId &&
    bookingToplaceId &&
    bookingFromplaceId !== bookingToplaceId;

  const canBook =
    uid &&
    validDates &&
    validPlaces &&
    availability === "available" &&
    !loading;

  // ---------------- BOOK ----------------
  const bookNow = async () => {
    try {
      setMessage("");

      if (!uid) return setMessage("Please login");
      if (!validDates) return setMessage("Invalid dates");
      if (!validPlaces) return setMessage("Invalid places");
      if (availability !== "available")
        return setMessage("Vehicle not available");

      setLoading(true);

      const res = await axios.post(`${API}/booking`, {
        userId: uid,
        vehicleId,
        bookingFromdate,
        bookingTodate,
        bookingFromplaceId,
        bookingToplaceId,
      });

      alert(
        `${res.data.message}\nDays: ${res.data.days}\nAmount: ${res.data.bookingAmount}`
      );

      navigate("/user/home");
    } catch (e) {
      setMessage(e?.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
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
            <td><b>{vehicle.vehicleName}</b></td>
          </tr>

          <tr>
            <td>Price Per Day</td>
            <td>{vehicle.vehiclePrice}</td>
          </tr>

          <tr>
            <td>From Date</td>
            <td>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={bookingFromdate}
                onChange={(e) => setBookingFromdate(e.target.value)}
              />
            </td>
          </tr>

          <tr>
            <td>To Date</td>
            <td>
              <input
                type="date"
                min={bookingFromdate}
                value={bookingTodate}
                onChange={(e) => setBookingTodate(e.target.value)}
              />
            </td>
          </tr>

          <tr>
            <td>From Place</td>
            <td>
              <select value={bookingFromplaceId}
                onChange={(e) => setBookingFromplaceId(e.target.value)}>
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
              <select value={bookingToplaceId}
                onChange={(e) => setBookingToplaceId(e.target.value)}>
                <option value="">Select</option>
                {places.map((p) => (
                  <option key={p.placeId} value={p.placeId}>
                    {p.placeName}
                  </option>
                ))}
              </select>

              {bookingFromplaceId &&
                bookingToplaceId &&
                bookingFromplaceId === bookingToplaceId && (
                  <div style={{ color: "red" }}>
                    From and To place cannot be same
                  </div>
                )}
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
              {availability === "idle" && "-"}
              {availability === "checking" && "Checking..."}
              {availability === "available" && "Available ✅"}
              {availability === "unavailable" && "Not Available ❌"}
            </td>
          </tr>

          <tr>
            <td colSpan="2" align="center">
              <button disabled={!canBook} onClick={bookNow}>
                {loading ? "Booking..." : "Book Now"}
              </button>
            </td>
          </tr>

          {message && (
            <tr>
              <td colSpan="2" align="center" style={{ color: "red" }}>
                {message}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BookVehicle;