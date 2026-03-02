import React, { useCallback, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import Style from "./ChangePassword.module.css";

import {
  LockRounded as LockIcon,
  VisibilityRounded as EyeIcon,
  VisibilityOffRounded as EyeOffIcon,
  SaveAltRounded as SaveIcon,
  ArrowBackRounded as BackIcon,
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

export default function ChangePassword() {
  const navigate = useNavigate();
  const uid = sessionStorage.getItem("uid");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showCon, setShowCon] = useState(false);

  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const canSubmit = useMemo(() => {
    const op = oldPassword.trim().length > 0;
    const np = newPassword.trim().length >= 6;
    const cp = confirmPassword.trim().length >= 6;
    const same = newPassword === confirmPassword;
    return op && np && cp && same && !saving;
  }, [oldPassword, newPassword, confirmPassword, saving]);

  const validate = () => {
    if (!oldPassword.trim()) return addToast("Old password is required.", "error"), false;
    if (!newPassword.trim()) return addToast("New password is required.", "error"), false;
    if (newPassword.trim().length < 6)
      return addToast("New password must be at least 6 characters.", "error"), false;

    if (!confirmPassword.trim())
      return addToast("Confirm password is required.", "error"), false;

    if (newPassword !== confirmPassword)
      return addToast("New password and confirm password do not match.", "error"), false;

    return true;
  };

  const reset = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const change = async () => {
    try {
      if (!uid) return addToast("Please login.", "error");
      if (!validate()) return;

      setSaving(true);
      const res = await axios.put(`${API}/user/changepassword/${uid}`, {
        oldPassword: oldPassword.trim(),
        newPassword: newPassword.trim(),
      });

      addToast(res.data?.message || "Password changed!");
      reset();
      navigate("/user/myprofile");
    } catch (e) {
      addToast(e?.response?.data?.message || "Change password failed", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!uid) {
    return (
      <div className={Style.page}>
        <div className={Style.emptyState}>
          <LockIcon className={Style.emptyIcon} />
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
            <LockIcon className={Style.headerIconSvg} />
          </div>
          <div>
            <h1 className={Style.title}>Change Password</h1>
            <p className={Style.subtitle}>Update your account password</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={Style.btnGhost}
          onClick={() => navigate("/user/myprofile")}
          type="button"
        >
          <BackIcon fontSize="small" /> Back
        </motion.button>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={Style.card}
      >
        <div className={Style.grid}>
          {/* Old */}
          <div className={Style.field}>
            <label className={Style.label}>Old Password</label>
            <div className={Style.inputWrap}>
              <LockIcon className={Style.inputIcon} />
              <input
                className={Style.input}
                type={showOld ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter old password"
              />
              <button
                type="button"
                className={Style.eyeBtn}
                onClick={() => setShowOld((s) => !s)}
                title="Show/Hide"
              >
                {showOld ? <EyeOffIcon fontSize="small" /> : <EyeIcon fontSize="small" />}
              </button>
            </div>
          </div>

          {/* New */}
          <div className={Style.field}>
            <label className={Style.label}>New Password</label>
            <div className={Style.inputWrap}>
              <LockIcon className={Style.inputIcon} />
              <input
                className={Style.input}
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
              />
              <button
                type="button"
                className={Style.eyeBtn}
                onClick={() => setShowNew((s) => !s)}
                title="Show/Hide"
              >
                {showNew ? <EyeOffIcon fontSize="small" /> : <EyeIcon fontSize="small" />}
              </button>
            </div>

            {!!newPassword && newPassword.trim().length < 6 && (
              <div className={Style.hintError}>Minimum 6 characters.</div>
            )}
          </div>

          {/* Confirm */}
          <div className={Style.field}>
            <label className={Style.label}>Confirm Password</label>
            <div className={Style.inputWrap}>
              <LockIcon className={Style.inputIcon} />
              <input
                className={Style.input}
                type={showCon ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                onKeyDown={(e) => e.key === "Enter" && change()}
              />
              <button
                type="button"
                className={Style.eyeBtn}
                onClick={() => setShowCon((s) => !s)}
                title="Show/Hide"
              >
                {showCon ? <EyeOffIcon fontSize="small" /> : <EyeIcon fontSize="small" />}
              </button>
            </div>

            {!!confirmPassword && confirmPassword !== newPassword && (
              <div className={Style.hintError}>Passwords do not match.</div>
            )}
          </div>
        </div>

        <div className={Style.actions}>
          <motion.button
            whileHover={{ scale: saving ? 1 : 1.02 }}
            whileTap={{ scale: saving ? 1 : 0.98 }}
            className={Style.btnPrimary}
            onClick={change}
            disabled={!canSubmit}
            type="button"
          >
            {saving ? <span className={Style.btnSpinner} /> : <SaveIcon fontSize="small" />}
            {saving ? "Changing…" : "Change"}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={Style.btnGhost}
            onClick={reset}
            disabled={saving}
            type="button"
          >
            Reset
          </motion.button>
        </div>

        <div className={Style.footerNote}>
          Password should be at least 6 characters.
        </div>
      </motion.div>
    </div>
  );
}