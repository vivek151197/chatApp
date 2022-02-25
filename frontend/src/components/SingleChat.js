import { IconButton } from '@chakra-ui/button'
import { FormControl } from '@chakra-ui/form-control'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { Input } from '@chakra-ui/input'
import { Box, Text } from '@chakra-ui/layout'
import { useToast } from '@chakra-ui/react'
import { Spinner } from '@chakra-ui/spinner'
import React, { useEffect, useState } from 'react'
import { getSender, getSenderFull } from '../config/ChatLogics'
import { ChatState } from '../context/ChatProvider'
import ProfileModal from './misc/ProfileModal'
import UpdateGroupChatModal from './misc/UpdateGroupChatModal'
import ScrollableChat from './ScrollableChat'
import { io } from 'socket.io-client'
import './styles.css'

const ENDPOINT = `https://chat-geek.herokuapp.com/`
let socket, selectedChatCompare
export { socket }
const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [newMessage, setNewMessage] = useState()
  const [socketConnected, setSocketConnected] = useState(false)
  const toast = useToast()
  const {
    user,
    chats,
    selectedChat,
    setSelectedChat,
    notification,
    setNotification
  } = ChatState()

  const sendMessage = event => {
    if (event.key === 'Enter' && newMessage) {
      try {
        let data = {
          content: newMessage,
          chatId: selectedChat._id,
          users: selectedChat.users,
          sender: user
        }

        socket.emit('new message', data)
        setMessages([...messages, data])
        setNewMessage('')
      } catch (error) {
        toast({
          title: 'Error Occured!',
          description: 'Failed to send the message',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'bottom'
        })
      }
    }
  }

  const fetchMessages = async () => {
    if (!selectedChat) return
    try {
      setLoading(true)
      socket.emit('join chat', selectedChat._id, selectedChat)
      socket.on('join chat', getmessages => {
        setMessages(getmessages)
      })

      setLoading(false)
    } catch (error) {
      toast({
        title: 'Error Occured!',
        description: 'Failed to fetch messages',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      })
    }
  }

  useEffect(() => {
    socket = io.connect(ENDPOINT)
    socket.emit('setup', user)
    socket.on('connected', id => {
      setSocketConnected(true)
    })
  }, [])

  useEffect(() => {
    fetchMessages()
    selectedChatCompare = selectedChat
  }, [selectedChat])

  useEffect(() => {
    console.log('hi')
    socket.on('message recieved', newMessageRecieved => {
      if (
        !selectedChatCompare || // if chat is not selected or doesn't match current chat
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          notification.push(newMessageRecieved)
          setNotification([...notification])
          setFetchAgain(!fetchAgain)
        }
      } else {
        setMessages(messages => [...messages, newMessageRecieved])
      }
    })
  }, [])

  const typingHandler = e => {
    setNewMessage(e.target.value)
  }

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: '28px', md: '30px' }}
            pb={3}
            px={2}
            w='100%'
            fontFamily='Sans serif'
            d='flex'
            justifyContent={{ base: 'space-between' }}
            alignItems='center'
          >
            <IconButton
              d={{ base: 'flex', md: 'none' }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat('')}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Text>
          <Box
            d='flex'
            flexDir='column'
            justifyContent='flex-end'
            p={3}
            bg='#E8E8E8'
            w='100%'
            h='100%'
            borderRadius='lg'
            overflowY='hidden'
          >
            {loading ? (
              <Spinner
                size='xl'
                w={20}
                h={20}
                alignSelf='center'
                margin='auto'
              />
            ) : (
              <div className='messages'>
                <ScrollableChat messages={messages} />
              </div>
            )}
            <FormControl onKeyDown={sendMessage}>
              <Input
                variant='filled'
                bg='E0E0E0E0'
                placeholder='Enter a message...'
                onChange={typingHandler}
                value={newMessage || ''}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box d='flex' alignItems='center' justifyContent='center' h='100%'>
          <Text fontSize='3xl' pb={3} fontFamily='Sans serif'>
            Click on an user to start chatting
          </Text>
        </Box>
      )}
    </>
  )
}

export default SingleChat
