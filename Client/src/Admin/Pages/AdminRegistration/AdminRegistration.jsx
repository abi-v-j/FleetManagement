// Admin.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Style from "./AdminRegistration.module.css";

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  AdminPanelSettings as AdminIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorOutlineIcon,
  Search as SearchIcon,
  SaveAlt as SaveAltIcon,
} from "@mui/icons-material";

const API = "http://localhost:5000/admin";

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

          <h3 className={Style.dialogTitle}>Delete Admin?</h3>
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

export default function Admin() {
  const [admins, setAdmins] = useState([]);

  const [editId, setEditId] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);

  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

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
      .get(API)
      .then((res) => setAdmins(res.data.data || []))
      .catch(() => addToast("Failed to load admins.", "error"))
      .finally(() => setLoading(false));
  }, [addToast]);

  useEffect(() => {
    load();
  }, [load]);

  const reset = () => {
    setEditId("");
    setAdminName("");
    setAdminEmail("");
    setAdminPassword("");
    setPanelOpen(false);
  };

  const startEdit = (a) => {
    setEditId(a.adminId);
    setAdminName(a.adminName);
    setAdminEmail(a.adminEmail);
    setAdminPassword(a.adminPassword);
    setPanelOpen(true);
  };

  const save = async () => {
    if (!adminName.trim() || !adminEmail.trim() || !adminPassword.trim()) {
      addToast("All fields are required.", "error");
      return;
    }

    setSaving(true);
    const payload = { adminName, adminEmail, adminPassword };

    const req = editId
      ? axios.put(`${API}/${editId}`, payload)
      : axios.post(API, payload);

    req
      .then(() => {
        addToast(editId ? "Admin updated!" : "Admin added!");
        reset();
        load();
      })
      .catch(() => addToast("Operation failed. Try again.", "error"))
      .finally(() => setSaving(false));
  };

  const askDelete = (id, name) => setConfirm({ open: true, id, name });

  const executeDelete = () => {
    axios
      .delete(`${API}/${confirm.id}`)
      .then(() => {
        addToast("Admin deleted!");
        load();
      })
      .catch(() => addToast("Delete failed. Try again.", "error"))
      .finally(() => setConfirm({ open: false, id: null, name: "" }));
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return admins;
    return admins.filter(
      (a) =>
        a.adminName?.toLowerCase().includes(q) ||
        a.adminEmail?.toLowerCase().includes(q)
    );
  }, [admins, search]);

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
            <AdminIcon className={Style.headerIconSvg} />
          </div>

          <div>
            <h1 className={Style.title}>Admins</h1>
            <p className={Style.subtitle}>
              {admins.length} admin{admins.length !== 1 ? "s" : ""} registered
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
              setAdminName("");
              setAdminEmail("");
              setAdminPassword("");
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
              {isAddMode ? "Close" : "Add Admin"}
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
            animate={{ opacity: 1, y: 0, maxHeight: 420, marginBottom: 18 }}
            exit={{ opacity: 0, y: -8, maxHeight: 0, marginBottom: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className={Style.panelWrap}
          >
            <div className={Style.panel}>
              <div className={Style.panelHeader}>
                <span className={Style.panelTitle}>
                  {editId ? "✏️ Edit Admin" : "➕ New Admin"}
                </span>
                <button className={Style.iconGhostBtn} onClick={reset}>
                  <CloseIcon fontSize="small" />
                </button>
              </div>

              <div className={Style.grid}>
                <div className={Style.fieldGroup}>
                  <label className={Style.label}>Admin Name</label>
                  <input
                    autoFocus
                    className={Style.input}
                    placeholder="e.g. Admin"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                  />
                </div>

                <div className={Style.fieldGroup}>
                  <label className={Style.label}>Email</label>
                  <input
                    className={Style.input}
                    placeholder="e.g. admin@gmail.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                  />
                </div>

                <div className={Style.fieldGroup}>
                  <label className={Style.label}>Password</label>
                  <input
                    className={Style.input}
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && save()}
                  />
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
          placeholder="Search admins…"
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
          <div className={`${Style.cell} ${Style.colFlex}`}>Name</div>
          <div className={`${Style.cell} ${Style.colFlex}`}>Email</div>
          <div className={`${Style.cell} ${Style.colFlex}`}>Password</div>
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
            <AdminIcon className={Style.emptyIcon} />
            <span className={Style.muted}>
              {search ? "No matching admins found." : "No admins yet. Add one!"}
            </span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((a, index) => (
              <motion.div
                key={a.adminId}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12, height: 0 }}
                transition={{ duration: 0.22, delay: index * 0.03 }}
                className={Style.tableRow}
              >
                <div className={`${Style.cell} ${Style.colSmall}`}>
                  <span className={Style.badge}>{index + 1}</span>
                </div>

                <div className={`${Style.cell} ${Style.colFlex} ${Style.nameCell}`}>
                  {a.adminName}
                </div>

                <div className={`${Style.cell} ${Style.colFlex} ${Style.mono}`}>
                  {a.adminEmail}
                </div>

                <div className={`${Style.cell} ${Style.colFlex} ${Style.mono}`}>
                  {a.adminPassword}
                </div>

                <div className={`${Style.cell} ${Style.colAction}`}>
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className={Style.iconBtn}
                    onClick={() => startEdit(a)}
                    title="Edit"
                  >
                    <EditIcon fontSize="small" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className={`${Style.iconBtn} ${Style.iconBtnDanger}`}
                    onClick={() => askDelete(a.adminId, a.adminName)}
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