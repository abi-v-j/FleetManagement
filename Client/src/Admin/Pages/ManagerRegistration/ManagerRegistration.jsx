// Manager.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Style from "./ManagerRegistration.module.css";

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorOutlineIcon,
  Search as SearchIcon,
  SaveAlt as SaveAltIcon,
  Badge as BadgeIcon,
  PhotoCamera as PhotoCameraIcon,
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

/* ───────────────────── Confirm Dialog ───────────────────── */
const ConfirmDialog = ({ open, name, onConfirm, onCancel }) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={Style.backdrop}
          onClick={onCancel}
        />

        <motion.div
          key="dialog"
          initial={{ opacity: 0, scale: 0.92, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 18 }}
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
          className={Style.dialog}
        >
          <div className={Style.dialogIcon}>
            <DeleteIcon className={Style.dialogIconSvg} />
          </div>

          <h3 className={Style.dialogTitle}>Delete Manager?</h3>
          <p className={Style.dialogBody}>
            Are you sure you want to delete <b>{name}</b>? This action cannot be undone.
          </p>

          <div className={Style.dialogActions}>
            <button className={Style.btnGhost} onClick={onCancel}>
              Cancel
            </button>
            <button className={Style.btnDanger} onClick={onConfirm}>
              <DeleteIcon fontSize="small" /> Delete
            </button>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

/* ───────────────────────── Helpers ───────────────────────── */
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || "").trim());
const contactOk = (v) => /^\d{10}$/.test(String(v || "").trim()); // change if you want 12 etc
const passwordOk = (v) => String(v || "").trim().length >= 6;

