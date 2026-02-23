import axios from "axios";
import React, { useEffect, useState } from "react";
import Styles from "./UserFeedback.module.css";

const UserFeedback = () => {
  const userId = localStorage.getItem("userId"); // make sure this exists

  const [feedbackContent, setFeedbackContent] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);

  // FETCH USER FEEDBACKS
  const fetchMyFeedbacks = () => {
    if (!userId) return;

    axios
      .get(`http://localhost:5000/feedback/user/${userId}`)
      .then((res) => setFeedbacks(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchMyFeedbacks();
  }, []);

  // SUBMIT FEEDBACK
  const handleSubmit = () => {
    if (!feedbackContent.trim()) {
      alert("Please enter feedback");
      return;
    }

    axios
      .post("http://localhost:5000/feedback", {
        feedbackContent,   // ✅ matches backend
        userId,            // ✅ required field
      })
      .then(() => {
        setFeedbackContent("");
        fetchMyFeedbacks();
      })
      .catch((err) => {
        console.error(err.response?.data);
        alert("Error posting feedback");
      });
  };

  return (
    <div className={Styles.page}>
      <div className={Styles.card}>
        <h2>Give Feedback</h2>

        <textarea
          placeholder="Write your Feedback here..."
          value={feedbackContent}
          onChange={(e) => setFeedbackContent(e.target.value)}
          className={Styles.textarea}
        />

        <button onClick={handleSubmit} className={Styles.btn}>
          Submit Feedback
        </button>
      </div>

      <div className={Styles.card}>
        <h3>My Previous Feedbacks</h3>

        {feedbacks.length === 0 ? (
          <p className={Styles.noData}>
            You haven’t posted any feedback yet.
          </p>
        ) : (
          feedbacks.map((item) => (
            <div key={item._id} className={Styles.feedbackItem}>
              <p>{item.feedbackContent}</p> {/* ✅ fixed */}
              <span>
                {new Date(item.createdAt).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserFeedback;