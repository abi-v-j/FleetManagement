import axios from "axios";
import React, { useEffect, useState } from "react";
import Styles from "./UserComplaint.module.css"; // use correct css file

const Complaint = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showComplaint, setShowComplaint] = useState([]);

  // ================= FETCH =================
  const fetchComplaints = () => {
    axios
      .get("http://localhost:5000/complaint")
      .then((res) => {
        setShowComplaint(res.data.complaint || []);
      })
      .catch((err) => console.error(err));
  };

  // ================= SAVE =================
  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      alert("Please fill all fields");
      return;
    }

    axios.post("http://localhost:5000/complaint", {
  complaintTitle: title,
  complaintContent: content,
      })
      .then(() => {
        alert("Complaint submitted successfully");
        setTitle("");
        setContent("");
        fetchComplaints();
      })
      .catch((err) => {
        console.error(err.response?.data);
        alert("Error submitting complaint");
      });
  };

  // ================= DELETE =================
  const handleDelete = (id) => {
    axios
      .delete(`http://localhost:5000/complaint/${id}`)
      .then(() => {
        alert("Complaint deleted successfully");
        fetchComplaints();
      })
      .catch(() => alert("Error deleting complaint"));
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  return (
    <div className={Styles.page}>
      
      {/* HEADER */}
      <div className={Styles.header}>
        <h2>Complaint</h2>
        <p>Submit and manage complaints</p>
      </div>

      {/* FORM */}
      <div className={Styles.card}>
        <h3>Add Complaint</h3>

        <input
          type="text"
          className={Styles.input}
          placeholder="Enter Complaint Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className={Styles.input}
          placeholder="Enter Complaint Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className={Styles.actions}>
          <button className={Styles.primaryBtn} onClick={handleSave}>
            Submit
          </button>
          <button
            className={Styles.secondaryBtn}
            onClick={() => {
              setTitle("");
              setContent("");
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className={Styles.card}>
        <h3>Complaint List</h3>

        <table className={Styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Content</th>
              <th>Status</th>
              <th>Reply</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {showComplaint.length === 0 ? (
              <tr>
                <td colSpan="6" className={Styles.noData}>
                  No complaints found
                </td>
              </tr>
            ) : (
              showComplaint.map((complaint, index) => (
                <tr key={complaint._id}>
                  <td>{index + 1}</td>
                  <td>{complaint.complaintTitle}</td>
                  <td>{complaint.complaintContent}</td>
                  <td>{complaint.complaintStatus}</td>
                  <td>{complaint.complaintReply}</td>
                  <td>
                    <button
                      className={Styles.deleteBtn}
                      onClick={() => handleDelete(complaint._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Complaint;