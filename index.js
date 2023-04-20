const express= require("express");
const dotenv= require("dotenv");
const cors= require("cors");
const mongoose= require("mongoose");
const { chats } = require("./data/data");
const UserRouter = require("./Router/Userrouter");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const chatRoutes = require("./Router/chatRoutes");
const messageRoutes = require("./Router/messageRoutes");

const app=express()
dotenv.config();
app.use(express.json());
app.use(cors())
app.get('/',(req,res)=>{
    res.send("api is running frontend: https://638f10e9e06b1f00aefc2551--funny-kulfi-94dba5.netlify.app/")
    
})
app.use("/api/user",UserRouter)
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);


app.get("/api/chat/:id",async(req,res)=>{
    
    let singlechat= chats.find((c)=>
        c._id === req.params.id);
    res.send(singlechat); 

})
app.use(notFound)
app.use(errorHandler) 
const PORT= process.env.PORT||5000;
const mongo=process.env.MONGO_URL






mongoose.connect(mongo).then(()=>{
    console.log("db connected")
}).catch((error)=>{
    console.log(error.codeName)
})
const server =   app.listen( PORT,console.log("server is up ",PORT))

// socket io
const io= require('socket.io')(server,{
    pingTimeout:60000,
    cors:{
        origin:"https://638f10e9e06b1f00aefc2551--funny-kulfi-94dba5.netlify.app/"
    },
});
io.on("connection",(socket)=>{
    console.log("connected to socket")
    socket.on('setup',(userData)=>{
        socket.join(userData.userExist._id)
        console.log(userData.userExist._id)
        socket.emit("connected")

    })
socket.on('join chat',(room)=>{
    socket.join(room)
    console.log("USer Joined Room:"+ room)
});

socket.on('typing',(room)=>socket.in(room).emit("typing"));
socket.on('stop typing',(room)=>socket.in(room).emit("stop typing"));



socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
      
    });
  });
});
