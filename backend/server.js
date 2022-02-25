const { application } = require('express')
const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const userRoutes = require('./routes/userRoutes')
const chatRoutes = require('./routes/chatRoutes')

const {
  notFound,
  errorHandler
} = require('./middleware/Authentication/errorMiddleware')
const path = require('path')
const { sendMessage, allMessages } = require('./controllers/messageController')
const PORT = process.env.PORT || 5000

const app = express() // to use express api methods
dotenv.config() // to read .env file and assign it to process.env
connectDB() // to connect to mongodb

app.use(express.json()) //to get data in the json format and app.use is for req,res,next calling

app.use('/user', userRoutes)
app.use('/chat', chatRoutes)

// ---------- deploy ---------
const _dirname1 = path.resolve()

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(_dirname1, '/frontend/build')))

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(_dirname1, 'frontend', 'build', 'index.html'))
  )
} else {
  app.get('/', (req, res) => {
    res.send('API is running')
  })
}
// ---------- deploy ---------

//error middlewares
app.use(notFound)
app.use(errorHandler)

const server = app.listen(
  PORT,
  console.log(`Server listening at http://localhost:${PORT}`)
)

// messaging with Socket
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
