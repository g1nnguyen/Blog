const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");
const Post = require("./models/Post");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const uploadMiddleware = multer({ dest: "uploads/" });
const fs = require("fs");

const secret = "fqwefwe";

const app = express();

const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync("B4c0//", salt);
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());

app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));
mongoose.connect(
  "mongodb+srv://ntthang1299:CRhevCk6gciO1ibM@cluster0.abecbyu.mongodb.net/?retryWrites=true&w=majority"
);

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (e) {
    res.status(400).json(e);
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.findOne({
      username,
    });
    const passok = bcrypt.compareSync(password, userDoc.password);

    //console.log(passok);
    if (passok) {
      jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
        if (err) {
          throw err;
        }
        console.log(token);
        res.cookie("token", token).json({
          id: userDoc._id,
          username,
        });
      });
      //res.status(200).json("Login successful!");
    } else {
      res.status(400).json("Wrong usename and password!");
    }
  } catch (e) {
    res.status(400).json(e);
  }
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, secret, {}, (err, info) => {
      if (err) throw err;
      res.json(info);
    });
  }

  res.json(req.cookies);
});

app.post("/logout", (req, res) => {
  res.cookies("token", "").json("ok");
});

app.get("/post", async (req, res) => {
  const posts = await Post.find()
    .populate("author", ["username"])
    .sort({ createdAt: -1 })
    .limit(10);
  res.json(posts);
});

app.post("/post", uploadMiddleware.single("file"), async (req, res) => {
  let { originalname, path } = req.file;
  const parts = originalname.split(".");
  const ext = parts[parts.length - 1];
  const newPath = path + "." + ext;
  fs.renameSync(path, newPath);
  const { title, summary, content } = req.body;
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) throw err;
      const postDoc = await Post.create({
        title,
        summary,
        content,
        cover: newPath,
        author: info.id,
      });
      res.json(postDoc);
      //res.json(info);
    });
  }
});

app.get("/post/:id", async (req, res) => {
  const { id } = req.params;
  const postDoc = await Post.findById(id).populate("author", ["username"]);
  res.json(postDoc);
});
app.put("/post", uploadMiddleware.single("file"), async (req, res) => {
  let newPath = null;
  if (req.file) {
    const { originalname, path } = req.file;
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];
    newPath = path + "." + ext;
    fs.renameSync(path, newPath);
  }

  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;
    const { id, title, summary, content } = req.body;
    const postDoc = await Post.findById(id);
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    if (!isAuthor) {
      return res.status(400).json("you are not the author");
    }
    const cover = newPath ? newPath : postDoc.cover;
    const data = {
      title,
      summary,
      content,
      cover,
    };
    //console.log("postDoc: " + postDoc + " id: " + id + " data : " + data);

    try {
      const updateData = await Post.findOneAndUpdate(
        { _id: id },
        data,
        { new: true }
      );
  
      if (updateData) {
        console.log("Update post id: " + id + " success");
        res.json(updateData);
      } else {
        console.error("Không tìm thấy tài liệu hoặc cập nhật thất bại.");
        res.json("fail update");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật tài liệu:", error);
      
    }
    // Cập nhật tài liệu
    //await postDoc.update(updateData);
    //if(updateData)
  });
});
app.use(function (req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});
//mongodb+srv://ntthang1299:CRhevCk6gciO1ibM@cluster0.abecbyu.mongodb.net/?retryWrites=true&w=majority

//CRhevCk6gciO1ibM
//mongodb+srv://ntthang1299:CRhevCk6gciO1ibM@cluster0.abecbyu.mongodb.net/
app.listen(4000);
