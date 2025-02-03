import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User, { IUser } from "../models/user";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const login = async (
  email: string,
  password: string
): Promise<string> => {
  const user: IUser | null = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }
  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: "1h",
  });
  return token;
};

export const register = async (
  email: string,
  password: string
): Promise<IUser> => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ email, password: hashedPassword });
  await newUser.save();
  return newUser;
};
