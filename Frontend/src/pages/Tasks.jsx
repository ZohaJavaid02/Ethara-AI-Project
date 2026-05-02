import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("All");

  const load = async () => {
    const { data } = await api.get("/tasks");
    setTasks(data);
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/tasks/${id}`, { status });
      toast.success("Updated");
      load();
    } catch (err) { toast.error(err.response?.data?.message); }
  };

  const now = new Date();
  const filtered = tasks.filter((t) => {
    if (filter === "All") return true;
    if (filter === "Overdue")
      return t.dueDate && new Date(t.dueDate) < now && t.status !== "Done";
    return t.status === filter;
  });

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">My Tasks</h1>

        <div className="flex gap-2 mb-6 flex-wrap">
          {["All", "Todo", "In Progress", "Done", "Overdue"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg ${
                filter === f ? "bg-indigo-500 text-white" : "bg-white border"
              }`}>
              {f}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto card p-0">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              <tr>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Project</th>
                <th className="p-3 text-left">Assigned To</th>
                <th className="p-3 text-left">Priority</th>
                <th className="p-3 text-left">Due</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const overdue = t.dueDate && new Date(t.dueDate) < now && t.status !== "Done";
                return (
                  <tr key={t._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{t.title}</td>
                    <td className="p-3">{t.project?.name}</td>
                    <td className="p-3">{t.assignedTo?.name || "Unassigned"}</td>
                    <td className="p-3">{t.priority}</td>
                    <td className={`p-3 ${overdue ? "text-red-600 font-semibold" : ""}`}>
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="p-3">
                      <select value={t.status}
                        onChange={(e) => updateStatus(t._id, e.target.value)}
                        className="border rounded px-2 py-1">
                        <option>Todo</option>
                        <option>In Progress</option>
                        <option>Done</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan="6" className="p-6 text-center text-gray-400">No tasks</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}