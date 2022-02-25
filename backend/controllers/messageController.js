const Chat = require('../models/chatModel')
const Message = require('../models/messageModel')
const User = require('../models/userModel')

const allMessages = async req => {
  try {
    const messages = await Message.find({ chat: req.chatId })
      .populate('sender', 'name, email, pic')
      .populate('chat')
    return messages
  } catch (error) {
    throw new Error(error.message)
  }
}

const sendMessage = async req => {
  const { chatId, content } = req.body

  if (!content || !chatId) {
    console.log('Invalid data passed into request')
  }

  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId
  }

  try {
    let message = await Message.create(newMessage)
    message = await message.populate('sender', 'name, pic')
    message = await message.populate('chat')
    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message })
    message = await User.populate(message, {
      path: 'chat.users',
      select: 'name pic email'
    })
    message = await Message.populate(message, {
      path: 'chat.latestMessage',
      select: 'content'
    })
    return message
  } catch (error) {
    throw new Error(error.message)
  }
}

module.exports = { allMessages, sendMessage }
