const express = require('express')
const {
  accessChat,
  fetchChat,
  createGroupChat,
  renameGroup,
  removeFromGroup,
  addToGroup
} = require('../controllers/chatController')
const protect = require('../middleware/Authentication/authMidleware')

const router = express.Router()

router.route('/').post(protect, accessChat)
router.route('/').get(protect, fetchChat)
router.route('/group').post(protect, createGroupChat)
router.route('/renameGroup').put(protect, renameGroup)
router.route('/removeFromGroup').put(protect, removeFromGroup)
router.route('/addToGroup').put(protect, addToGroup)

module.exports = router
