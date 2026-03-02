import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import Style from "./SearchVehicle.module.css";

import {
  DirectionsCarRounded as CarIcon,
  SearchRounded as SearchIcon,
  CurrencyRupeeRounded as RupeeIcon,
  EventSeatRounded as SeatIcon,
  RefreshRounded as RefreshIcon,
  ClearAllRounded as ClearIcon,
  ArrowForwardRounded as ArrowIcon,
} from "@mui/icons-material";

const API = "http://localhost:5000";

export default function SearchVehicle() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [seat, setSeat] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${API}/vehicle`);
      setList(r.data.data || []);
    } catch (e) {
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    const min = minPrice === "" ? null : Number(minPrice);
    const max = maxPrice === "" ? null : Number(maxPrice);
    const seats = seat === "" ? null : Number(seat);

    return (list || []).filter((v) => {
      const name = (v.vehicleName || "").toLowerCase();
      const desc = (v.vehicleDescription || "").toLowerCase();
      const price = Number(v.vehiclePrice);
      const seatcount = Number(v.vehicleSeatcount);

      if (text && !(name.includes(text) || desc.includes(text))) return false;
      if (min !== null && !Number.isNaN(min) && price < min) return false;
      if (max !== null && !Number.isNaN(max) && price > max) return false;
      if (seats !== null && !Number.isNaN(seats) && seatcount !== seats) return false;

      return true;
    });
  }, [list, q, minPrice, maxPrice, seat]);

  const clear = () => {
    setQ("");
    setMinPrice("");
    setMaxPrice("");
    setSeat("");
  };

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
            <h1 className={Style.title}>Search Vehicles</h1>
            <p className={Style.subtitle}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        <div className={Style.headerActions}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={Style.btnGhost}
            onClick={clear}
            type="button"
          >
            <ClearIcon fontSize="small" /> Clear
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={Style.btnPrimary}
            onClick={load}
            type="button"
            disabled={loading}
          >
            <RefreshIcon fontSize="small" />
            {loading ? "Refreshing…" : "Refresh"}
          </motion.button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
        className={Style.filterCard}
      >
        <div className={Style.filterGrid}>
          <div className={Style.inputWrap}>
            <SearchIcon className={Style.inputIcon} />
            <input
              className={Style.input}
              placeholder="Search name or description…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className={Style.inputWrap}>
            <RupeeIcon className={Style.inputIcon} />
            <input
              className={Style.input}
              placeholder="Min price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value.replace(/[^\d]/g, ""))}
            />
          </div>

          <div className={Style.inputWrap}>
            <RupeeIcon className={Style.inputIcon} />
            <input
              className={Style.input}
              placeholder="Max price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value.replace(/[^\d]/g, ""))}
            />
          </div>

          <div className={Style.inputWrap}>
            <SeatIcon className={Style.inputIcon} />
            <input
              className={Style.input}
              placeholder="Seat count"
              value={seat}
              onChange={(e) => setSeat(e.target.value.replace(/[^\d]/g, ""))}
            />
          </div>
        </div>
      </motion.div>

      {/* Results */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16, duration: 0.4 }}
        className={Style.grid}
      >
        {loading ? (
          <div className={Style.loading}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
              className={Style.spinner}
            />
            <span className={Style.muted}>Loading vehicles…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className={Style.emptyState}>
            <CarIcon className={Style.emptyIcon} />
            <div className={Style.emptyTitle}>No vehicles found</div>
            <div className={Style.emptySub}>Try changing filters or refresh.</div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((v, idx) => (
              <motion.div
                key={v.vehicleId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.22, delay: idx * 0.03 }}
                className={Style.card}
              >
                <div className={Style.media}>
                  {v.vehiclePhoto ? (
                    <img
                      className={Style.img}
                      src={`${API}/${v.vehiclePhoto}`}
                      alt={v.vehicleName || "Vehicle"}
                    />
                  ) : (
                    <div className={Style.imgFallback}>
                      <CarIcon />
                    </div>
                  )}
                </div>

                <div className={Style.body}>
                  <div className={Style.top}>
                    <div className={Style.name}>{v.vehicleName}</div>
                    <div className={Style.badge}>
                      <SeatIcon fontSize="small" /> {v.vehicleSeatcount} seats
                    </div>
                  </div>

                  <div className={Style.desc}>{v.vehicleDescription || "—"}</div>

                  <div className={Style.bottom}>
                    <div className={Style.price}>
                      <RupeeIcon fontSize="small" />
                      <span>{v.vehiclePrice}</span>
                    </div>

                    {/* ✅ match your route: /user/vehicledetails/:vehicleId */}
                    <Link className={Style.linkBtn} to={`/user/vehicledetails/${v.vehicleId}`}>
                      View Details <ArrowIcon fontSize="small" />
                    </Link>
                     <Link className={Style.linkBtn} to={`/user/bookvehicle/${v.vehicleId}`}>
                      Book Now <ArrowIcon fontSize="small" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}