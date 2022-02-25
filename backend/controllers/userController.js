const generateToken = require('../config/generateToken')
const User = require('../models/userModel')

const registerUser = async (req, res) => {
  const { name, email, password, pic } = req.body

  if (!name || !email || !password) {
    res.status(400)
    throw new Error('Please Enter all the fields')
  }

  const userExists = await User.findOne({ email })

  if (userExists) {
    res.status(400).send('User already exists')
    return
  }

  const user = await User.create({
    name,
    email,
    password,
    pic
  })

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id)
    })
  } else {
    res.status(400).send('Failed to create the user')
  }
}

const authUser = async (req, res, next) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id)
    })
  } else {
    res.status(400).send('failed to signin')
  }
}

// /user?search=vivek similar to /user/:id
const allUsers = async (req, res) => {
  //mongodb regex
  const keyword = req.query.search
    ? { name: { $regex: req.query.search, $options: 'i' } }
    : {}

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } })
  res.send(users)
}

module.exports = { registerUser, authUser, allUsers }
