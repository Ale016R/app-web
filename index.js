const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");
const { Server } = require("socket.io");

const app = express();
const httpServer = require("http").createServer(app);
const io = new Server(httpServer);

const cors = require("cors");
app.use(cors());
app.use(express.json()); // new line to parse JSON request body

const sequelize = new Sequelize("webDB", "admin", "2016aleg", {
  host: "localhost",
  dialect: "postgres",
});

const MyFriend = sequelize.define(
  "my_friends",
  {
    name: Sequelize.STRING,
    gender: Sequelize.STRING,
  },
  {
    timestamps: false,
  }
);

const FriendChanges = sequelize.define(
  "friend_changes",
  {
    friend_id: Sequelize.INTEGER,
    old_value: Sequelize.STRING,
    new_value: Sequelize.STRING,
    column_name: Sequelize.STRING,
  },
  {
    timestamps: false,
  }
);

sequelize.sync().then(() => {
  console.log("Database and tables synced");
});

MyFriend.addHook("beforeUpdate", async (friend, options) => {
  console.log("beforeUpdate hook activated");
  await FriendChanges.create({
    friend_id: friend.id,
    column_name: "Name",
    old_value: friend._previousDataValues.name,
    new_value: friend.dataValues.name,
  });
  await FriendChanges.create({
    friend_id: friend.id,
    column_name: "Gender",
    old_value: friend._previousDataValues.gender,
    new_value: friend.dataValues.gender,
  });
  io.emit("friendUpdated", friend);
});

io.on("connection", (socket) => {
  console.log("A user connected");
});

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get("/", async (req, res) => {
  try {
    const friends = await MyFriend.findAll();
    res.json(friends);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/changes", async (req, res) => {
  try {
    const changes = await FriendChanges.findAll();
    res.json(changes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/update/:id", async (req, res) => {
  // new endpoint to update a friend
  try {
    const { id } = req.params;
    const { name, gender } = req.body;
    const friendToUpdate = await MyFriend.findOne({ where: { id } });
    friendToUpdate.name = name;
    friendToUpdate.gender = gender;
    await friendToUpdate.save();
    res.json({ message: "Friend updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
