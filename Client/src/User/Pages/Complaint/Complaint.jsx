import React, { useEffect, useState } from "react";
import axios from "axios";

const Complaint = () => {
  const [complaintTitle, setComplaintTitle] = useState("");
  const [complaintContent, setComplaintContent] = useState("");
  const [complaints, setComplaints] = useState([]);

  const userId = sessionStorage.getItem("uid");

  const loadComplaints = async () => {
    try {
      const res = await axios.get("http://localhost:5000/complaint");
      setComplaints(res.data.data || []);
    } catch (err) {
      console.log("Load complaint error:", err);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!complaintTitle.trim()) {
      alert("Please enter complaint title");
      return;
    }

    if (!complaintContent.trim()) {
      alert("Please enter complaint content");
      return;
    }

    if (!userId) {
      alert("User not logged in");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/complaint", {
        complaintTitle,
        complaintContent,
        userId,
      });

      alert(res.data.message);
      setComplaintTitle("");
      setComplaintContent("");
      loadComplaints();
    } catch (err) {
      console.log("Insert complaint error:", err);
      alert(err.response?.data?.message || "Failed to add complaint");
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this complaint?");
    if (!ok) return;

    try {
      const res = await axios.delete(`http://localhost:5000/complaint/${id}`);
      alert(res.data.message);
      loadComplaints();
    } catch (err) {
      console.log("Delete complaint error:", err);
      alert("Failed to delete complaint");
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: "900px", margin: "0 auto" }}>
      <h2>Complaint</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: "30px" }}>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="Enter complaint title"
            value={complaintTitle}
            onChange={(e) => setComplaintTitle(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <textarea
            placeholder="Enter complaint content"
            value={complaintContent}
            onChange={(e) => setComplaintContent(e.target.value)}
            rows="4"
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "10px 18px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Submit Complaint
        </button>
      </form>

      <h3>Complaint List</h3>

      {complaints.length === 0 ? (
        <p>No complaints found</p>
      ) : (
        complaints.map((item) => (
          <div
            key={item.complaintId}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "15px",
              marginBottom: "15px",
              background: "#f9f9f9",
            }}
          >
            <p>
              <strong>User:</strong> {item.userName || "Unknown User"}
            </p>
            <p>
              <strong>Title:</strong> {item.complaintTitle}
            </p>
            <p>
              <strong>Content:</strong> {item.complaintContent}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {item.complaintDate
                ? new Date(item.complaintDate).toLocaleString()
                : ""}
            </p>
            <p>
              <strong>Reply:</strong> {item.complaintReply}
            </p>
            <p>
              <strong>Status:</strong> {item.complaintStatus}
            </p>

            <button
              onClick={() => handleDelete(item.complaintId)}
              style={{
                padding: "8px 14px",
                backgroundColor: "red",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default Complaint;