export default function Manager() {
  const [list, setList] = useState([]);
  const [places, setPlaces] = useState([]);

  const [editId, setEditId] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);

  const [managerName, setManagerName] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [managerContact, setManagerContact] = useState("");
  const [managerAddress, setManagerAddress] = useState("");
  const [managerPassword, setManagerPassword] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [managerPhoto, setManagerPhoto] = useState(null); // file
  const [photoPreview, setPhotoPreview] = useState(""); // blob preview

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [toasts, setToasts] = useState([]);
  const [confirm, setConfirm] = useState({ open: false, id: null, name: "" });

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

  const load = useCallback(() => {
    setLoading(true);
    axios
      .get(`${API}/manager`)
      .then((r) => setList(r.data.data || []))
      .catch(() => addToast("Failed to load managers.", "error"))
      .finally(() => setLoading(false));
  }, [addToast]);

  const loadPlaces = useCallback(() => {
    axios
      .get(`${API}/place`)
      .then((r) => setPlaces(r.data.data || []))
      .catch(() => addToast("Failed to load places.", "error"));
  }, [addToast]);

  useEffect(() => {
    load();
    loadPlaces();
  }, [load, loadPlaces]);

  // preview cleanup
  useEffect(() => {
    return () => {
      if (photoPreview?.startsWith("blob:")) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const reset = () => {
    setEditId("");
    setManagerName("");
    setManagerEmail("");
    setManagerContact("");
    setManagerAddress("");
    setManagerPassword("");
    setPlaceId("");
    setManagerPhoto(null);
    if (photoPreview?.startsWith("blob:")) URL.revokeObjectURL(photoPreview);
    setPhotoPreview("");
    setPanelOpen(false);
  };

  const startEdit = (m) => {
    setEditId(m.managerId);
    setManagerName(m.managerName || "");
    setManagerEmail(m.managerEmail || "");
    setManagerContact(m.managerContact || "");
    setManagerAddress(m.managerAddress || "");
    setManagerPassword(m.managerPassword || "");
    setPlaceId(m.placeId || "");
    setManagerPhoto(null);
    if (photoPreview?.startsWith("blob:")) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(m.managerPhoto ? `${API}${m.managerPhoto}` : "");
    setPanelOpen(true);
  };

  const validate = () => {
    if (!managerName.trim()) return addToast("Manager name is required.", "error"), false;
    if (!managerEmail.trim()) return addToast("Email is required.", "error"), false;
    if (!emailOk(managerEmail)) return addToast("Enter a valid email.", "error"), false;

    if (!managerContact.trim()) return addToast("Contact is required.", "error"), false;
    if (!contactOk(managerContact))
      return addToast("Contact must be exactly 10 digits.", "error"), false;

    if (!placeId) return addToast("Please select a place.", "error"), false;

    if (!managerPassword.trim()) return addToast("Password is required.", "error"), false;
    if (!passwordOk(managerPassword))
      return addToast("Password must be at least 6 characters.", "error"), false;

    if (managerPhoto) {
      const okTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!okTypes.includes(managerPhoto.type))
        return addToast("Photo must be JPG / PNG / WEBP.", "error"), false;

      const maxMB = 2;
      const sizeMB = managerPhoto.size / (1024 * 1024);
      if (sizeMB > maxMB) return addToast("Photo must be under 2MB.", "error"), false;
    }

    return true;
  };

  const save = async () => {
    if (!validate()) return;

    setSaving(true);
    const fd = new FormData();
    fd.append("managerName", managerName.trim());
    fd.append("managerEmail", managerEmail.trim());
    fd.append("managerContact", managerContact.trim());
    fd.append("managerAddress", managerAddress.trim());
    fd.append("managerPassword", managerPassword.trim());
    fd.append("placeId", placeId);
    if (managerPhoto) fd.append("managerPhoto", managerPhoto);

    const req = editId
      ? axios.put(`${API}/manager/${editId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      : axios.post(`${API}/manager`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

    req
      .then(() => {
        addToast(editId ? "Manager updated!" : "Manager added!");
        reset();
        load();
      })
      .catch(() => addToast("Operation failed. Try again.", "error"))
      .finally(() => setSaving(false));
  };

  const askDelete = (id, name) => setConfirm({ open: true, id, name });

  const executeDelete = () => {
    axios
      .delete(`${API}/manager/${confirm.id}`)
      .then(() => {
        addToast("Manager deleted!");
        load();
      })
      .catch(() => addToast("Delete failed. Try again.", "error"))
      .finally(() => setConfirm({ open: false, id: null, name: "" }));
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (m) =>
        m.managerName?.toLowerCase().includes(q) ||
        m.managerEmail?.toLowerCase().includes(q) ||
        String(m.managerContact || "").toLowerCase().includes(q) ||
        (m.placeName || "").toLowerCase().includes(q)
    );
  }, [list, search]);

  const isAddMode = panelOpen && !editId;

  return (
    <div className={Style.page}>
      <Toast toasts={toasts} removeToast={removeToast} />

      <ConfirmDialog
        open={confirm.open}
        name={confirm.name}
        onConfirm={executeDelete}
        onCancel={() => setConfirm({ open: false, id: null, name: "" })}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className={Style.header}
      >
        <div className={Style.headerLeft}>
          <div className={Style.headerIcon}>
            <BadgeIcon className={Style.headerIconSvg} />
          </div>

          <div>
            <h1 className={Style.title}>Managers</h1>
            <p className={Style.subtitle}>
              {list.length} manager{list.length !== 1 ? "s" : ""} registered
            </p>
          </div>
        </div>

        <motion.button
          layout
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 520, damping: 30 }}
          className={`${Style.btnPrimary} ${isAddMode ? Style.btnPrimaryClose : ""}`}
          onClick={() => {
            if (panelOpen && !editId) reset();
            else {
              setEditId("");
              setManagerName("");
              setManagerEmail("");
              setManagerContact("");
              setManagerAddress("");
              setManagerPassword("");
              setPlaceId("");
              setManagerPhoto(null);
              if (photoPreview?.startsWith("blob:")) URL.revokeObjectURL(photoPreview);
              setPhotoPreview("");
              setPanelOpen(true);
            }
          }}
        >
          <motion.span
            key={isAddMode ? "closeIcon" : "addIcon"}
            className={Style.btnIconWrap}
            initial={{ opacity: 0, rotate: isAddMode ? -90 : 90, scale: 0.9 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: isAddMode ? 90 : -90, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 700, damping: 35 }}
          >
            {isAddMode ? <CloseIcon fontSize="small" /> : <AddIcon fontSize="small" />}
          </motion.span>

          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={isAddMode ? "closeText" : "addText"}
              className={Style.btnText}
              initial={{ opacity: 0, y: 6, filter: "blur(2px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -6, filter: "blur(2px)" }}
              transition={{ duration: 0.18 }}
            >
              {isAddMode ? "Close" : "Add Manager"}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* Panel */}
      <AnimatePresence initial={false}>
        {panelOpen && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: -8, maxHeight: 0, marginBottom: 0 }}
            animate={{ opacity: 1, y: 0, maxHeight: 700, marginBottom: 18 }}
            exit={{ opacity: 0, y: -8, maxHeight: 0, marginBottom: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className={Style.panelWrap}
          >
            <div className={Style.panel}>
              <div className={Style.panelHeader}>
                <span className={Style.panelTitle}>
                  {editId ? "✏️ Edit Manager" : "➕ New Manager"}
                </span>
                <button className={Style.iconGhostBtn} onClick={reset}>
                  <CloseIcon fontSize="small" />
                </button>
              </div>

              <div className={Style.grid}>
                <div className={Style.fieldGroup}>
                  <label className={Style.label}>Manager Name</label>
                  <input
                    autoFocus
                    className={Style.input}
                    placeholder="e.g. Manager"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                  />
                </div>

                <div className={Style.fieldGroup}>
                  <label className={Style.label}>Email</label>
                  <input
                    className={Style.input}
                    placeholder="e.g. manager@gmail.com"
                    value={managerEmail}
                    onChange={(e) => setManagerEmail(e.target.value)}
                  />
                </div>

                <div className={Style.fieldGroup}>
                  <label className={Style.label}>Contact</label>
                  <input
                    className={Style.input}
                    placeholder="10 digit number"
                    value={managerContact}
                    onChange={(e) => {
                      // keep digits only
                      const v = e.target.value.replace(/[^\d]/g, "");
                      setManagerContact(v);
                    }}
                    maxLength={10}
                  />
                </div>

                <div className={Style.fieldGroup}>
                  <label className={Style.label}>Address</label>
                  <input
                    className={Style.input}
                    placeholder="Optional address"
                    value={managerAddress}
                    onChange={(e) => setManagerAddress(e.target.value)}
                  />
                </div>

                <div className={Style.fieldGroup}>
                  <label className={Style.label}>Place</label>
                  <select
                    className={Style.select}
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

                <div className={Style.fieldGroup}>
                  <label className={Style.label}>Password</label>
                  <input
                    className={Style.input}
                    placeholder="Minimum 6 characters"
                    value={managerPassword}
                    onChange={(e) => setManagerPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && save()}
                  />
                </div>
              </div>

              {/* Photo row */}
              <div className={Style.photoRow}>
                <div className={Style.photoLeft}>
                  <div className={Style.photoPreview}>
                    {photoPreview ? (
                      <img src={photoPreview} alt="" />
                    ) : (
                      <div className={Style.photoPlaceholder}>
                        <PhotoCameraIcon />
                        <span>No photo</span>
                      </div>
                    )}
                  </div>

                  <div className={Style.photoMeta}>
                    <div className={Style.photoTitle}>Manager Photo</div>
                    <div className={Style.photoHint}>JPG / PNG / WEBP • max 2MB</div>
                  </div>
                </div>

                <label className={Style.fileBtn}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setManagerPhoto(f);
                      if (photoPreview?.startsWith("blob:")) URL.revokeObjectURL(photoPreview);
                      setPhotoPreview(f ? URL.createObjectURL(f) : "");
                    }}
                  />
                  <PhotoCameraIcon fontSize="small" />
                  Choose Photo
                </label>
              </div>

              <div className={Style.panelActions}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={Style.btnPrimary}
                  onClick={save}
                  disabled={saving}
                >
                  <SaveAltIcon fontSize="small" />
                  {saving ? "Saving…" : editId ? "Update" : "Save"}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={Style.btnGhost}
                  onClick={reset}
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.35 }}
        className={Style.searchWrap}
      >
        <SearchIcon className={Style.searchIcon} />
        <input
          type="text"
          placeholder="Search managers…"
          className={Style.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.4 }}
        className={Style.tableCard}
      >
        <div className={Style.tableHead}>
          <div className={`${Style.cell} ${Style.colSmall}`}>#</div>
          <div className={`${Style.cell} ${Style.colPhoto}`}>Photo</div>
          <div className={`${Style.cell} ${Style.colFlex}`}>Name</div>
          <div className={`${Style.cell} ${Style.colFlex}`}>Email</div>
          <div className={`${Style.cell} ${Style.colFlex}`}>Contact</div>
          <div className={`${Style.cell} ${Style.colFlex}`}>Place</div>
          <div className={`${Style.cell} ${Style.colAction}`}>Actions</div>
        </div>

        {loading ? (
          <div className={Style.emptyState}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
              className={Style.spinner}
            />
            <span className={Style.muted}>Loading…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className={Style.emptyState}>
            <BadgeIcon className={Style.emptyIcon} />
            <span className={Style.muted}>
              {search ? "No matching managers found." : "No managers yet. Add one!"}
            </span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((m, index) => (
              <motion.div
                key={m.managerId}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12, height: 0 }}
                transition={{ duration: 0.22, delay: index * 0.03 }}
                className={Style.tableRow}
              >
                <div className={`${Style.cell} ${Style.colSmall}`}>
                  <span className={Style.badge}>{index + 1}</span>
                </div>

                <div className={`${Style.cell} ${Style.colPhoto}`}>
                  <div className={Style.avatar}>
                    {m.managerPhoto ? (
                      <img src={`${API}${m.managerPhoto}`} alt="" />
                    ) : (
                      <PhotoCameraIcon />
                    )}
                  </div>
                </div>

                <div className={`${Style.cell} ${Style.colFlex} ${Style.nameCell}`}>
                  {m.managerName}
                </div>

                <div className={`${Style.cell} ${Style.colFlex} ${Style.mono}`}>
                  {m.managerEmail}
                </div>

                <div className={`${Style.cell} ${Style.colFlex} ${Style.mono}`}>
                  {m.managerContact}
                </div>

                <div className={`${Style.cell} ${Style.colFlex}`}>
                  {m.placeName || "-"}
                </div>

                <div className={`${Style.cell} ${Style.colAction}`}>
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className={Style.iconBtn}
                    onClick={() => startEdit(m)}
                    title="Edit"
                  >
                    <EditIcon fontSize="small" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className={`${Style.iconBtn} ${Style.iconBtnDanger}`}
                    onClick={() => askDelete(m.managerId, m.managerName)}
                    title="Delete"
                  >
                    <DeleteIcon fontSize="small" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}