import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import Style from "./BookVehicle.module.css";

import {
  DirectionsCarRounded as CarIcon,
  LocationOnRounded as LocationIcon,
  CalendarTodayRounded as CalendarIcon,
  PaymentsRounded as PayIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorOutlineIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

const API = "http://localhost:5000";

/* ───────────────────────── Toast ───────────────────────── */
const Toast = ({ toasts, removeToast }) => (
  <div className={Style.toastWrapper}>
    <AnimatePresence>
      {toasts.map((t) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, x: 80, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 80, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className={`${Style.toast} ${
            t.type === "success" ? Style.toastSuccess : Style.toastError
          }`}
        >
          {t.type === "success" ? (
            <CheckCircleIcon className={Style.toastIcon} />
          ) : (
            <ErrorOutlineIcon className={Style.toastIcon} />
          )}
          <span className={Style.toastMsg}>{t.message}</span>

          <button onClick={() => removeToast(t.id)} className={Style.toastClose}>
            <CloseIcon fontSize="small" />
          </button>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

export default function BookVehicle() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const uid = sessionStorage.getItem("uid");

  const [vehicle, setVehicle] = useState(null);
  const [places, setPlaces] = useState([]);

  const [bookingFromdate, setBookingFromdate] = useState("");
  const [bookingTodate, setBookingTodate] = useState("");
  const [bookingFromplaceId, setBookingFromplaceId] = useState("");
  const [bookingToplaceId, setBookingToplaceId] = useState("");

  const [availability, setAvailability] = useState("idle"); // idle | checking | available | unavailable
  const [loading, setLoading] = useState(false);

  const [toasts, setToasts] = useState([]);
  const debounceRef = useRef(null);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    axios
      .get(`${API}/vehicle/${vehicleId}`)
      .then((r) => setVehicle(r.data))
      .catch(() => addToast("Failed to load vehicle.", "error"));

    axios
      .get(`${API}/place`)
      .then((r) => setPlaces(r.data.data || []))
      .catch(() => addToast("Failed to load places.", "error"));
  }, [vehicleId, addToast]);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // ---------------- REAL TIME CALCULATION ----------------
  const { days, amount, validDates, dateError } = useMemo(() => {
    if (!vehicle?.vehiclePrice || !bookingFromdate || !bookingTodate)
      return { days: 0, amount: 0, validDates: false, dateError: "" };

    const from = new Date(bookingFromdate);
    const to = new Date(bookingTodate);

    if (isNaN(from) || isNaN(to))
      return { days: 0, amount: 0, validDates: false, dateError: "Invalid date" };

    if (from > to)
      return { days: 0, amount: 0, validDates: false, dateError: "From date cannot be after To date" };

    const msDay = 24 * 60 * 60 * 1000;
    const d = Math.max(1, Math.ceil((to - from) / msDay) + 1);

    return {
      days: d,
      amount: Number(vehicle.vehiclePrice) * d,
      validDates: true,
      dateError: "",
    };
  }, [vehicle, bookingFromdate, bookingTodate]);

  // ---------------- AUTO AVAILABILITY CHECK ----------------
  useEffect(() => {
    setAvailability("idle");

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

        setAvailability(res.data.available ? "available" : "unavailable");
      } catch (e) {
        setAvailability("idle");
        addToast(e?.response?.data?.message || "Availability check failed", "error");
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [vehicleId, bookingFromdate, bookingTodate, validDates, addToast]);

  // ---------------- VALIDATIONS ----------------
  const validPlaces =
    bookingFromplaceId &&
    bookingToplaceId &&
    bookingFromplaceId !== bookingToplaceId;

  const placeError =
    bookingFromplaceId &&
    bookingToplaceId &&
    bookingFromplaceId === bookingToplaceId
      ? "From and To place cannot be same"
      : "";

  const canBook =
    uid &&
    validDates &&
    validPlaces &&
    availability === "available" &&
    !loading;

  // ---------------- BOOK ----------------
  const bookNow = async () => {
    if (!uid) return addToast("Please login to book.", "error");
    if (!validDates) return addToast(dateError || "Invalid dates.", "error");
    if (!bookingFromplaceId) return addToast("Select From place.", "error");
    if (!bookingToplaceId) return addToast("Select To place.", "error");
    if (!validPlaces) return addToast("From and To place cannot be same.", "error");
    if (availability !== "available") return addToast("Vehicle not available.", "error");

    try {
      setLoading(true);

      const res = await axios.post(`${API}/booking`, {
        userId: uid,
        vehicleId,
        bookingFromdate,
        bookingTodate,
        bookingFromplaceId,
        bookingToplaceId,
      });

      addToast(
        `${res.data.message || "Booked!"} • Days: ${res.data.days} • Amount: ${res.data.bookingAmount}`,
        "success"
      );

      navigate("/user/home");
    } catch (e) {
      addToast(e?.response?.data?.message || "Booking failed", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!vehicle) {
    return (
      <div className={Style.page}>
        <div className={Style.loadingCard}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
            className={Style.spinner}
          />
          <span className={Style.muted}>Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div className={Style.page}>
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className={Style.header}
      >
        <div className={Style.headerLeft}>
          <div className={Style.headerIcon}>
            <CarIcon className={Style.headerIconSvg} />
          </div>

          <div>
            <h1 className={Style.title}>Book Vehicle</h1>
            <p className={Style.subtitle}>
              <b className={Style.vehicleName}>{vehicle.vehicleName}</b> • ₹ {vehicle.vehiclePrice} / day
            </p>
          </div>
        </div>

        <div className={Style.rightInfo}>
          <span className={Style.pill}>
            <PayIcon fontSize="small" /> Total: ₹ {amount}
          </span>
          <span className={Style.pill}>
            <CalendarIcon fontSize="small" /> {days} day(s)
          </span>
        </div>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={Style.card}
      >
        <div className={Style.grid}>
          {/* Dates */}
          <div className={Style.fieldGroup}>
            <label className={Style.label}>
              <CalendarIcon fontSize="small" /> From Date
            </label>
            <input
              className={Style.input}
              type="date"
              min={todayStr}
              value={bookingFromdate}
              onChange={(e) => {
                setBookingFromdate(e.target.value);
                // if To is before new From, reset To
                if (bookingTodate && e.target.value && bookingTodate < e.target.value) {
                  setBookingTodate("");
                }
              }}
            />
          </div>

          <div className={Style.fieldGroup}>
            <label className={Style.label}>
              <CalendarIcon fontSize="small" /> To Date
            </label>
            <input
              className={Style.input}
              type="date"
              min={bookingFromdate || todayStr}
              value={bookingTodate}
              onChange={(e) => setBookingTodate(e.target.value)}
            />
          </div>

          {/* Places */}
          <div className={Style.fieldGroup}>
            <label className={Style.label}>
              <LocationIcon fontSize="small" /> From Place
            </label>
            <select
              className={Style.select}
              value={bookingFromplaceId}
              onChange={(e) => setBookingFromplaceId(e.target.value)}
            >
              <option value="">Select</option>
              {places.map((p) => (
                <option key={p.placeId} value={p.placeId}>
                  {p.placeName}
                </option>
              ))}
            </select>
          </div>

          <div className={Style.fieldGroup}>
            <label className={Style.label}>
              <LocationIcon fontSize="small" /> To Place
            </label>
            <select
              className={Style.select}
              value={bookingToplaceId}
              onChange={(e) => setBookingToplaceId(e.target.value)}
            >
              <option value="">Select</option>
              {places.map((p) => (
                <option key={p.placeId} value={p.placeId}>
                  {p.placeName}
                </option>
              ))}
            </select>

            {!!placeError && <div className={Style.hintError}>{placeError}</div>}
          </div>
        </div>

        {!!dateError && <div className={Style.hintError} style={{ marginTop: 10 }}>{dateError}</div>}

        {/* Summary Row */}
        <div className={Style.summaryRow}>
          <div className={Style.summaryItem}>
            <span className={Style.summaryLabel}>Days</span>
            <span className={Style.summaryValue}>{days}</span>
          </div>

          <div className={Style.summaryItem}>
            <span className={Style.summaryLabel}>Total Amount</span>
            <span className={Style.summaryValueStrong}>₹ {amount}</span>
          </div>

          <div className={Style.summaryItem}>
            <span className={Style.summaryLabel}>Availability</span>
            <span
              className={`${Style.badge} ${
                availability === "available"
                  ? Style.badgeOk
                  : availability === "unavailable"
                  ? Style.badgeBad
                  : availability === "checking"
                  ? Style.badgeWait
                  : Style.badgeIdle
              }`}
            >
              {availability === "idle" && "—"}
              {availability === "checking" && "Checking…"}
              {availability === "available" && "Available ✅"}
              {availability === "unavailable" && "Not Available ❌"}
            </span>
          </div>
        </div>

        {/* Action */}
        <div className={Style.actions}>
          <motion.button
            whileHover={{ scale: canBook ? 1.02 : 1 }}
            whileTap={{ scale: canBook ? 0.98 : 1 }}
            className={Style.btnPrimary}
            disabled={!canBook}
            onClick={bookNow}
          >
            {loading ? <span className={Style.btnSpinner} /> : <CheckCircleIcon fontSize="small" />}
            {loading ? "Booking…" : "Book Now"}
          </motion.button>

          {!uid && <div className={Style.muted}>Please login to enable booking.</div>}
        </div>
      </motion.div>
    </div>
  );
}