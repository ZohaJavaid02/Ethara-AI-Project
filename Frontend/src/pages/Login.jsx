import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      nav("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={submit} className="card w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          Login
        </h2>
        <input className="input mb-3" type="email" placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="input mb-4" type="password" placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button className="btn-primary w-full">Login</button>
        <p className="text-center mt-4 text-sm">
          No account? <Link to="/signup" className="text-indigo-600">Sign up</Link>
        </p>
      </form>
    </div>
  );
}