import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";

export default function ProjectDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [memberIds, setMemberIds] = useState([]);
  const [show, setShow] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", assignedTo: "", priority: "Medium", dueDate: "",
  });

  const load = async () => {
    const { data } = await api.get(`/projects/${id}`);
    setProject(data);
    setMemberIds(data.actualMembers?.map((member) => member._id) || []);
    const { data: t } = await api.get(`/tasks?project=${id}`);
    setTasks(t);
  };

  const loadUsers = async () => {
    try {
      if (user?.role !== "Admin") return;
      const { data } = await api.get("/auth/users");
      setUsers(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load users");
    }
  };

  useEffect(() => {
    load();
    loadUsers();
  }, [id, user?.role]);

  useEffect(() => {
    const refresh = () => load();
    const interval = setInterval(refresh, 10000);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [id]);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post("/tasks", { ...form, project: id });
      toast.success("Task created");
      setShow(false);
      setForm({ title: "", description: "", assignedTo: "", priority: "Medium", dueDate: "" });
      load();
    } catch (err) { toast.error(err.response?.data?.message); }
  };

  const updateStatus = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      toast.success("Status updated");
      load();
    } catch (err) { toast.error(err.response?.data?.message); }
  };

  const updateAssignee = async (taskId, assignedTo) => {
    try {
      await api.put(`/tasks/${taskId}`, { assignedTo });
      toast.success("Assignee updated");
      load();
    } catch (err) { toast.error(err.response?.data?.message); }
  };

  const remove = async (taskId) => {
    if (!confirm("Delete this task?")) return;
    await api.delete(`/tasks/${taskId}`);
    toast.success("Task deleted");
    load();
  };

  const saveMembers = async () => {
    try {
      await api.put(`/projects/${id}`, { members: memberIds });
      toast.success("Project members updated");
      setShowMembers(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update members");
    }
  };

  if (!project) return <><Navbar /><p className="p-6">Loading...</p></>;

  const projectMembers = project.actualMembers || project.members || [];
  const assignableUsers = users.length > 0 ? users : projectMembers;

  const grouped = {
    Todo: tasks.filter((t) => t.status === "Todo"),
    "In Progress": tasks.filter((t) => t.status === "In Progress"),
    Done: tasks.filter((t) => t.status === "Done"),
  };

  const colors = {
    Todo: "bg-blue-100 border-blue-400",
    "In Progress": "bg-yellow-100 border-yellow-400",
    Done: "bg-green-100 border-green-400",
  };

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-7xl mx-auto">
        <div className="card mb-6">
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-gray-600 mt-1">{project.description}</p>
          <div className="flex gap-2 mt-3 flex-wrap">
            {projectMembers.map((m) => (
              <span key={m._id} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                {m.name}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-bold">Tasks</h2>
          {user.role === "Admin" && (
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setShowMembers(true)} className="btn-primary flex gap-2 items-center">
                Manage Members
              </button>
              <button onClick={() => setShow(true)} className="btn-primary flex gap-2 items-center">
                <Plus size={18} /> Add Task
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Object.entries(grouped).map(([status, items]) => (
            <div key={status} className={`rounded-xl p-4 border-t-4 ${colors[status]}`}>
              <h3 className="font-bold mb-3">{status} ({items.length})</h3>
              <div className="space-y-3">
                {items.map((t) => (
                  <div key={t._id} className="bg-white rounded-lg p-3 shadow">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold">{t.title}</h4>
                      {user.role === "Admin" && (
                        <button onClick={() => remove(t._id)} className="text-red-500">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{t.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        👤 {t.assignedTo?.name || "Unassigned"}
                      </span>
                      <span className={`px-2 py-1 rounded ${
                        t.priority === "High" ? "bg-red-100 text-red-600" :
                        t.priority === "Medium" ? "bg-yellow-100 text-yellow-700" :
                        "bg-green-100 text-green-700"
                      }`}>{t.priority}</span>
                      {t.dueDate && (
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                          📅 {new Date(t.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 grid gap-2">
                      <select
                        value={t.status}
                        onChange={(e) => updateStatus(t._id, e.target.value)}
                        className="w-full text-sm border rounded px-2 py-1"
                      >
                        <option>Todo</option>
                        <option>In Progress</option>
                        <option>Done</option>
                      </select>
                      {user.role === "Admin" && (
                        <select
                          value={t.assignedTo?._id || ""}
                          onChange={(e) => updateAssignee(t._id, e.target.value)}
                          className="w-full text-sm border rounded px-2 py-1"
                        >
                          <option value="">Unassigned</option>
                          {assignableUsers.map((member) => (
                            <option key={member._id} value={member._id}>
                              {member.name} ({member.role})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {show && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <form onSubmit={create} className="card w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Create Task</h2>
              <input className="input mb-3" placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <textarea className="input mb-3" placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <select className="input mb-3" value={form.assignedTo}
                onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} required>
                <option value="">Assign to...</option>
                {assignableUsers.map((m) => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
              <select className="input mb-3" value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
              <input type="date" className="input mb-4" value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              <div className="flex gap-2">
                <button className="btn-primary flex-1">Create</button>
                <button type="button" onClick={() => setShow(false)}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {showMembers && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="card w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Manage Members</h2>

              <div className="space-y-2 max-h-64 overflow-y-auto mb-6">
                {projectMembers
                  .filter((m) => m._id !== user._id && memberIds.includes(m._id))
                  .map((member) => (
                    <div
                      key={member._id}
                      className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                    >
                      <span className="font-medium">{member.name}</span>
                      <button
                        type="button"
                        onClick={() => setMemberIds(memberIds.filter((id) => id !== member._id))}
                        className="text-red-500 hover:text-red-700 hover:bg-red-100 p-2 rounded transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                {projectMembers.filter((m) => m._id !== user._id && memberIds.includes(m._id)).length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No members to remove</p>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowMembers(false)} className="border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="button" onClick={saveMembers} className="btn-primary px-6 py-2">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
