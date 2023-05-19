const express = require("express");
const { Sequelize } = require("sequelize");
const { Server } = require("socket.io");

const app = express();
const httpServer = require("http").createServer(app);
const io = new Server(httpServer);

const cors = require("cors");
app.use(cors());

// Configura la conexión a la base de datos
const sequelize = new Sequelize("webDB", "admin", "2016aleg", {
  host: "localhost",
  dialect: "postgres",
});

// Define el modelo de la tabla "my_friends" utilizando Sequelize
const MyFriend = sequelize.define(
  "my_friends",
  {
    name: Sequelize.STRING,
    gender: Sequelize.STRING,
  },
  {
    timestamps: false, // Desactivar las columnas createdAt y updatedAt
  }
);

// Sincroniza el modelo con la base de datos
sequelize.sync().then(() => {
  console.log("Database and tables synced");
});

// Configura la escucha de eventos en la base de datos
MyFriend.addHook("afterCreate", (friend) => {
  io.emit("friendCreated", friend);
});

// Configura el servidor Socket.io para escuchar eventos desde Angular
io.on("connection", (socket) => {
  console.log("A user connected");
});

// Inicia el servidor HTTP y el servidor Socket.io
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
