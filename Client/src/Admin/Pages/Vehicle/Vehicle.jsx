// Vehicle.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";
import Style from "./Vehicle.module.css";

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  DirectionsCar as VehicleIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorOutlineIcon,
  Search as SearchIcon,
  SaveAlt as SaveAltIcon,
  Image as ImageIcon,
  UploadFile as UploadFileIcon,
  Payments as PaymentsIcon,
  EventSeat as SeatIcon,
  Description as DescIcon,
  Badge as BadgeIcon,
  PhotoLibrary as GalleryIcon,
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

          <h3 className={Style.dialogTitle}>Delete Vehicle?</h3>
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

export default function Vehicle() {
  const [list, setList] = useState([]);

  const [editId, setEditId] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);

  const [vehicleName, setVehicleName] = useState("");
  const [vehicleDescription, setVehicleDescription] = useState("");
  const [vehiclePrice, setVehiclePrice] = useState("");
  const [vehicleSeatcount, setVehicleSeatcount] = useState("");
  const [vehiclePhoto, setVehiclePhoto] = useState(null);

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
      .get(`${API}/vehicle`)
      .then((r) => setList(r.data.data || []))
      .catch(() => addToast("Failed to load vehicles.", "error"))
      .finally(() => setLoading(false));
  }, [addToast]);

  useEffect(() => {
    load();
  }, [load]);

  const reset = () => {
    setEditId("");
    setVehicleName("");
    setVehicleDescription("");
    setVehiclePrice("");
    setVehicleSeatcount("");
    setVehiclePhoto(null);
    setPanelOpen(false);
  };

  const startEdit = (v) => {
    setEditId(v.vehicleId);
    setVehicleName(v.vehicleName || "");
    setVehicleDescription(v.vehicleDescription || "");
    setVehiclePrice(String(v.vehiclePrice ?? ""));
    setVehicleSeatcount(String(v.vehicleSeatcount ?? ""));
    setVehiclePhoto(null);
    setPanelOpen(true);
  };

  const save = async () => {
    if (
      !vehicleName.trim() ||
      !vehicleDescription.trim() ||
      !String(vehiclePrice).trim() ||
      !String(vehicleSeatcount).trim()
    ) {
      addToast("All fields are required.", "error");
      return;
    }

    // for new add, require photo
    if (!editId && !vehiclePhoto) {
      addToast("Please select vehicle photo.", "error");
      return;
    }

    setSaving(true);

    const fd = new FormData();
    fd.append("vehicleName", vehicleName);
    fd.append("vehicleDescription", vehicleDescription);
    fd.append("vehiclePrice", vehiclePrice);
    fd.append("vehicleSeatcount", vehicleSeatcount);
    if (vehiclePhoto) fd.append("vehiclePhoto", vehiclePhoto);

    const req = editId
      ? axios.put(`${API}/vehicle/${editId}`, fd)
      : axios.post(`${API}/vehicle`, fd);

    req
      .then(() => {
        addToast(editId ? "Vehicle updated!" : "Vehicle added!");
        reset();
        load();
      })
      .catch(() => addToast("Operation failed. Try again.", "error"))
      .finally(() => setSaving(false));
  };

  const askDelete = (id, name) => setConfirm({ open: true, id, name });

  const executeDelete = () => {
    axios
      .delete(`${API}/vehicle/${confirm.id}`)
      .then(() => {
        addToast("Vehicle deleted!");
        load();
      })
      .catch(() => addToast("Delete failed. Try again.", "error"))
      .finally(() => setConfirm({ open: false, id: null, name: "" }));
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (v) =>
        v.vehicleName?.toLowerCase().includes(q) ||
        v.vehicleDescription?.toLowerCase().includes(q) ||
        String(v.vehiclePrice ?? "").toLowerCase().includes(q) ||
        String(v.vehicleSeatcount ?? "").toLowerCase().includes(q)
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
            <VehicleIcon className={Style.headerIconSvg} />
          </div>

          <div>
            <h1 className={Style.title}>Vehicles</h1>
            <p className={Style.subtitle}>
              {list.length} vehicle{list.length !== 1 ? "s" : ""} registered
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
              setVehicleName("");
              setVehicleDescription("");
              setVehiclePrice("");
              setVehicleSeatcount("");
              setVehiclePhoto(null);
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
              {isAddMode ? "Close" : "Add Vehicle"}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* Panel (auto height, no clipping) */}
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
                  {editId ? "✏️ Edit Vehicle" : "➕ New Vehicle"}
                </span>
                <button className={Style.iconGhostBtn} onClick={reset}>
                  <CloseIcon fontSize="small" />
                </button>
              </div>

              <div className={Style.grid}>
                <div className={Style.fieldGroup}>
                  <label className={Style.label}>Vehicle Name</label>
                  <div className={Style.inputWrap}>
                    <BadgeIcon className={Style.inputIcon} />
                    <input
                      className={Style.input}
                      placeholder="e.g. Mini Bus"
                      value={vehicleName}
                      onChange={(e) => setVehicleName(e.target.value)}
                    />
                  </div>
                </div>

                <div className={Style.fieldGroup}>
                  <label className={Style.label}>Price (per day)</label>
                  <div className={Style.inputWrap}>
                    <PaymentsIcon className={Style.inputIcon} />
                    <input
                      className={Style.input}
                      placeholder="e.g. 2500"
                      value={vehiclePrice}
                      onChange={(e) => setVehiclePrice(e.target.value)}
                      inputMode="numeric"
                    />
                  </div>
                </div>

                <div className={Style.fieldGroup}>
                  <label className={Style.label}>Seat Count</label>
                  <div className={Style.inputWrap}>
                    <SeatIcon className={Style.inputIcon} />
                    <input
                      className={Style.input}
                      placeholder="e.g. 30"
                      value={vehicleSeatcount}
                      onChange={(e) => setVehicleSeatcount(e.target.value)}
                      inputMode="numeric"
                    />
                  </div>
                </div>

                <div className={`${Style.fieldGroup} ${Style.full}`}>
                  <label className={Style.label}>Description</label>
                  <div className={Style.textareaWrap}>
                    <DescIcon className={Style.inputIconTop} />
                    <textarea
                      className={Style.textarea}
                      placeholder="Enter vehicle description..."
                      value={vehicleDescription}
                      onChange={(e) => setVehicleDescription(e.target.value)}
                    />
                  </div>
                </div>

                <div className={Style.fieldGroup}>
                  <label className={Style.label}>Photo</label>
                  <label className={Style.fileBox}>
                    <UploadFileIcon className={Style.fileIcon} />
                    <span className={Style.fileText}>
                      {vehiclePhoto ? vehiclePhoto.name : "Upload vehicle photo"}
                    </span>
                    <input
                      type="file"
                      className={Style.fileHidden}
                      onChange={(e) => setVehiclePhoto(e.target.files?.[0] || null)}
                      accept="image/*"
                    />
                  </label>
                  {!editId && (
                    <span className={Style.hint}>* Photo required for new vehicle</span>
                  )}
                </div>

                <div className={Style.fieldGroup}>
                  <label className={Style.label}>Preview</label>
                  <div className={Style.previewBox}>
                    {vehiclePhoto ? (
                      <img
                        className={Style.previewImg}
                        src={URL.createObjectURL(vehiclePhoto)}
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
          placeholder="Search vehicles…"
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
          <div className={`${Style.cell} ${Style.colFlex}`}>Description</div>
          <div className={`${Style.cell} ${Style.colFlex}`}>Price</div>
          <div className={`${Style.cell} ${Style.colFlex}`}>Seats</div>
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
            <VehicleIcon className={Style.emptyIcon} />
            <span className={Style.muted}>
              {search ? "No matching vehicles found." : "No vehicles yet. Add one!"}
            </span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((v, index) => (
              <motion.div
                key={v.vehicleId}
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
                  {v.vehiclePhoto ? (
                    <img className={Style.avatar} src={`${API}${v.vehiclePhoto}`} alt="" />
                  ) : (
                    <span className={Style.muted}>-</span>
                  )}
                </div>

                <div className={`${Style.cell} ${Style.colFlex} ${Style.nameCell}`}>
                  {v.vehicleName}
                </div>

                <div className={`${Style.cell} ${Style.colFlex}`}>
                  <span className={Style.descClamp}>{v.vehicleDescription}</span>
                </div>

                <div className={`${Style.cell} ${Style.colFlex} ${Style.mono}`}>
                  {v.vehiclePrice}
                </div>

                <div className={`${Style.cell} ${Style.colFlex} ${Style.mono}`}>
                  {v.vehicleSeatcount}
                </div>

                <div className={`${Style.cell} ${Style.colAction}`}>
                  <Link className={Style.linkBtn} to={`/admin/gallery/${v.vehicleId}`}>
                    <GalleryIcon fontSize="small" />
                  </Link>

                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className={Style.iconBtn}
                    onClick={() => startEdit(v)}
                    title="Edit"
                  >
                    <EditIcon fontSize="small" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className={`${Style.iconBtn} ${Style.iconBtnDanger}`}
                    onClick={() => askDelete(v.vehicleId, v.vehicleName)}
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