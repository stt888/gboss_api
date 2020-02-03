// start server
// import express, parsers, appRouter
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const appRouter = require("./appRouter");
const ChatModel = require("./models").getModel("chat");

// execute express() and obtain object
const app = express();


// Add a response header to tell the browser to allow cross domain
// app.use(cors());
app.use(cors({
    origin: process.env.CORS_ALLOW_ORIGIN||"http://localhost:3000",
    methods: 'GET,PUT,POST,DELETE,OPTIONS',
    optionsSuccessStatus: 200 ,
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept,Authorization',
    credentials: true
})); 

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/", appRouter);

// get server object
const server = require("http").Server(app);
// get IO object
const io = require("socket.io")(server);

// all the sockets
const sockets = {};

// connection listener (call back function when there's one client connect it)
io.on("connection", function(socket) {
  console.log("soketio connected");

  // get userid which inside the url connected
  const userid = socket.handshake.query.userid;
  if (!userid) {
    return;
  }
  //if socket is exist
  const savedSocked = sockets[userid];
  if (savedSocked) {
    delete sockets[userid];
    savedSocked.disconnect();
  }
  // save new socket
  sockets[userid] = socket;

  // bind sendMsg listener, receive message from client
  socket.on("sendMsg", function({ from, to, content }) {
    console.log("server received msg from browser", { from, to, content });
    // save to database
    const chat_id = [from, to].sort().join("_");
    const create_time = Date.now();
    const chatModel = new ChatModel({
      chat_id,
      from,
      to,
      create_time,
      content
    });
    chatModel.save(function(err, chatMsg) {
      // send msg to client
      sockets[from] && sockets[from].emit("receiveMsg", chatMsg);
      sockets[to] && sockets[to].emit("receiveMsg", chatMsg);
      console.log("server send msg to 2 clients", from, to, chatMsg);
    });
  });
});


app.get('/', function(req, res){
    res.send("hello server.");
});


// bind listener. start server not app
server.listen(process.env.PORT || 3000, () => {
  console.log(`server running at port: ${process.env.PORT}`);
});
