import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";
import API from "../../api";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminDashboard = () => {
  const [task, setTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    assignedTo: "",
  });
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchTasks();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/auth/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks");
      setTasks(res.data);
      console.log(res);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await API.put(`/tasks/${editTaskId}`, task);
        toast.success("Task updated successfully");
      } else {
        await API.post("/tasks", task);
        toast.success("Task created");
      }

      setTask({ title: "", description: "", dueDate: "", assignedTo: "" });
      setShowModal(false);
      setIsEditing(false);
      setEditTaskId(null);
      fetchTasks();
    } catch (err) {
      toast.error(
        isEditing ? "Failed to update task" : "Failed to create task"
      );
      console.error("Error:", err);
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await API.delete(`/tasks/${taskId}`);
        fetchTasks();
      } catch (err) {
        toast.error("Failed to delete task");
        console.error("Error deleting task:", err);
      }
    }
  };

  const handleEdit = (task) => {
    setTask({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate.split("T")[0], // format date for input
      assignedTo: task.assignedTo,
      status: "Pending"
    });
    setEditTaskId(task._id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/");
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <button className="add-task-btn" onClick={() => setShowModal(true)}>
          Add New Task
        </button>
        <h2>Admin Dashboard</h2>
        <button className="logout-btn" onClick={handleLogout}>
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
            <th>Assigned To</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t, index) => (
            <tr key={t._id}>
              <td>{index + 1}</td>
              <td>{t.title}</td>
              <td>{t.description}</td>
              <td>{new Date(t.dueDate).toLocaleDateString()}</td>
              <td
                className={t.status === "completed" ? "completed" : "pending"}
              >
                {t.status}
              </td>
              <td>
                {users.find((user) => {
                  return user._id === t.assignedTo;
                })?.name || "N/A"}
              </td>
              <td>
                <button className="edit-btn" onClick={() => handleEdit(t)}>
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(t._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{isEditing ? "Edit Task" : "Create New Task"}</h3>
            <form onSubmit={handleSubmit} className="task-form">
              <input
                placeholder="Title"
                value={task.title}
                onChange={(e) => setTask({ ...task, title: e.target.value })}
              />
              <textarea
                placeholder="Description"
                value={task.description}
                onChange={(e) =>
                  setTask({ ...task, description: e.target.value })
                }
              />
              <input
                type="date"
                value={task.dueDate}
                onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
              />
              <select
                value={task.assignedTo}
                onChange={(e) =>
                  setTask({ ...task, assignedTo: e.target.value })
                }
              >
                <option value="">Select User</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>
              <div className="modal-actions">
                <button type="submit" className="submit-btn">
                  {isEditing ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setIsEditing(false);
                    setEditTaskId(null);
                    setTask({
                      title: "",
                      description: "",
                      dueDate: "",
                      assignedTo: "",
                    });
                  }}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AdminDashboard;
