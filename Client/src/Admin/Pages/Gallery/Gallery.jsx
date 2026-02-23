// Gallery.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import Style from "./Gallery.module.css";

import {
  PhotoLibrary as GalleryIcon,
  ArrowBack as BackIcon,
  UploadFile as UploadFileIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorOutlineIcon,
  Image as ImageIcon,
  DirectionsCar as CarIcon,
  Payments as PaymentsIcon,
  EventSeat as SeatIcon,
  Search as SearchIcon,
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
const ConfirmDialog = ({ open, onConfirm, onCancel }) => (
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

          <h3 className={Style.dialogTitle}>Delete Image?</h3>
          <p className={Style.dialogBody}>
            Are you sure you want to delete this image? This action cannot be undone.
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

export default function Gallery() {
  const { vehicleId } = useParams();

  const [vehicle, setVehicle] = useState(null);
  const [list, setList] = useState([]);
  const [file, setFile] = useState(null);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [toasts, setToasts] = useState([]);
  const [confirm, setConfirm] = useState({ open: false, id: null });

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

  const loadVehicle = useCallback(() => {
    axios
      .get(`${API}/vehicle`)
      .then((r) => {
        const v = (r.data.data || []).find((x) => String(x.vehicleId) === String(vehicleId));
        setVehicle(v || null);
      })
      .catch(() => addToast("Failed to load vehicle.", "error"));
  }, [vehicleId, addToast]);

  const loadGallery = useCallback(() => {
    setLoading(true);
    axios
      .get(`${API}/gallery/${vehicleId}`)
      .then((r) => setList(r.data.data || []))
      .catch(() => addToast("Failed to load gallery.", "error"))
      .finally(() => setLoading(false));
  }, [vehicleId, addToast]);

  useEffect(() => {
    loadVehicle();
    loadGallery();
  }, [loadVehicle, loadGallery]);

  const upload = async () => {
    if (!file) {
      addToast("Select image first.", "error");
      return;
    }

    setUploading(true);
    const fd = new FormData();
    fd.append("vehicleId", vehicleId);
    fd.append("galleryFile", file);

    axios
      .post(`${API}/gallery`, fd)
      .then(() => {
        addToast("Image uploaded!");
        setFile(null);
        loadGallery();
      })
      .catch(() => addToast("Upload failed. Try again.", "error"))
      .finally(() => setUploading(false));
  };

  const askDelete = (id) => setConfirm({ open: true, id });

  const executeDelete = () => {
    axios
      .delete(`${API}/gallery/${confirm.id}`)
      .then(() => {
        addToast("Image deleted!");
        loadGallery();
      })
      .catch(() => addToast("Delete failed. Try again.", "error"))
      .finally(() => setConfirm({ open: false, id: null }));
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    // If your API returns filename/path, filter by it:
    return list.filter((g) => String(g.galleryFile || "").toLowerCase().includes(q));
  }, [list, search]);

  return (
    <div className={Style.page}>
      <Toast toasts={toasts} removeToast={removeToast} />

      <ConfirmDialog
        open={confirm.open}
        onConfirm={executeDelete}
        onCancel={() => setConfirm({ open: false, id: null })}
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
            <GalleryIcon className={Style.headerIconSvg} />
          </div>

          <div>
            <h1 className={Style.title}>Vehicle Gallery</h1>
            <p className={Style.subtitle}>
              {vehicle ? (
                <>
                  <span className={Style.vehicleName}>{vehicle.vehicleName}</span> •{" "}
                  <span className={Style.meta}>
                    <PaymentsIcon className={Style.metaIcon} /> {vehicle.vehiclePrice}
                  </span>{" "}
                  •{" "}
                  <span className={Style.meta}>
                    <SeatIcon className={Style.metaIcon} /> {vehicle.vehicleSeatcount}
                  </span>
                </>
              ) : (
                "Loading vehicle details…"
              )}
            </p>
          </div>
        </div>

        <Link className={Style.backBtn} to="/admin/vehicle">
          <BackIcon fontSize="small" />
          Back
        </Link>
      </motion.div>

      {/* Vehicle card */}
      {vehicle && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className={Style.vehicleCard}
        >
          <div className={Style.vehicleCardLeft}>
            <div className={Style.vehicleMiniIcon}>
              <CarIcon className={Style.vehicleMiniIconSvg} />
            </div>
            <div>
              <div className={Style.vehicleTitle}>{vehicle.vehicleName}</div>
              <div className={Style.vehicleDesc}>{vehicle.vehicleDescription}</div>
            </div>
          </div>

          <div className={Style.vehicleCardRight}>
            <span className={Style.pill}>
              <PaymentsIcon fontSize="small" /> {vehicle.vehiclePrice}
            </span>
            <span className={Style.pill}>
              <SeatIcon fontSize="small" /> {vehicle.vehicleSeatcount}
            </span>
          </div>
        </motion.div>
      )}

      {/* Upload panel */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.35 }}
        className={Style.uploadCard}
      >
        <div className={Style.uploadTop}>
          <div className={Style.uploadTitle}>Upload new image</div>
          {file && (
            <button className={Style.iconGhostBtn} onClick={() => setFile(null)} title="Clear">
              <CloseIcon fontSize="small" />
            </button>
          )}
        </div>

        <div className={Style.uploadGrid}>
          <div className={Style.fieldGroup}>
            <label className={Style.label}>Select File</label>
            <label className={Style.fileBox}>
              <UploadFileIcon className={Style.fileIcon} />
              <span className={Style.fileText}>{file ? file.name : "Choose image…"}</span>
              <input
                type="file"
                className={Style.fileHidden}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept="image/*"
              />
            </label>
          </div>

          <div className={Style.fieldGroup}>
            <label className={Style.label}>Preview</label>
            <div className={Style.previewBox}>
              {file ? (
                <img className={Style.previewImg} src={URL.createObjectURL(file)} alt="" />
              ) : (
                <div className={Style.previewEmpty}>
                  <ImageIcon className={Style.previewEmptyIcon} />
                  <span className={Style.previewEmptyText}>No image</span>
                </div>
              )}
            </div>
          </div>

          <div className={Style.uploadActions}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={Style.btnPrimary}
              onClick={upload}
              disabled={uploading}
              title="Upload"
            >
              <UploadFileIcon fontSize="small" />
              {uploading ? "Uploading…" : "Upload"}
            </motion.button>
          </div>
        </div>
      </motion.div>

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
          placeholder="Search images…"
          className={Style.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </motion.div>

      {/* Grid */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.4 }}
        className={Style.gridWrap}
      >
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
            <GalleryIcon className={Style.emptyIcon} />
            <span className={Style.muted}>
              {search ? "No matching images found." : "No images yet. Upload one!"}
            </span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((g, index) => (
              <motion.div
                key={g.galleryId}
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                transition={{ duration: 0.22, delay: index * 0.02 }}
                className={Style.card}
              >
                <div className={Style.cardMedia}>
                  <img className={Style.cardImg} src={`${API}${g.galleryFile}`} alt="" />
                </div>

                <div className={Style.cardFooter}>
                  <span className={Style.cardIndex}>#{index + 1}</span>

                  <motion.button
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.96 }}
                    className={`${Style.iconBtn} ${Style.iconBtnDanger}`}
                    onClick={() => askDelete(g.galleryId)}
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