const { application } = require('express')
const express = require('express')
const dotenv = require('dotenv')
const data = require('./data')
const connectDB = require('./config/db')
const userRoutes = require('./routes/userRoutes')
const chatRoutes = require('./routes/chatRoutes')
const messageRoutes = require('./routes/messageRoutes')

const {
  notFound,
  errorHandler
} = require('./middleware/Authentication/errorMiddleware')
const User = require('./models/userModel')
const Message = require('./models/messageModel')
const Chat = require('./models/chatModel')
const { sendMessage, allMessages } = require('./controllers/messageController')
const port = 5000

const app = express() // to use express api methods
dotenv.config() // to read .env file and assign it to process.env
connectDB() // to connect to mongodb

app.use(express.json()) //to get data in the json format

app.get('/', (req, res) => {
  res.send('api is working')
})

app.delete('/deleteMessages', async (req, res) => {
  const messagesDelete = await Message.deleteMany({})
  console.log(messagesDelete)
  res.send('All messages got cleared')
})

app.delete('/deleteChats', async (req, res) => {
  const chatsDelete = await Chat.deleteMany({})
  console.log(chatsDelete)
  res.send('All Chats got cleared')
})

app.delete('/deleteUsers', async (req, res) => {
  const usersDelete = await User.deleteMany({})
  console.log(usersDelete)
  res.send('All users got cleared')
})

app.delete('/messages', async (req, res) => {
  const messagesDelete = await Message.deleteMany({})
  console.log(messagesDelete)
  res.send('All messages got cleared')
})

app.use('/user', userRoutes)
app.use('/chat', chatRoutes)
app.use('/message', messageRoutes)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.port || port
const server = app.listen(
  PORT,
  console.log(`Server listening at http://localhost:${PORT}`)
)

const io = require('socket.io')(server, {
  pingTimeout: 60000,
  cors: {
    origin: `http://localhost:3000`
  }
})

io.on('connection', socket => {
  console.log('connected to socket.io')

  socket.on('setup', userData => {
    socket.join(userData._id)
    socket.emit('connected')
  })

  socket.on('join chat', async (room, chat) => {
    socket.join(room)
    console.log('User joined room ' + room)
    const req = {
      chatId: room
    }
    const messages = await allMessages(req)
    socket.emit('join chat', messages)
  })

  socket.on('new message', async newMessage => {
    let { chatId, users, sender, content } = newMessage

    const req = {
      user: { _id: sender._id },
      body: {
        content: content,
        chatId: chatId
      }
    }

    const message = await sendMessage(req)
    if (!users) return console.log('chat.users not defined')

    users.forEach(user => {
      if (user._id == newMessage.sender._id) return
      socket.in(user._id).emit('message recieved', message)
    })
  })

  socket.off('setup', () => {
    console.log('USER DISCONNECTED')
    socket.leave(userData._id)
  })
})
