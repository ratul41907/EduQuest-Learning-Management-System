import React, { useEffect, useState } from "react";
import api from "../api/client";

export default function Notifications() {
  const [data, setData] = useState({ unreadCount: 0, notifications: [] });
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const res = await api.get("/api/notifications");
      setData(res.data);
    } catch (e) {
      setMsg(e?.response?.data?.message || "Failed to load notifications");
    }
  };

  const markRead = async (id) => {
    await api.patch(`/api/notifications/${id}/read`);
    load();
  };

  const markAll = async () => {
    await api.patch(`/api/notifications/read-all`);
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h2>Notifications</h2>
      <p><b>Unread:</b> {data.unreadCount}</p>

      <button onClick={markAll} style={{ marginBottom: 12 }}>
        Mark all as read
      </button>

      {msg && <p style={{ color: "red" }}>{msg}</p>}

      {data.notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {data.notifications.map((n) => (
            <div
              key={n.id}
              style={{
                border: "1px solid #eee",
                padding: 12,
                borderRadius: 8,
                background: n.isRead ? "#fafafa" : "#fff7ed",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <b>{n.title}</b>
                {!n.isRead && (
                  <button onClick={() => markRead(n.id)}>Mark read</button>
                )}
              </div>
              <p style={{ margin: "8px 0" }}>{n.message}</p>
              <small>{new Date(n.createdAt).toLocaleString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
