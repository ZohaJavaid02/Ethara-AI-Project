import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Member" });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await signup(form);
      toast.success("Account created!");
      nav("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={submit} className="card w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          Sign Up
        </h2>
        <input className="input mb-3" placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="input mb-3" type="email" placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="input mb-3" type="password" placeholder="Password (min 6)"
          onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <select className="input mb-4" value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option>Member</option>
          <option>Admin</option>
        </select>
        <button className="btn-primary w-full">Create Account</button>
        <p className="text-center mt-4 text-sm">
          Have an account? <Link to="/login" className="text-indigo-600">Login</Link>
        </p>
      </form>
    </div>
  );
}