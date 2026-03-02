import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Style from "./MyProfile.module.css";

import {
  PersonRounded as PersonIcon,
  EmailRounded as EmailIcon,
  PhoneIphoneRounded as PhoneIcon,
  HomeRounded as HomeIcon,
  PlaceRounded as PlaceIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorOutlineIcon,
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

const Field = ({ icon, label, value, mono }) => (
  <div className={Style.field}>
    <div className={Style.fieldIcon}>{icon}</div>
    <div className={Style.fieldBody}>
      <div className={Style.fieldLabel}>{label}</div>
      <div className={`${Style.fieldValue} ${mono ? Style.mono : ""}`}>
        {value || "-"}
      </div>
    </div>
  </div>
);

export default function MyProfile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [toasts, setToasts] = useState([]);
  const uid = sessionStorage.getItem("uid");

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const load = useCallback(() => {
    if (!uid) return;

    setLoading(true);
    axios
      .get(`${API}/user/${uid}`)
      .then((res) => setData(res.data))
      .catch(() => addToast("Failed to load profile.", "error"))
      .finally(() => setLoading(false));
  }, [uid, addToast]);

  useEffect(() => {
    load();
  }, [load]);

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
            <h1 className={Style.title}>My Profile</h1>
            <p className={Style.subtitle}>Your personal details</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={Style.btnGhost}
          onClick={load}
          type="button"
        >
          Refresh
        </motion.button>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={Style.card}
      >
        {loading && (
          <div className={Style.loadingRow}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
              className={Style.spinner}
            />
            <span className={Style.muted}>Loading…</span>
          </div>
        )}

        {!loading && !data ? (
          <div className={Style.emptyStateInner}>
            <div className={Style.muted}>No profile data</div>
          </div>
        ) : (
          !loading &&
          data && (
            <>
              <div className={Style.profileTop}>
                <div className={Style.avatar}>
                  {String(data.userName || "U")
                    .trim()
                    .slice(0, 1)
                    .toUpperCase()}
                </div>
                <div className={Style.profileMeta}>
                  <div className={Style.profileName}>{data.userName || "User"}</div>
                  <div className={Style.profileSub}>
                    {data.placeName ? `${data.placeName} • ` : ""}
                    {data.userEmail || ""}
                  </div>
                </div>
              </div>

              <div className={Style.grid}>
                <Field
                  icon={<PersonIcon fontSize="small" />}
                  label="Name"
                  value={data.userName}
                />
                <Field
                  icon={<EmailIcon fontSize="small" />}
                  label="Email"
                  value={data.userEmail}
                  mono
                />
                <Field
                  icon={<PhoneIcon fontSize="small" />}
                  label="Contact"
                  value={data.userContact}
                  mono
                />
                <Field
                  icon={<HomeIcon fontSize="small" />}
                  label="Address"
                  value={data.userAddress}
                />
                <Field
                  icon={<PlaceIcon fontSize="small" />}
                  label="Place"
                  value={data.placeName || "-"}
                />
              </div>
            </>
          )
        )}
      </motion.div>
    </div>
  );
}