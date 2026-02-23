import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router";

const API = "http://localhost:5000";

const VehicleDetails = () => {
  const { vehicleId } = useParams();

  const [vehicle, setVehicle] = useState(null);
  const [gallery, setGallery] = useState([]);

  // Load vehicle details
  const loadVehicle = async () => {
    const res = await axios.get(`${API}/vehicle`);
    const found = (res.data.data || []).find(v => v.vehicleId === vehicleId);
    setVehicle(found || null);
  };

  // Load gallery images
  const loadGallery = async () => {
    const res = await axios.get(`${API}/gallery/${vehicleId}`);
    setGallery(res.data.data || []);
  };

  useEffect(() => {
    loadVehicle();
    loadGallery();
  }, [vehicleId]);

  if (!vehicle) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h3>Vehicle Details</h3>

      <table border="1" cellPadding="8">
        <tbody>
          <tr>
            <td>Main Photo</td>
            <td>
              {vehicle.vehiclePhoto ? (
                <img
                  src={`${API}${vehicle.vehiclePhoto}`}
                  alt=""
                  width="200"
                  height="120"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                "-"
              )}
            </td>
          </tr>

          <tr>
            <td>Name</td>
            <td>{vehicle.vehicleName}</td>
          </tr>

          <tr>
            <td>Description</td>
            <td>{vehicle.vehicleDescription}</td>
          </tr>

          <tr>
            <td>Price</td>
            <td>{vehicle.vehiclePrice}</td>
          </tr>

          <tr>
            <td>Seat Count</td>
            <td>{vehicle.vehicleSeatcount}</td>
          </tr>
        </tbody>
      </table>

      <h4 style={{ marginTop: 20 }}>Gallery</h4>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {gallery.map((g) => (
          <img
            key={g.galleryId}
            src={`${API}${g.galleryFile}`}
            alt=""
            width="180"
            height="120"
            style={{ objectFit: "cover", border: "1px solid #ccc" }}
          />
        ))}

        {!gallery.length && <div>No images available</div>}
      </div>
    </div>
  );
};

export default VehicleDetails;