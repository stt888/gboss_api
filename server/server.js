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

// register root router (app's use() function)
// app.use('/', function(req, res){
//     res.send('hello server.')
// })
app.use(cors()); // Add a response header to tell the browser to allow cross domain
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/api", appRouter);

// bind listener
// app.listen('3000', function(){
//     console.log('server start on port: 3000')
// })

// bind listener. start server not app
server.listen("3000", () => {
  console.log("server running at port: 3000");
});
