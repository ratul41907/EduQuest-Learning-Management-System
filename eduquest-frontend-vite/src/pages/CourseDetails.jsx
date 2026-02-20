import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";

const CourseDetails = () => {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [error, setError] = useState(null);

  // ✅ Reviews state
  const [reviewsData, setReviewsData] = useState({ reviews: [], averageRating: 0, count: 0 });
  const [reviewError, setReviewError] = useState(null);

  // ✅ Review form
  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState("");
  const [savingReview, setSavingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState("");

  // helper: token exist?
  const hasToken = () => !!localStorage.getItem("authToken");

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setError(null);
        const response = await api.get(`/api/courses/${id}`);
        setCourse(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching course details");
      }
    };

    const fetchReviews = async () => {
      try {
        setReviewError(null);
        const res = await api.get(`/api/reviews/course/${id}`);
        setReviewsData(res.data);
      } catch (err) {
        // if route missing, you'll see "Cannot GET" html or 404
        setReviewError(err.response?.data?.message || "Could not load reviews (check /api/reviews route).");
      }
    };

    fetchCourseData();
    fetchReviews();
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!hasToken()) {
      setReviewMsg("Login required to submit a review.");
      return;
    }

    try {
      setSavingReview(true);
      setReviewMsg("");
      await api.post(`/api/reviews/course/${id}`, {
        rating: Number(myRating),
        comment: myComment || null,
      });

      setReviewMsg("✅ Review saved!");
      // reload reviews after save
      const res = await api.get(`/api/reviews/course/${id}`);
      setReviewsData(res.data);

      setTimeout(() => setReviewMsg(""), 2500);
    } catch (err) {
      setReviewMsg(err.response?.data?.message || "Failed to save review.");
    } finally {
      setSavingReview(false);
    }
  };

  if (error)
    return (
      <div style={{ padding: "20px" }}>
        <p style={{ color: "red" }}>{error}</p>
        <Link to="/courses">Back to Courses</Link>
      </div>
    );

  if (!course) return <p style={{ padding: "20px" }}>Loading course details...</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <Link to="/courses" style={{ color: "#4f46e5", textDecoration: "none" }}>
        ← Back to All Courses
      </Link>

      <div style={{ marginTop: "20px", borderBottom: "1px solid #eee", paddingBottom: "20px" }}>
        <h1 style={{ marginBottom: "10px" }}>{course.title}</h1>
        <p style={{ color: "#4b5563", fontSize: "16px", marginBottom: "20px" }}>
          {course.description}
        </p>

        {/* Progress Display */}
        <div style={{ marginBottom: "20px" }}>
          <span style={{ fontSize: "14px", fontWeight: "bold" }}>
            Your Progress: {course.progress || 0}%
          </span>
          <div
            style={{
              width: "100%",
              height: "10px",
              background: "#e5e7eb",
              borderRadius: "5px",
              marginTop: "5px",
            }}
          >
            <div
              style={{
                width: `${course.progress || 0}%`,
                height: "100%",
                background: "#4f46e5",
                borderRadius: "5px",
                transition: "width 0.5s ease-in-out",
              }}
            ></div>
          </div>
        </div>

        {/* Learn Button */}
        <Link
          to={`/learn/${id}`}
          style={{
            display: "inline-block",
            backgroundColor: "#111827",
            color: "white",
            padding: "12px 24px",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: "bold",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          {course.progress > 0 ? "Continue Learning →" : "Start Learning →"}
        </Link>
      </div>

      {/* Lessons & Quizzes */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "30px",
          marginTop: "30px",
        }}
      >
        <div>
          <h3>Curriculum</h3>
          {course.lessons?.length > 0 ? (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {course.lessons.map((lesson, index) => (
                <li
                  key={lesson.id}
                  style={{
                    padding: "12px",
                    borderBottom: "1px solid #f0f0f0",
                    color: "#374151",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span style={{ marginRight: "10px", color: "#9ca3af" }}>{index + 1}.</span>
                  {lesson.title}
                </li>
              ))}
            </ul>
          ) : (
            <p>No lessons yet.</p>
          )}
        </div>

        <div>
          <h3>Quizzes</h3>
          {course.quizzes?.length > 0 ? (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {course.quizzes.map((quiz) => (
                <li
                  key={quiz.id}
                  style={{
                    padding: "12px",
                    border: "1px solid #f0f0f0",
                    marginBottom: "8px",
                    borderRadius: "6px",
                    backgroundColor: "#f9fafb",
                  }}
                >
                  <Link
                    to={`/quizzes/${quiz.id}`}
                    style={{ textDecoration: "none", color: "#111827", fontWeight: "bold" }}
                  >
                    {quiz.title}
                  </Link>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>
                    Time Limit: {quiz.timeLimit} mins
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No quizzes yet.</p>
          )}
        </div>
      </div>

      {/* ✅ REVIEWS SECTION */}
      <div style={{ marginTop: "35px", paddingTop: "20px", borderTop: "1px solid #eee" }}>
        <h2 style={{ marginBottom: "6px" }}>Reviews</h2>

        {reviewError ? (
          <p style={{ color: "red" }}>{reviewError}</p>
        ) : (
          <div style={{ marginBottom: "14px", color: "#374151" }}>
            <b>Average:</b> {reviewsData.avgRating || 0} ⭐ ({reviewsData.count || 0} reviews)
          </div>
        )}

        {/* Write Review */}
        <div style={{ padding: "14px", border: "1px solid #eee", borderRadius: "8px" }}>
          <h4 style={{ marginTop: 0 }}>Write / Update your review</h4>

          {!hasToken() && (
            <p style={{ color: "#6b7280", marginTop: 0 }}>
              Login required to post a review.
            </p>
          )}

          <form onSubmit={handleSubmitReview}>
            <div style={{ marginBottom: "10px" }}>
              <label style={{ fontSize: "13px", fontWeight: "bold" }}>Rating (1–5)</label>
              <br />
              <select
                value={myRating}
                onChange={(e) => setMyRating(e.target.value)}
                style={{ padding: "8px", width: "120px", marginTop: "6px" }}
              >
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label style={{ fontSize: "13px", fontWeight: "bold" }}>Comment (optional)</label>
              <br />
              <textarea
                value={myComment}
                onChange={(e) => setMyComment(e.target.value)}
                rows={3}
                style={{ width: "100%", padding: "8px", marginTop: "6px" }}
                placeholder="What did you like/dislike?"
              />
            </div>

            <button
              type="submit"
              disabled={savingReview || !hasToken()}
              style={{
                backgroundColor: savingReview ? "#9ca3af" : "#111827",
                color: "white",
                padding: "10px 14px",
                borderRadius: "6px",
                border: "none",
                cursor: savingReview ? "not-allowed" : "pointer",
                fontWeight: "bold",
              }}
            >
              {savingReview ? "Saving..." : "Submit Review"}
            </button>

            {reviewMsg && <p style={{ marginTop: "10px" }}>{reviewMsg}</p>}
          </form>
        </div>

        {/* Review list */}
        <div style={{ marginTop: "18px" }}>
          {reviewsData.reviews?.length > 0 ? (
            reviewsData.reviews.map((r) => (
              <div
                key={r.id}
                style={{
                  padding: "12px",
                  border: "1px solid #f0f0f0",
                  borderRadius: "8px",
                  marginBottom: "10px",
                  background: "#fafafa",
                }}
              >
                <div style={{ fontWeight: "bold" }}>
                  {r.user?.fullName || "Student"} — {r.rating} ⭐
                </div>
                {r.comment && <div style={{ marginTop: "6px" }}>{r.comment}</div>}
                <div style={{ marginTop: "6px", fontSize: "12px", color: "#6b7280" }}>
                  {new Date(r.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: "#6b7280" }}>No reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
