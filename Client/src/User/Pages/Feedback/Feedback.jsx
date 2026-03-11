import React, { useEffect, useState } from "react";
import axios from "axios";

const Feedback = () => {
  const [feedbackContent, setFeedbackContent] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);

  const userId = sessionStorage.getItem("uid"); // make sure login stores uid

  // LOAD ALL FEEDBACKS
  const loadFeedbacks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/feedback");
      setFeedbacks(res.data.data || []);
    } catch (err) {
      console.log("Load feedback error:", err);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  // INSERT FEEDBACK
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!feedbackContent.trim()) {
      alert("Please enter feedback");
      return;
    }

    if (!userId) {
      alert("User not logged in");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/feedback", {
        feedbackContent,
        userId,
      });

      alert(res.data.message);
      setFeedbackContent("");
      loadFeedbacks();
    } catch (err) {
      console.log("Insert feedback error:", err);
      alert(err.response?.data?.message || "Failed to add feedback");
    }
  };

  // DELETE FEEDBACK
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this feedback?");
    if (!confirmDelete) return;

    try {
      const res = await axios.delete(`http://localhost:5000/feedback/${id}`);
      alert(res.data.message);
      loadFeedbacks();
    } catch (err) {
      console.log("Delete feedback error:", err);
      alert("Failed to delete feedback");
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>Feedback</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: "30px" }}>
        <textarea
          placeholder="Enter your feedback"
          value={feedbackContent}
          onChange={(e) => setFeedbackContent(e.target.value)}
          rows="4"
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginBottom: "10px",
          }}
        ></textarea>

        <button
          type="submit"
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Submit Feedback
        </button>
      </form>

      <h3>All Feedbacks</h3>

      {feedbacks.length === 0 ? (
        <p>No feedback found</p>
      ) : (
        feedbacks.map((item) => (
          <div
            key={item.feedbackId}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "15px",
              background: "#f9f9f9",
            }}
          >
            <p>
              <strong>User:</strong> {item.userName || "Unknown User"}
            </p>
            <p>
              <strong>Feedback:</strong> {item.feedbackContent}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
            </p>

            <button
              onClick={() => handleDelete(item.feedbackId)}
              style={{
                padding: "8px 14px",
                backgroundColor: "red",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
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

export default Feedback;