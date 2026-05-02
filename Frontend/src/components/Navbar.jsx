import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <nav className="bg-white shadow-md px-6 py-3 flex justify-between items-center">
      <Link to="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
        ProjectFlow
      </Link>
      <div className="flex items-center gap-4">
        <Link to="/projects" className="hover:text-indigo-600">Projects</Link>
        <Link to="/tasks" className="hover:text-indigo-600">Tasks</Link>
        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
          {user?.name} ({user?.role})
        </span>
        <button onClick={() => { logout(); nav("/login"); }} className="text-red-500 hover:text-red-700">
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
}