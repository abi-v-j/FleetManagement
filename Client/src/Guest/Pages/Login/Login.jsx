import React, { useCallback, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import Style from "./Login.module.css";

import {
  LockRounded as LockIcon,
  EmailRounded as EmailIcon,
  VisibilityRounded as EyeIcon,
  VisibilityOffRounded as EyeOffIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorOutlineIcon,
} from "@mui/icons-material";

const API = "http://localhost:5000/login";

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || "").trim());

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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const [toasts, setToasts] = useState([]);

  const navigate = useNavigate();

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

  const canSubmit = useMemo(() => {
    return emailOk(email) && String(password || "").trim().length >= 6;
  }, [email, password]);

  const handleLogin = async () => {
    const e = email.trim();
    const p = String(password || "").trim();

    if (!e) return addToast("Email is required.", "error");
    if (!emailOk(e)) return addToast("Enter a valid email.", "error");
    if (!p) return addToast("Password is required.", "error");
    if (p.length < 6) return addToast("Password must be at least 6 characters.", "error");

    setLoading(true);
    try {
      const res = await axios.post(API, { email: e, password: p });
      const { role, id, message } = res.data || {};

      addToast(message || "Login success!");

    

      if (role === "admin") {
        sessionStorage.setItem("aid", id);
        navigate("/admin/home");
      } else if (role === "manager") {
        sessionStorage.setItem("mid", id);
        navigate("/manager/home");
      } else if (role === "staff") {
        sessionStorage.setItem("sid", id);
        navigate("/staff/home");
      } else if (role === "user") {
        sessionStorage.setItem("uid", id);
        navigate("/user");
      } else {
        addToast("Invalid role", "error");
      }
    } catch (err) {
      addToast(err?.response?.data?.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={Style.page}>
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* background glow */}
      <div className={Style.bgGlow} />

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className={Style.card}
      >
        <div className={Style.cardHeader}>
          <div className={Style.iconWrap}>
            <LockIcon className={Style.icon} />
          </div>
          <div>
            <h2 className={Style.title}>Welcome back</h2>
            <p className={Style.subtitle}>Sign in to continue</p>
          </div>
        </div>

        <div className={Style.form}>
          {/* Email */}
          <div className={Style.field}>
            <label className={Style.label}>Email</label>
            <div className={Style.inputWrap}>
              <EmailIcon className={Style.inputIcon} />
              <input
                className={Style.input}
                type="email"
                placeholder="e.g. admin@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            {!!email && !emailOk(email) && (
              <div className={Style.hintError}>Please enter a valid email.</div>
            )}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />

              <button
                type="button"
                className={Style.eyeBtn}
                onClick={() => setShowPwd((s) => !s)}
                aria-label="Toggle password"
                title="Show/Hide password"
              >
                {showPwd ? <EyeOffIcon fontSize="small" /> : <EyeIcon fontSize="small" />}
              </button>
            </div>
            {!!password && String(password).trim().length < 6 && (
              <div className={Style.hintError}>Password must be at least 6 characters.</div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className={Style.btnPrimary}
            onClick={handleLogin}
            disabled={loading || !canSubmit}
          >
            {loading ? <span className={Style.btnSpinner} /> : <LockIcon fontSize="small" />}
            {loading ? "Signing in…" : "Login"}
          </motion.button>

          <div className={Style.footerNote}>
            Tip: Use the correct email/password for your role (admin/manager/staff/user).
          </div>
        </div>
      </motion.div>
    </div>
  );
}