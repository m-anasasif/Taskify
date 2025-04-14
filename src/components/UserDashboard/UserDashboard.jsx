import React, { useEffect, useState } from "react";
import "./UserDashboard.css";
import API from "../../api";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";


const UserDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const userId = decoded.id || decoded.userId;

      if (userId) {
        API.get(`/tasks/${userId}`)
          .then((res) => setTasks(res.data))
          .catch((err) => console.error("Error fetching tasks", err));

          API.get(`/auth/users/${userId}`)
        .then((res) => setUserName(res.data.name))        
        .catch((err) => console.error("Error fetching user name", err));
      }
    } catch (err) {
      console.error("Invalid token", err);
    }
  }, []);

  const markCompleted = async (taskId) => {
    await API.patch(`/tasks/${taskId}`, { status: "completed" });
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: "completed" } : t))
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    navigate("/");
  };

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
      <h2 className="greeting">
  Hi, <span className="username-highlight">{userName}</span>
</h2>
        <h2>Your Tasks</h2>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <table className="task-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>Title</th>
            <th>Description</th>
            <th>Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, index) => (
            <tr key={task._id}>
              <td>{index + 1}</td>
              <td>{task.title}</td>
              <td>{task.description}</td>
              <td>{new Date(task.dueDate).toLocaleDateString()}</td>
              <td>
                <span
                  className={`status ${
                    task.status === "completed" ? "completed" : "pending"
                  }`}
                >
                  {task.status}
                </span>
              </td>
              <td>
                {task.status !== "completed" ? (
                  <button
                    className="complete-btn"
                    onClick={() => markCompleted(task._id)}
                  >
                    Mark Completed
                  </button>
                ) : (
                  "✓"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {tasks.length === 0 && <p className="para">No Task Available</p>}
    </div>
  );
};

export default UserDashboard;