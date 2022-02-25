const express = require('express')
const {
  registerUser,
  authUser,
  allUsers
} = require('../controllers/userController')
const protect = require('../middleware/Authentication/authMidleware')

const router = express.Router()

//below 2 are 2 different methods to route one can chain through the routes, the other is used for specific route method
router
  .route('/')
  .post(registerUser)
  .get(protect, allUsers)
router.post('/login', authUser)

module.exports = router
