import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Styles from "./DriverRegistration.module.css";

import {
  Badge as BadgeIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  UploadFile as UploadFileIcon,
  PhotoCamera as PhotoIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorOutlineIcon,
  Close as CloseIcon,
  SaveAlt as SaveAltIcon,
} from "@mui/icons-material";

/* ───────────────────────── Toast ───────────────────────── */
const Toast = ({ toasts, removeToast }) => (
  <div className={Styles.toastWrapper}>
    <AnimatePresence>
      {toasts.map((t) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, x: 80, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 80, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className={`${Styles.toast} ${
            t.type === "success" ? Styles.toastSuccess : Styles.toastError
          }`}
        >
          {t.type === "success" ? (
            <CheckCircleIcon className={Styles.toastIcon} />
          ) : (
            <ErrorOutlineIcon className={Styles.toastIcon} />
          )}
          <span className={Styles.toastMsg}>{t.message}</span>

          <button
            onClick={() => removeToast(t.id)}
            className={Styles.toastClose}
          >
            <CloseIcon fontSize="small" />
          </button>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

const DriverRegistration = () => {
  const [driver, setDriver] = useState({
    name: "",
    email: "",
    password: "",
    contact: "",
    address: "",
    idProof: null,
    photo: null,
  });

  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState([]);

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

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setDriver((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !driver.name.trim() ||
      !driver.email.trim() ||
      !driver.password.trim() ||
      !driver.contact.trim() ||
      !driver.address.trim() ||
      !driver.idProof ||
      !driver.photo
    ) {
      addToast("Please fill all fields.", "error");
      return;
    }

    try {
      setSaving(true);

      // ✅ If you later want API upload:
      // const formData = new FormData();
      // Object.entries(driver).forEach(([k, v]) => formData.append(k, v));
      // await axios.post("YOUR_API", formData);

      console.log(driver);
      addToast("Driver registered successfully!");
      setDriver({
        name: "",
        email: "",
        password: "",
        contact: "",
        address: "",
        idProof: null,
        photo: null,
      });
    } catch (err) {
      addToast("Registration failed. Try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={Styles.page}>
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className={Styles.header}
      >
        <div className={Styles.headerLeft}>
          <div className={Styles.headerIcon}>
            <BadgeIcon className={Styles.headerIconSvg} />
          </div>

          <div>
            <h1 className={Styles.title}>Driver Registration</h1>
            <p className={Styles.subtitle}>
              Create a new driver profile with documents
            </p>
          </div>
        </div>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className={Styles.card}
      >
        <form onSubmit={handleSubmit} className={Styles.form}>
          <div className={Styles.grid}>
            <div className={Styles.field}>
              <label className={Styles.label}>Driver Name</label>
              <div className={Styles.inputWrap}>
                <BadgeIcon className={Styles.inputIcon} />
                <input
                  type="text"
                  name="name"
                  value={driver.name}
                  onChange={handleChange}
                  className={Styles.input}
                  placeholder="e.g. Rahul"
                  required
                />
              </div>
            </div>

            <div className={Styles.field}>
              <label className={Styles.label}>Email</label>
              <div className={Styles.inputWrap}>
                <EmailIcon className={Styles.inputIcon} />
                <input
                  type="email"
                  name="email"
                  value={driver.email}
                  onChange={handleChange}
                  className={Styles.input}
                  placeholder="e.g. driver@gmail.com"
                  required
                />
              </div>
            </div>

            <div className={Styles.field}>
              <label className={Styles.label}>Password</label>
              <div className={Styles.inputWrap}>
                <LockIcon className={Styles.inputIcon} />
                <input
                  type="password"
                  name="password"
                  value={driver.password}
                  onChange={handleChange}
                  className={Styles.input}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className={Styles.field}>
              <label className={Styles.label}>Contact No.</label>
              <div className={Styles.inputWrap}>
                <PhoneIcon className={Styles.inputIcon} />
                <input
                  type="tel"
                  name="contact"
                  value={driver.contact}
                  onChange={handleChange}
                  className={Styles.input}
                  placeholder="e.g. 9876543210"
                  required
                />
              </div>
            </div>

            <div className={`${Styles.field} ${Styles.full}`}>
              <label className={Styles.label}>Address</label>
              <div className={Styles.textareaWrap}>
                <HomeIcon className={Styles.inputIconTop} />
                <textarea
                  name="address"
                  value={driver.address}
                  onChange={handleChange}
                  className={Styles.textarea}
                  placeholder="Enter full address..."
                  required
                />
              </div>
            </div>

            <div className={Styles.field}>
              <label className={Styles.label}>ID Proof</label>
              <label className={Styles.fileBox}>
                <UploadFileIcon className={Styles.fileIcon} />
                <span className={Styles.fileText}>
                  {driver.idProof ? driver.idProof.name : "Upload ID proof"}
                </span>
                <input
                  type="file"
                  name="idProof"
                  onChange={handleChange}
                  className={Styles.fileHidden}
                  required
                />
              </label>
            </div>

            <div className={Styles.field}>
              <label className={Styles.label}>Photo</label>
              <label className={Styles.fileBox}>
                <PhotoIcon className={Styles.fileIcon} />
                <span className={Styles.fileText}>
                  {driver.photo ? driver.photo.name : "Upload photo"}
                </span>
                <input
                  type="file"
                  name="photo"
                  onChange={handleChange}
                  className={Styles.fileHidden}
                  required
                />
              </label>
            </div>
          </div>

          <div className={Styles.actions}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={Styles.btnPrimary}
              type="submit"
              disabled={saving}
            >
              <SaveAltIcon fontSize="small" />
              {saving ? "Registering…" : "Register"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default DriverRegistration;