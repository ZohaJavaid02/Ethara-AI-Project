import User from "../models/User.js";
import generateToken from "../utils/generateTokens.js";

export const signup = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields required" });

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "User already exists" });

  const user = await User.create({ name, email, password, role });
  res.status(201).json({
    _id: user._id, name: user.name, email: user.email, role: user.role,
    token: generateToken(user._id, user.role),
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: "Invalid credentials" });

  res.json({
    _id: user._id, name: user.name, email: user.email, role: user.role,
    token: generateToken(user._id, user.role),
  });
};

export const getUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};