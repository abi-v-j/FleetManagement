import React, { useEffect, useState } from "react";
import axios from "axios";

const ViewComplaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [replyInputs, setReplyInputs] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  const loadComplaints = async () => {
    try {
      const res = await axios.get("http://localhost:5000/admin/complaint");
      const data = res.data.data || [];
      setComplaints(data);

      const initialReplies = {};
      data.forEach((item) => {
        initialReplies[item.complaintId] =
          item.complaintReply && item.complaintReply !== "Pending"
            ? item.complaintReply
            : "";
      });
      setReplyInputs(initialReplies);
    } catch (err) {
      console.log("Load complaint error:", err);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleReplyChange = (id, value) => {
    setReplyInputs((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleReplySubmit = async (id) => {
    const complaintReply = (replyInputs[id] || "").trim();

    if (!complaintReply) {
      alert("Please enter reply");
      return;
    }

    try {
      setLoadingId(id);

      const res = await axios.put(
        `http://localhost:5000/admin/complaint/${id}/reply`,
        { complaintReply }
      );

      alert(res.data.message);
      loadComplaints();
    } catch (err) {
      console.log("Reply update error:", err);
      alert(err.response?.data?.message || "Failed to update reply");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this complaint?");
    if (!ok) return;

    try {
      const res = await axios.delete(`http://localhost:5000/admin/complaint/${id}`);
      alert(res.data.message);
      loadComplaints();
    } catch (err) {
      console.log("Delete complaint error:", err);
      alert(err.response?.data?.message || "Failed to delete complaint");
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: "1100px", margin: "0 auto" }}>
      <h2>View Complaints</h2>

      {complaints.length === 0 ? (
        <p>No complaints found</p>
      ) : (
        complaints.map((item) => (
          <div
            key={item.complaintId}
            style={{
              border: "1px solid #ddd",
              borderRadius: "12px",
              padding: "18px",
              marginBottom: "18px",
              background: "#f9f9f9",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <p>
              <strong>User:</strong> {item.userName || "Unknown User"}
            </p>
            <p>
              <strong>Email:</strong> {item.userEmail || "N/A"}
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
              <strong>Status:</strong> {item.complaintStatus}
            </p>
            <p>
              <strong>Current Reply:</strong> {item.complaintReply}
            </p>

            <div style={{ marginTop: "12px" }}>
              <textarea
                rows="3"
                placeholder="Type reply here"
                value={replyInputs[item.complaintId] || ""}
                onChange={(e) =>
                  handleReplyChange(item.complaintId, e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  resize: "vertical",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "12px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => handleReplySubmit(item.complaintId)}
                disabled={loadingId === item.complaintId}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "#198754",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                {loadingId === item.complaintId ? "Updating..." : "Submit Reply"}
              </button>

              
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ViewComplaint;