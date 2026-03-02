import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Style from "./UserRegistration.module.css";

import {
  PersonRounded as PersonIcon,
  EmailRounded as EmailIcon,
  PhoneIphoneRounded as PhoneIcon,
  HomeRounded as HomeIcon,
  LockRounded as LockIcon,
  PlaceRounded as PlaceIcon,
  SaveAltRounded as SaveIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorOutlineIcon,
  VisibilityRounded as EyeIcon,
  VisibilityOffRounded as EyeOffIcon,
} from "@mui/icons-material";

const API = "http://localhost:5000";

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || "").trim());
const contactOk = (v) => /^\d{10}$/.test(String(v || "").trim());
const passwordOk = (v) => String(v || "").trim().length >= 6;

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

export default function UserRegistration() {
  const [places, setPlaces] = useState([]);

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userContact, setUserContact] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [placeId, setPlaceId] = useState("");

  const [showPwd, setShowPwd] = useState(false);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [saving, setSaving] = useState(false);

  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    setLoadingPlaces(true);
    axios
      .get(`${API}/place`)
      .then((res) => setPlaces(res.data.data || []))
      .catch(() => addToast("Failed to load places.", "error"))
      .finally(() => setLoadingPlaces(false));
  }, [addToast]);

  const reset = () => {
    setUserName("");
    setUserEmail("");
    setUserContact("");
    setUserAddress("");
    setUserPassword("");
    setPlaceId("");
  };

  const canSubmit = useMemo(() => {
    return (
      userName.trim() &&
      emailOk(userEmail) &&
      contactOk(userContact) &&
      userAddress.trim() &&
      passwordOk(userPassword) &&
      !!placeId
    );
  }, [userName, userEmail, userContact, userAddress, userPassword, placeId]);

  const validate = () => {
    if (!userName.trim()) return addToast("Name is required.", "error"), false;
    if (!userEmail.trim()) return addToast("Email is required.", "error"), false;
    if (!emailOk(userEmail)) return addToast("Enter a valid email.", "error"), false;

    if (!userContact.trim()) return addToast("Contact is required.", "error"), false;
    if (!contactOk(userContact)) return addToast("Contact must be 10 digits.", "error"), false;

    if (!userAddress.trim()) return addToast("Address is required.", "error"), false;

    if (!userPassword.trim()) return addToast("Password is required.", "error"), false;
    if (!passwordOk(userPassword))
      return addToast("Password must be at least 6 characters.", "error"), false;

    if (!placeId) return addToast("Please select a place.", "error"), false;

    return true;
  };

  const save = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      await axios.post(`${API}/user`, {
        userName: userName.trim(),
        userEmail: userEmail.trim(),
        userContact: userContact.trim(),
        userAddress: userAddress.trim(),
        userPassword: userPassword.trim(),
        placeId,
      });

      addToast("Inserted Successfully");
      reset();
    } catch (err) {
      addToast(err?.response?.data?.message || "Insert failed", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={Style.page}>
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className={Style.bgGlow} />

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className={Style.card}
      >
        <div className={Style.cardHeader}>
          <div className={Style.headerIcon}>
            <PersonIcon className={Style.headerIconSvg} />
          </div>
          <div>
            <h2 className={Style.title}>User Registration</h2>
            <p className={Style.subtitle}>Create your account to continue</p>
          </div>
        </div>

        <div className={Style.grid}>
          {/* Name */}
          <div className={Style.field}>
            <label className={Style.label}>Name</label>
            <div className={Style.inputWrap}>
              <PersonIcon className={Style.inputIcon} />
              <input
                className={Style.input}
                placeholder="Your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            {!userName.trim() ? null : (
              <div className={Style.hintOk}>Looks good.</div>
            )}
          </div>

          {/* Email */}
          <div className={Style.field}>
            <label className={Style.label}>Email</label>
            <div className={Style.inputWrap}>
              <EmailIcon className={Style.inputIcon} />
              <input
                className={Style.input}
                placeholder="e.g. user@gmail.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
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
                placeholder="10 digit number"
                value={userContact}
                maxLength={10}
                onChange={(e) => setUserContact(e.target.value.replace(/[^\d]/g, ""))}
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
                placeholder="Your address"
                value={userAddress}
                onChange={(e) => setUserAddress(e.target.value)}
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
                disabled={loadingPlaces}
              >
                <option value="">
                  {loadingPlaces ? "Loading places..." : "Select place"}
                </option>
                {places.map((p) => (
                  <option key={p.placeId} value={p.placeId}>
                    {p.placeName}
                  </option>
                ))}
              </select>
            </div>
            {!placeId ? null : <div className={Style.hintOk}>Selected.</div>}
          </div>

          {/* Password */}
          <div className={Style.field}>
            <label className={Style.label}>Password</label>
            <div className={Style.inputWrap}>
              <LockIcon className={Style.inputIcon} />
              <input
                className={Style.input}
                type={showPwd ? "text" : "password"}
                placeholder="Minimum 6 characters"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && save()}
              />
              <button
                type="button"
                className={Style.eyeBtn}
                onClick={() => setShowPwd((s) => !s)}
                title="Show/Hide password"
              >
                {showPwd ? <EyeOffIcon fontSize="small" /> : <EyeIcon fontSize="small" />}
              </button>
            </div>
            {!!userPassword && !passwordOk(userPassword) && (
              <div className={Style.hintError}>Minimum 6 characters.</div>
            )}
          </div>
        </div>

        <div className={Style.actions}>
          <motion.button
            whileHover={{ scale: saving ? 1 : 1.02 }}
            whileTap={{ scale: saving ? 1 : 0.98 }}
            className={Style.btnPrimary}
            onClick={save}
            disabled={saving || !canSubmit}
          >
            {saving ? <span className={Style.btnSpinner} /> : <SaveIcon fontSize="small" />}
            {saving ? "Registering…" : "Register"}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={Style.btnGhost}
            onClick={reset}
            disabled={saving}
          >
            Reset
          </motion.button>
        </div>

        <div className={Style.footerNote}>
          Password should be at least 6 characters. Contact must be 10 digits.
        </div>
      </motion.div>
    </div>
  );
}