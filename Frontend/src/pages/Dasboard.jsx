import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { CheckCircle, Clock, AlertTriangle, Folder, ListTodo, Activity } from "lucide-react";

const Stat = ({ icon: Icon, label, value, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`p-3 rounded-full ${color}`}><Icon className="text-white" /></div>
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState({});
  useEffect(() => { api.get("/dashboard").then((r) => setStats(r.data)); }, []);

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Stat icon={Folder} label="Projects" value={stats.projects || 0} color="bg-indigo-500" />
          <Stat icon={ListTodo} label="Total Tasks" value={stats.total || 0} color="bg-purple-500" />
          <Stat icon={Clock} label="Todo" value={stats.todo || 0} color="bg-blue-500" />
          <Stat icon={Activity} label="In Progress" value={stats.inProgress || 0} color="bg-yellow-500" />
          <Stat icon={CheckCircle} label="Completed" value={stats.done || 0} color="bg-green-500" />
          <Stat icon={AlertTriangle} label="Overdue" value={stats.overdue || 0} color="bg-red-500" />
        </div>
      </div>
    </>
  );
}