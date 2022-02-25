const Chat = require('../models/chatModel')
const User = require('../models/userModel')

const accessChat = async (req, res) => {
  const { userId } = req.body

  if (!userId) {
    console.log('UserId params not sent with request')
    return res.sendStatus(400)
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } }
    ]
  })
    .populate('users', '-password')
    .populate('latestMessage')

  isChat = await User.populate(isChat, {
    path: 'latestMessage.sender',
    select: 'name pic email'
  })

  if (isChat.length > 0) {
    res.send(isChat[0])
  } else {
    let chatData = {
      chatName: 'sender',
      isGroupChat: false,
      users: [req.user._id, userId]
    }
    try {
      const createChat = await Chat.create(chatData)

      const fullChat = await Chat.findOne({ _id: createChat._id }).populate(
        'users',
        '-password'
      )
      res.status(200).send(fullChat)
    } catch (error) {
      res.status(400).send(error.message)
    }
  }
}

const fetchChat = async (req, res) => {
  try {
    let isChat = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } }
    })
      .populate('users', '-password')
      .populate('latestMessage')
      .populate('groupAdmin', '-password')
      .sort({ updatedAt: -1 })

    isChat = await User.populate(isChat, {
      path: 'latestMessage.sender',
      select: 'name pic, email'
    })

    res.status(200).send(isChat)
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: 'Please Fill all the feilds' })
  }

  const users = JSON.parse(req.body.users)

  if (users.length < 2) {
    return res.status(200).send('Please add atleast 2 people to form a group')
  }

  try {
    chatData = {
      chatName: req.body.name,
      isGroupChat: true,
      users: [req.user, ...users],
      groupAdmin: req.user
    }
    const groupChat = await Chat.create(chatData)
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
    res.status(200).json(fullGroupChat)
  } catch (error) {
    res.status(401)
    res.json({
      error: {
        message: 'Add atleast 2 people to create group'
      }
    })
    return
  }
}

const renameGroup = async (req, res) => {
  try {
    const renamedGroup = await Chat.findOneAndUpdate(
      { _id: req.body.chatId },
      { chatName: req.body.chatName },
      { new: true }
    )
      .populate('users', '-password')
      .populate('groupAdmin', '-password')

    if (!renamedGroup) {
      res.status(404)
      throw new Error("Group doesn't exist")
    } else res.status(200).json(renamedGroup)
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const removeFromGroup = async (req, res) => {
  try {
    const updatedGroup = await Chat.findOneAndUpdate(
      { _id: req.body.chatId },
      { $pull: { users: req.body.userId } },
      { new: true }
    )
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
    if (!updatedGroup) {
      res.status(404)
      throw new Error("Group doesn't exist")
    } else res.status(200).json(updatedGroup)
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const addToGroup = async (req, res) => {
  try {
    const updatedGroup = await Chat.findOneAndUpdate(
      { _id: req.body.chatId },
      { $push: { users: req.body.userId } },
      { new: true }
    )
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
    if (!updatedGroup) {
      res.status(404)
      throw new Error("Group doesn't exist")
    } else res.status(200).json(updatedGroup)
  } catch (error) {
    res.status(400).send(error.message)
  }
}

module.exports = {
  accessChat,
  fetchChat,
  createGroupChat,
  renameGroup,
  removeFromGroup,
  addToGroup
}
