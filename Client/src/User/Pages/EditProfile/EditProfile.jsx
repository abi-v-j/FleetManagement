import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import Style from "./EditProfile.module.css";

import {
  PersonRounded as PersonIcon,
  EmailRounded as EmailIcon,
  PhoneIphoneRounded as PhoneIcon,
  HomeRounded as HomeIcon,
  PlaceRounded as PlaceIcon,
  SaveAltRounded as SaveIcon,
  ArrowBackRounded as BackIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorOutlineIcon,
} from "@mui/icons-material";

const API = "http://localhost:5000";

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || "").trim());
const contactOk = (v) => /^\d{10}$/.test(String(v || "").trim());

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

export default function EditProfile() {
  const navigate = useNavigate();
  const uid = sessionStorage.getItem("uid");

  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userContact, setUserContact] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [placeId, setPlaceId] = useState("");

  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const load = useCallback(async () => {
    if (!uid) return;

    setLoading(true);
    try {
      const [pRes, uRes] = await Promise.all([
        axios.get(`${API}/place`),
        axios.get(`${API}/user/${uid}`),
      ]);

      setPlaces(pRes.data.data || []);
      const d = uRes.data || {};

      setUserName(d.userName || "");
      setUserEmail(d.userEmail || "");
      setUserContact(d.userContact || "");
      setUserAddress(d.userAddress || "");
      setPlaceId(d.placeId || "");
    } catch (e) {
      addToast("Failed to load profile.", "error");
    } finally {
      setLoading(false);
    }
  }, [uid, addToast]);

  useEffect(() => {
    load();
  }, [load]);

  const canSubmit = useMemo(() => {
    return (
      userName.trim() &&
      emailOk(userEmail) &&
      contactOk(userContact) &&
      userAddress.trim() &&
      !!placeId &&
      !saving
    );
  }, [userName, userEmail, userContact, userAddress, placeId, saving]);

  const validate = () => {
    if (!userName.trim()) return addToast("Name is required.", "error"), false;

    if (!userEmail.trim()) return addToast("Email is required.", "error"), false;
    if (!emailOk(userEmail)) return addToast("Enter a valid email.", "error"), false;

    if (!userContact.trim()) return addToast("Contact is required.", "error"), false;
    if (!contactOk(userContact))
      return addToast("Contact must be exactly 10 digits.", "error"), false;

    if (!userAddress.trim()) return addToast("Address is required.", "error"), false;

    if (!placeId) return addToast("Please select a place.", "error"), false;

    return true;
  };

  const update = async () => {
    if (!uid) return addToast("Please login.", "error");
    if (!validate()) return;

    setSaving(true);
    try {
      const res = await axios.put(`${API}/user/${uid}`, {
        userName: userName.trim(),
        userEmail: userEmail.trim(),
        userContact: userContact.trim(),
        userAddress: userAddress.trim(),
        placeId,
      });

      addToast(res.data?.message || "Profile updated!");
      sessionStorage.setItem("userName", userName.trim());
      navigate("/user/myprofile");
    } catch (e) {
      addToast(e?.response?.data?.message || "Update failed", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!uid) {
    return (
      <div className={Style.page}>
        <div className={Style.emptyState}>
          <PersonIcon className={Style.emptyIcon} />
          <div className={Style.emptyTitle}>Please login</div>
          <div className={Style.emptySub}>Your session is not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div className={Style.page}>
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className={Style.header}
      >
        <div className={Style.headerLeft}>
          <div className={Style.headerIcon}>
            <PersonIcon className={Style.headerIconSvg} />
          </div>
          <div>
            <h1 className={Style.title}>Edit Profile</h1>
            <p className={Style.subtitle}>Update your details</p>
          </div>
        </div>

        <div className={Style.headerActions}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={Style.btnGhost}
            onClick={() => navigate("/user/myprofile")}
            type="button"
          >
            <BackIcon fontSize="small" /> Back
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={Style.btnGhost}
            onClick={load}
            type="button"
          >
            Refresh
          </motion.button>
        </div>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={Style.card}
      >
        {loading ? (
          <div className={Style.loadingRow}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
              className={Style.spinner}
            />
            <span className={Style.muted}>Loading…</span>
          </div>
        ) : (
          <>
            <div className={Style.grid}>
              {/* Name */}
              <div className={Style.field}>
                <label className={Style.label}>Name</label>
                <div className={Style.inputWrap}>
                  <PersonIcon className={Style.inputIcon} />
                  <input
                    className={Style.input}
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
              </div>

              {/* Email */}
              <div className={Style.field}>
                <label className={Style.label}>Email</label>
                <div className={Style.inputWrap}>
                  <EmailIcon className={Style.inputIcon} />
                  <input
                    className={Style.input}
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="yourmail@gmail.com"
                  />
                </div>
                {!!userEmail && !emailOk(userEmail) && (
                  <div className={Style.hintError}>Enter a valid email.</div>
                )}
              </div>

              {/* Contact */}
              <div className={Style.field}>
                <label className={Style.label}>Contact</label>
                <div className={Style.inputWrap}>
                  <PhoneIcon className={Style.inputIcon} />
                  <input
                    className={Style.input}
                    value={userContact}
                    maxLength={10}
                    onChange={(e) => setUserContact(e.target.value.replace(/[^\d]/g, ""))}
                    placeholder="10 digit number"
                  />
                </div>
                {!!userContact && !contactOk(userContact) && (
                  <div className={Style.hintError}>Contact must be 10 digits.</div>
                )}
              </div>

              {/* Address */}
              <div className={Style.field}>
                <label className={Style.label}>Address</label>
                <div className={Style.inputWrap}>
                  <HomeIcon className={Style.inputIcon} />
                  <input
                    className={Style.input}
                    value={userAddress}
                    onChange={(e) => setUserAddress(e.target.value)}
                    placeholder="Your address"
                  />
                </div>
              </div>

              {/* Place */}
              <div className={Style.field}>
                <label className={Style.label}>Place</label>
                <div className={Style.inputWrap}>
                  <PlaceIcon className={Style.inputIcon} />
                  <select
                    className={`${Style.input} ${Style.select}`}
                    value={placeId}
                    onChange={(e) => setPlaceId(e.target.value)}
                  >
                    <option value="">Select place</option>
                    {places.map((p) => (
                      <option key={p.placeId} value={p.placeId}>
                        {p.placeName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className={Style.actions}>
              <motion.button
                whileHover={{ scale: saving ? 1 : 1.02 }}
                whileTap={{ scale: saving ? 1 : 0.98 }}
                className={Style.btnPrimary}
                onClick={update}
                disabled={!canSubmit}
                type="button"
              >
                {saving ? <span className={Style.btnSpinner} /> : <SaveIcon fontSize="small" />}
                {saving ? "Updating…" : "Update"}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={Style.btnGhost}
                onClick={() => navigate("/user/myprofile")}
                disabled={saving}
                type="button"
              >
                Cancel
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}