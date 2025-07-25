import User from "../Models/UserModel.js";
import bcrypt from "bcrypt";
import "dotenv/config";
import jwt from "jsonwebtoken";
let UserController = {
  // All users
  async getAllUsers(req, res) {
    try {
      let allUser = await User.find();
      res.status(200).json(allUser);
    } catch (error) {
      res.status(500).json({ message: "internal server error", error });
    }
  },

  // By Id:
  async getUserById(req, res) {
    try {
      let OneUser = await User.findById(req.params.id);
      if (!OneUser) {
        return res.status(404).json({ message: "User Not Found" });
      }
      res.status(200).json(OneUser);
    } catch (error) {
      res.status(500).json({ message: "internal server error", error });
    }
  },

  // login
  async loginUser(req, res) {
    try {
      let { email, password } = req.body;

      let user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password" });
      }

      let Token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      });

      res.status(200).json({ Token, user });
    } catch (error) {
      console.error("Login error:", error.message);
      res.status(500).json({ message: "internal server error", error });
    }
  },

  //signup
  async createUser(req, res) {
    try {
      let user = new User({
        name: req.body.name,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, 10),
        profilePicture: req.body.profilePicture,
        age: req.body.age,
        role: req.body.role,
      });
      let savedUser = await user.save();

      let TokenData = jwt.sign({ id: savedUser.id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      });

      res.status(201).json({ user: savedUser, Token: TokenData });
    } catch (error) {
      res.status(500).json({ message: "internal server error", error });
    }
  },

  // UpdateUser
  async UpdateUser(req, res) {
    try {
      let user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User Not Found" });
      }
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.password =
        (await bcrypt.hash(req.body.password, 10)) || user.password;
      user.profilePicture = req.body.profilePicture || user.profilePicture;
      user.age = req.body.age || user.age;
      user.role = req.body.role || user.role;

      let newUser = await user.save();
      res.status(200).json(newUser);
    } catch (error) {
      res.status(500).json({ message: "internal server error", error });
    }
  },

  // deleteUser
  async deleteUser(req, res) {
    try {
      let user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User Not Found" });
      }
      res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "internal server error", error });
    }
  },
};
export default UserController;
