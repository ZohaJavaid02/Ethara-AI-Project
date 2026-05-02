import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", members: [] });
  const isAdmin = user?.role === "Admin";

  const load = async () => {
    try {
      const { data } = await api.get("/projects");
      setProjects(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load projects");
    }
  };
  useEffect(() => {
    load();
    if (isAdmin) api.get("/auth/users").then((r) => setUsers(r.data));
  }, [isAdmin]);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post("/projects", form);
      toast.success("Project created");
      setShow(false); load();
    } catch (err) { toast.error(err.response?.data?.message); }
  };

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold">{isAdmin ? "Projects" : "My Projects"}</h1>
          {isAdmin && (
            <button onClick={() => setShow(true)} className="btn-primary flex gap-2 items-center">
              <Plus size={18} /> New Project
            </button>
          )}
        </div>

        {!isAdmin && (
          <p className="text-sm text-gray-500 mb-4">
            Showing the projects you are a member of.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {projects.map((p) => (
            <Link to={`/projects/${p._id}`} key={p._id} className="card">
              <h3 className="text-xl font-semibold">{p.name}</h3>
              <p className="text-gray-500 text-sm my-2">{p.description}</p>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                {p.status}
              </span>
              <p className="text-xs text-gray-400 mt-2">{p.actualMembers?.length ?? p.members?.length ?? 0} members</p>
            </Link>
          ))}
        </div>

        {show && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <form onSubmit={create} className="card w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Create Project</h2>
              <input className="input mb-3" placeholder="Name"
                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <textarea className="input mb-3" placeholder="Description"
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <select multiple className="input mb-4"
                onChange={(e) => setForm({
                  ...form,
                  members: [...e.target.selectedOptions].map((o) => o.value),
                })}>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                ))}
              </select>
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
      </div>
    </>
  );
}