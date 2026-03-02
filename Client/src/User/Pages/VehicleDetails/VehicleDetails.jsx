import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import Style from "./VehicleDetails.module.css";

import {
  DirectionsCarRounded as CarIcon,
  Close as CloseIcon,
  PhotoLibraryRounded as GalleryIcon,
  ErrorOutlineRounded as ErrorIcon,
} from "@mui/icons-material";

const API = "http://localhost:5000";

export default function VehicleDetails() {
  const { vehicleId } = useParams();

  const [vehicle, setVehicle] = useState(null);
  const [gallery, setGallery] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const [lightbox, setLightbox] = useState({ open: false, src: "", title: "" });

  const vid = useMemo(() => String(vehicleId ?? ""), [vehicleId]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setErrMsg("");

    try {
      // vehicle list -> find single
      const vRes = await axios.get(`${API}/vehicle`);
      const arr = vRes.data.data || [];
      const found = arr.find((v) => String(v.vehicleId) === vid);
      setVehicle(found || null);

      // gallery
      const gRes = await axios.get(`${API}/gallery/${vid}`);
      setGallery(gRes.data.data || []);
    } catch (e) {
      setErrMsg(e?.response?.data?.message || "Failed to load vehicle details.");
      setVehicle(null);
      setGallery([]);
    } finally {
      setLoading(false);
    }
  }, [vid]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  if (loading) {
    return (
      <div className={Style.page}>
        <div className={Style.loadingCard}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
            className={Style.spinner}
          />
          <span className={Style.muted}>Loading…</span>
        </div>
      </div>
    );
  }

  if (errMsg) {
    return (
      <div className={Style.page}>
        <div className={Style.errorCard}>
          <ErrorIcon className={Style.errorIcon} />
          <div className={Style.errorText}>
            <div className={Style.errorTitle}>Something went wrong</div>
            <div className={Style.muted}>{errMsg}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className={Style.page}>
        <div className={Style.errorCard}>
          <ErrorIcon className={Style.errorIcon} />
          <div className={Style.errorText}>
            <div className={Style.errorTitle}>Vehicle not found</div>
            <div className={Style.muted}>This vehicle id does not exist.</div>
          </div>
        </div>
      </div>
    );
  }

  const mainPhoto = vehicle.vehiclePhoto ? `${API}${vehicle.vehiclePhoto}` : "";

  return (
    <div className={Style.page}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className={Style.header}
      >
        <div className={Style.headerLeft}>
          <div className={Style.headerIcon}>
            <CarIcon className={Style.headerIconSvg} />
          </div>
          <div>
            <h1 className={Style.title}>{vehicle.vehicleName || "Vehicle"}</h1>
            <p className={Style.subtitle}>Vehicle details & gallery</p>
          </div>
        </div>

        <div className={Style.pills}>
          <span className={Style.pill}>₹ {vehicle.vehiclePrice ?? "-"}</span>
          <span className={Style.pill}>{vehicle.vehicleSeatcount ?? "-"} Seats</span>
        </div>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={Style.card}
      >
        <div className={Style.cardGrid}>
          {/* Photo */}
          <div className={Style.photoBox}>
            {mainPhoto ? (
              <button
                className={Style.photoBtn}
                onClick={() =>
                  setLightbox({ open: true, src: mainPhoto, title: vehicle.vehicleName || "Photo" })
                }
              >
                <img src={mainPhoto} alt="" className={Style.mainImg} />
                <div className={Style.photoOverlay}>Click to view</div>
              </button>
            ) : (
              <div className={Style.noPhoto}>No main photo</div>
            )}
          </div>

          {/* Details */}
          <div className={Style.details}>
            <div className={Style.kv}>
              <div className={Style.k}>Name</div>
              <div className={Style.v}>{vehicle.vehicleName || "-"}</div>
            </div>

            <div className={Style.kv}>
              <div className={Style.k}>Description</div>
              <div className={Style.v}>{vehicle.vehicleDescription || "-"}</div>
            </div>

            <div className={Style.kvRow}>
              <div className={Style.kv}>
                <div className={Style.k}>Price</div>
                <div className={Style.vStrong}>₹ {vehicle.vehiclePrice ?? "-"}</div>
              </div>
              <div className={Style.kv}>
                <div className={Style.k}>Seat Count</div>
                <div className={Style.vStrong}>{vehicle.vehicleSeatcount ?? "-"}</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Gallery */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.4 }}
        className={Style.galleryCard}
      >
        <div className={Style.galleryHeader}>
          <div className={Style.galleryTitle}>
            <GalleryIcon className={Style.galleryIcon} />
            <span>Gallery</span>
          </div>
          <span className={Style.galleryCount}>{gallery.length} photo(s)</span>
        </div>

        {gallery.length === 0 ? (
          <div className={Style.emptyState}>
            <span className={Style.muted}>No images available</span>
          </div>
        ) : (
          <div className={Style.grid}>
            {gallery.map((g, idx) => {
              const src = g.galleryFile ? `${API}${g.galleryFile}` : "";
              return (
                <motion.button
                  key={g.galleryId}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={Style.thumbBtn}
                  onClick={() =>
                    setLightbox({
                      open: true,
                      src,
                      title: `${vehicle.vehicleName || "Vehicle"} • ${idx + 1}`,
                    })
                  }
                >
                  <img src={src} alt="" className={Style.thumb} />
                </motion.button>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox.open && (
          <>
            <motion.div
              key="lb-backdrop"
              className={Style.backdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightbox({ open: false, src: "", title: "" })}
            />
            <motion.div
              key="lb-modal"
              className={Style.lightbox}
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
            >
              <div className={Style.lightboxTop}>
                <div className={Style.lightboxTitle}>{lightbox.title}</div>
                <button
                  className={Style.iconGhostBtn}
                  onClick={() => setLightbox({ open: false, src: "", title: "" })}
                >
                  <CloseIcon fontSize="small" />
                </button>
              </div>

              <div className={Style.lightboxBody}>
                <img src={lightbox.src} alt="" className={Style.lightboxImg} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}