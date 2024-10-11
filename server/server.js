const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/inter", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});
const User = mongoose.model("user", userSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Middleware to check if the user is logged in
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  } else {
    res.redirect("/");
  }
}

// Serve login and signup forms
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views/home.ejs"));

// Handle signup form submission
app.post("/submit", async (req, res) => {
  const { name, email, password } = req.body;
  const user = new User({ name, email, password });
  await user.save();
  res.redirect("/home.html");
});
// Handle login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (user) {
    req.session.userId = user._id;
    res.redirect("/home.html");
  } else {
    res.redirect("/home.html");
  }
});

// Serve home page after login
app.get("/home", isAuthenticated, async (req, res) => {
  const users = await User.find();
  res.render("home", { users });
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
