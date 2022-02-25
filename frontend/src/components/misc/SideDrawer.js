import { Box, Text } from '@chakra-ui/layout'
import { Button } from '@chakra-ui/button'
import {
  Menu,
  MenuButton,
  MenuList,
  Tooltip,
  Avatar,
  MenuItem,
  MenuDivider,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  useToast
} from '@chakra-ui/react'
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { useDisclosure } from '@chakra-ui/hooks'
import { Input } from '@chakra-ui/input'
import { Spinner } from '@chakra-ui/spinner'
import { useHistory } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import { ChatState } from '../../context/ChatProvider'
import ProfileModal from './ProfileModal'
import axios from 'axios'
import ChatLoading from './ChatLoading'
import NotificationBadge from 'react-notification-badge'
import { Effect } from 'react-notification-badge'
import UserListItem from '../userAvatar/UserListItem'
import { getSender } from '../../config/ChatLogics'

const SideDrawer = () => {
  const [search, setsearch] = useState('')
  const [searchResult, setsearchResult] = useState([])
  const [loading, setloading] = useState(false)
  const [loadingChat, setloadingChat] = useState()
  const toast = useToast()
  const {
    user,
    setSelectedChat,
    chats,
    setChats,
    notification,
    setNotification
  } = ChatState()

  const { isOpen, onOpen, onClose } = useDisclosure()

  const history = useHistory()

  const logoutHandler = () => {
    localStorage.removeItem('userInfo')
    history.push('/')
  }

  const handleEnter = event => {
    if (event.key === 'Enter') handleSearch()
  }

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: 'Please Enter the name to Search',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top-left'
      })
      setloading(false)
      return
    }
    try {
      setloading(true)
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      }

      const { data } = await axios.get(`/user?search=${search}`, config)
      setloading(false)
      setsearchResult(data)
    } catch (error) {
      toast({
        title: 'Error Occured',
        description: 'Failed to load the search Results',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-left'
      })
    }
  }

  const accessChat = async userId => {
    try {
      setloadingChat(true)
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      }
      const { data } = await axios.post('/chat', { userId }, config)
      if (!chats.find(c => c._id === data._id)) setChats([data, ...chats])

      onClose()
      setSelectedChat(data)
      setloadingChat(false)
      setsearch('')
      setsearchResult([])
    } catch (error) {
      toast({
        title: 'Error Occured',
        description: 'Failed to load the search Results',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-left'
      })
    }
  }

  return (
    <>
      <Box
        d='flex'
        justifyContent='space-between'
        alignItems='center'
        bg='white'
        w='100%'
        p='5px 10px 5px 10px'
        borderWidth='5px'
      >
        <Tooltip label='Search Users to Chat' hasArrow placement='bottom-end'>
          <Button variant='ghost' onClick={onOpen}>
            <i className='fas fa-search'></i>
            <Text d={{ base: 'none', md: 'flex' }} px='4'>
              Search User
            </Text>
          </Button>
        </Tooltip>
        <Text fontSize='2xl' fontFamily='Work sans'>
          Geek-Chat
        </Text>
        <div>
          <Menu>
            <MenuButton p={1}>
              <NotificationBadge
                count={notification.length}
                effect={Effect.ROTATE_X}
              />
              <BellIcon fontSize='2xl' m={1} />
            </MenuButton>
            <MenuList pl={2}>
              {!notification.length && 'No New Messages'}
              {notification.map(notif => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat)
                    setNotification(
                      notification.filter(n => n !== notif.sender._id)
                    )
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar
                size='sm'
                cursor='pointer'
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer isOpen={isOpen} placement='left' onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Search Users</DrawerHeader>
          <DrawerBody>
            <Box d='flex' pb={2}>
              <Input
                placeholder='Search by name'
                mr={2}
                value={search}
                onChange={e => {
                  setsearch(e.target.value)
                }}
                onKeyUp={handleEnter}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map(user => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml='auto' d='flex' />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default SideDrawer
