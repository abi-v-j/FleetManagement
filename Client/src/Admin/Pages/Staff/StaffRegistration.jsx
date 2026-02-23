// Staff.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Style from "./StaffRegistration.module.css";

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Groups as StaffIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorOutlineIcon,
  Search as SearchIcon,
  SaveAlt as SaveAltIcon,
  Image as ImageIcon,
  Place as PlaceIcon,
  Badge as BadgeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Lock as LockIcon,
  UploadFile as UploadFileIcon,
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

          <h3 className={Style.dialogTitle}>Delete Staff?</h3>
          <p className={Style.dialogBody}>
            Are you sure you want to delete <b>{name}</b>? This action cannot be
            undone.
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

export default function Staff() {
  const [list, setList] = useState([]);
  const [places, setPlaces] = useState([]);
  const [types, setTypes] = useState([]);

  const [editId, setEditId] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);

  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffContact, setStaffContact] = useState("");
  const [staffAddress, setStaffAddress] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [stafftypeId, setStafftypeId] = useState("");
  const [staffPhoto, setStaffPhoto] = useState(null);

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
    Promise.all([
      axios.get(`${API}/staff`),
      axios.get(`${API}/place`),
      axios.get(`${API}/stafftype`),
    ])
      .then(([staffRes, placeRes, typeRes]) => {
        setList(staffRes.data.data || []);
        setPlaces(placeRes.data.data || []);
        setTypes(typeRes.data.data || []);
      })
      .catch(() => addToast("Failed to load staff data.", "error"))
      .finally(() => setLoading(false));
  }, [addToast]);

  useEffect(() => {
    load();
  }, [load]);

  const reset = () => {
    setEditId("");
    setStaffName("");
    setStaffEmail("");
    setStaffContact("");
    setStaffAddress("");
    setStaffPassword("");
    setPlaceId("");
    setStafftypeId("");
    setStaffPhoto(null);
    setPanelOpen(false);
  };

  const startEdit = (s) => {
    setEditId(s.staffId);
    setStaffName(s.staffName || "");
    setStaffEmail(s.staffEmail || "");
    setStaffContact(s.staffContact || "");
    setStaffAddress(s.staffAddress || "");
    setStaffPassword(s.staffPassword || "");
    setPlaceId(s.placeId || "");
    setStafftypeId(s.stafftypeId || "");
    setStaffPhoto(null);
    setPanelOpen(true);
  };

  const save = async () => {
    if (
      !staffName.trim() ||
      !staffEmail.trim() ||
      !staffContact.trim() ||
      !staffAddress.trim() ||
      !staffPassword.trim() ||
      !placeId ||
      !stafftypeId
    ) {
      addToast("All fields are required.", "error");
      return;
    }

    setSaving(true);

    const fd = new FormData();
    fd.append("staffName", staffName);
    fd.append("staffEmail", staffEmail);
    fd.append("staffContact", staffContact);
    fd.append("staffAddress", staffAddress);
    fd.append("staffPassword", staffPassword);
    fd.append("placeId", placeId);
    fd.append("stafftypeId", stafftypeId);
    if (staffPhoto) fd.append("staffPhoto", staffPhoto);

    const req = editId
      ? axios.put(`${API}/staff/${editId}`, fd)
      : axios.post(`${API}/staff`, fd);

    req
      .then(() => {
        addToast(editId ? "Staff updated!" : "Staff added!");
        reset();
        load();
      })
      .catch(() => addToast("Operation failed. Try again.", "error"))
      .finally(() => setSaving(false));
  };

  const askDelete = (id, name) => setConfirm({ open: true, id, name });

  const executeDelete = () => {
    axios
      .delete(`${API}/staff/${confirm.id}`)
      .then(() => {
        addToast("Staff deleted!");
        load();
      })
      .catch(() => addToast("Delete failed. Try again.", "error"))
      .finally(() => setConfirm({ open: false, id: null, name: "" }));
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (s) =>
        s.staffName?.toLowerCase().includes(q) ||
        s.staffEmail?.toLowerCase().includes(q) ||
        s.staffContact?.toLowerCase().includes(q) ||
        s.placeName?.toLowerCase().includes(q) ||
        s.stafftypeName?.toLowerCase().includes(q)
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
            <StaffIcon className={Style.headerIconSvg} />
          </div>

          <div>
            <h1 className={Style.title}>Staff</h1>
            <p className={Style.subtitle}>
              {list.length} staff member{list.length !== 1 ? "s" : ""} registered
            </p>
          </div>
        </div>

        <motion.button
          layout
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 520, damping: 30 }}
          className={`${Style.btnPrimary} ${
            isAddMode ? Style.btnPrimaryClose : ""
          }`}
          onClick={() => {
            if (panelOpen && !editId) reset();
            else {
              setEditId("");
              setStaffName("");
              setStaffEmail("");
              setStaffContact("");
              setStaffAddress("");
              setStaffPassword("");
              setPlaceId("");
              setStafftypeId("");
              setStaffPhoto(null);
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
            {isAddMode ? (
              <CloseIcon fontSize="small" />
            ) : (
              <AddIcon fontSize="small" />
            )}
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
              {isAddMode ? "Close" : "Add Staff"}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* Panel (✅ FIXED: no maxHeight clipping) */}
      <AnimatePresence initial={false}>
        {panelOpen && (
          <motion.div
            key="panel"
            layout
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0, marginBottom: 18 }}
            exit={{ opacity: 0, y: -8, marginBottom: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className={Style.panelWrap}
          >
            <div className={Style.panel}>
              <div className={Style.panelHeader}>
                <span className={Style.panelTitle}>
                  {editId ? "✏️ Edit Staff" : "➕ New Staff"}
                </span>
                <button className={Style.iconGhostBtn} onClick={reset}>
                  <CloseIcon fontSize="small" />
                </button>
              </div>

              <div className={Style.grid}>
                <div className={Style.fieldGroup}>
                  <label className={Style.label}>Staff Name</label>
                  <div className={Style.inputWrap}>
                    <BadgeIcon className={Style.inputIcon} />
                    <input
                      className={Style.input}
                      placeholder="e.g. Staff"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                    />
                  </div>
                </div>

                <div className={Style.fieldGroup}>
                  <label className={Style.label}>Email</label>
                  <div className={Style.inputWrap}>
                    <EmailIcon className={Style.inputIcon} />
                    <input
                      className={Style.input}
                      placeholder="e.g. staff@gmail.com"
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className={Style.fieldGroup}>
                  <label className={Style.label}>Contact</label>
                  <div className={Style.inputWrap}>
                    <PhoneIcon className={Style.inputIcon} />
                    <input
                      className={Style.input}
                      placeholder="e.g. 9876543210"
                      value={staffContact}
                      onChange={(e) => setStaffContact(e.target.value)}
                    />
                  </div>
                </div>

                <div className={Style.fieldGroup}>
                  <label className={Style.label}>Password</label>
                  <div className={Style.inputWrap}>
                    <LockIcon className={Style.inputIcon} />
                    <input
                      className={Style.input}
                      placeholder="••••••••"
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && save()}
                    />
                  </div>
                </div>

                <div className={`${Style.fieldGroup} ${Style.full}`}>
                  <label className={Style.label}>Address</label>
                  <div className={Style.textareaWrap}>
                    <HomeIcon className={Style.inputIconTop} />
                    <textarea
                      className={Style.textarea}
                      placeholder="Enter address..."
                      value={staffAddress}
                      onChange={(e) => setStaffAddress(e.target.value)}
                    />
                  </div>
                </div>

                <div className={Style.fieldGroup}>
                  <label className={Style.label}>Place</label>
                  <div className={Style.selectWrap}>
                    <PlaceIcon className={Style.inputIcon} />
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
                </div>

                <div className={Style.fieldGroup}>
                  <label className={Style.label}>Staff Type</label>
                  <div className={Style.selectWrap}>
                    <StaffIcon className={Style.inputIcon} />
                    <select
                      className={Style.select}
                      value={stafftypeId}
                      onChange={(e) => setStafftypeId(e.target.value)}
                    >
                      <option value="">Select staff type</option>
                      {types.map((t) => (
                        <option key={t.stafftypeId} value={t.stafftypeId}>
                          {t.stafftypeName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={Style.fieldGroup}>
                  <label className={Style.label}>Photo</label>
                  <label className={Style.fileBox}>
                    <UploadFileIcon className={Style.fileIcon} />
                    <span className={Style.fileText}>
                      {staffPhoto ? staffPhoto.name : "Upload staff photo"}
                    </span>
                    <input
                      type="file"
                      className={Style.fileHidden}
                      onChange={(e) =>
                        setStaffPhoto(e.target.files?.[0] || null)
                      }
                      accept="image/*"
                    />
                  </label>
                </div>

                <div className={Style.fieldGroup}>
                  <label className={Style.label}>Preview</label>
                  <div className={Style.previewBox}>
                    {staffPhoto ? (
                      <img
                        className={Style.previewImg}
                        src={URL.createObjectURL(staffPhoto)}
                        alt=""
                      />
                    ) : (
                      <div className={Style.previewEmpty}>
                        <ImageIcon className={Style.previewEmptyIcon} />
                        <span className={Style.previewEmptyText}>No image</span>
                      </div>
                    )}
                  </div>
                </div>
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
          placeholder="Search staff…"
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
          <div className={`${Style.cell} ${Style.colFlex}`}>Type</div>
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
            <StaffIcon className={Style.emptyIcon} />
            <span className={Style.muted}>
              {search ? "No matching staff found." : "No staff yet. Add one!"}
            </span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((s, index) => (
              <motion.div
                key={s.staffId}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12, height: 0 }}
                transition={{ duration: 0.22, delay: index * 0.02 }}
                className={Style.tableRow}
              >
                <div className={`${Style.cell} ${Style.colSmall}`}>
                  <span className={Style.badge}>{index + 1}</span>
                </div>

                <div className={`${Style.cell} ${Style.colPhoto}`}>
                  {s.staffPhoto ? (
                    <img
                      className={Style.avatar}
                      src={`${API}${s.staffPhoto}`}
                      alt=""
                    />
                  ) : (
                    <span className={Style.muted}>-</span>
                  )}
                </div>

                <div className={`${Style.cell} ${Style.colFlex} ${Style.nameCell}`}>
                  {s.staffName}
                </div>

                <div className={`${Style.cell} ${Style.colFlex} ${Style.mono}`}>
                  {s.staffEmail}
                </div>

                <div className={`${Style.cell} ${Style.colFlex} ${Style.mono}`}>
                  {s.staffContact}
                </div>

                <div className={`${Style.cell} ${Style.colFlex}`}>
                  {s.placeName || "-"}
                </div>

                <div className={`${Style.cell} ${Style.colFlex}`}>
                  {s.stafftypeName || "-"}
                </div>

                <div className={`${Style.cell} ${Style.colAction}`}>
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className={Style.iconBtn}
                    onClick={() => startEdit(s)}
                    title="Edit"
                  >
                    <EditIcon fontSize="small" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className={`${Style.iconBtn} ${Style.iconBtnDanger}`}
                    onClick={() => askDelete(s.staffId, s.staffName)}
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