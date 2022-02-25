import { Button, IconButton } from '@chakra-ui/button'
import { useDisclosure } from '@chakra-ui/hooks'
import { ViewIcon } from '@chakra-ui/icons'
import { Box } from '@chakra-ui/layout'
import { Spinner } from '@chakra-ui/spinner'
import { Input } from '@chakra-ui/input'
import { FormControl } from '@chakra-ui/form-control'
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast
} from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { ChatState } from '../../context/ChatProvider'
import UserBadgeItem from '../userAvatar/UserBadgeItem'
import UserListItem from '../userAvatar/UserListItem'
import axios from 'axios'
import { socket } from '../SingleChat'

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain, fetchMessages }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [groupChatName, setGroupChatName] = useState()
  const [search, setSearch] = useState('')
  const [searchResult, setSearchResult] = useState([])
  const [loading, setLoading] = useState(false)
  const [renameLoading, setRenameLoading] = useState(false)
  const toast = useToast()
  const { selectedChat, setSelectedChat, user } = ChatState()

  const handleAddUser = async user1 => {
    if (selectedChat.users.find(u => u._id === user1._id)) {
      toast({
        title: 'User Already in group!',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      })
      return
    }

    if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: 'Only admins can add someone!',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      })
      return
    }

    try {
      setLoading(true)
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      }
      const { data } = await axios.put(
        '/chat/addToGroup',
        {
          chatId: selectedChat._id,
          userId: user1._id
        },
        config
      )
      setSelectedChat(data)

      setFetchAgain(!fetchAgain)
      setLoading(false)
    } catch (error) {
      toast({
        title: 'Error Occured!',
        description: error.response.data.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      })
      setLoading(false)
    }
    setGroupChatName('')
  }

  const handleRemove = async user1 => {
    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
      toast({
        title: 'Only admins can remove someone!',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      })
      return
    }
    try {
      setLoading(true)
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      }
      const { data } = await axios.put(
        '/chat/removeFromGroup',
        {
          chatId: selectedChat._id,
          userId: user1._id
        },
        config
      )
      user1._id === user._id ? setSelectedChat() : setSelectedChat(data)
      setFetchAgain(!fetchAgain)
      fetchMessages()
      setLoading(false)
    } catch (error) {
      toast({
        title: 'Error Occured!',
        description: error.response.data.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      })
      setLoading(false)
    }
    setGroupChatName('')
  }

  const handleRename = async () => {
    if (!groupChatName) return

    try {
      setRenameLoading(true)
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      }
      const { data } = await axios.put(
        '/chat/renameGroup',
        {
          chatId: selectedChat._id,
          chatName: groupChatName
        },
        config
      )
      setSelectedChat(data)
      setFetchAgain(!fetchAgain)
      setRenameLoading(false)
    } catch (err) {
      err = JSON.stringify(err)
      toast({
        title: 'Error Occured!',
        description: err,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      })
      setRenameLoading(false)
    }
    setGroupChatName('')
  }

  const handleSearch = async query => {
    setSearch(query)
    if (!query) return
    try {
      setLoading(true)
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      }

      const { data } = await axios.get(`/user?search=${search}`, config)
      setSearchResult(data)
      setLoading(false)
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

  let searchCounter = 0

  return (
    <>
      <IconButton d={{ base: 'flex' }} icon={<ViewIcon />} onClick={onOpen} />

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize='35px' d='flex' justifyContent='center'>
            {selectedChat.chatName}
          </ModalHeader>
          <ModalCloseButton
            onClick={() => {
              setSearchResult([])
            }}
          />
          <ModalBody d='flex' flexDir='column' alignItems='center'>
            <Box w='100%' d='flex' flexWrap='wrap' pb={3}>
              {selectedChat.users.map(u => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  admin={selectedChat.groupAdmin}
                  handleFunction={() => handleRemove(u)}
                />
              ))}
            </Box>
            {selectedChat.groupAdmin._id === user._id ? (
              <>
                <FormControl d='flex'>
                  <Input
                    placeholder='Chat Name'
                    mb={3}
                    defaultValue={groupChatName}
                    onChange={e => setGroupChatName(e.target.value)}
                  />
                  <Button
                    variant='solid'
                    colorScheme='teal'
                    ml={1}
                    isLoading={renameLoading}
                    onClick={handleRename}
                  >
                    Update
                  </Button>
                </FormControl>
                <FormControl>
                  <Input
                    placeholder='Add User to group'
                    mb={1}
                    onChange={e => handleSearch(e.target.value)}
                  />
                </FormControl>
                {loading ? (
                  <Spinner size='lg' />
                ) : (
                  searchResult?.map(user => {
                    searchCounter++
                    if (searchCounter >= 4) return
                    return (
                      <UserListItem
                        key={user._id}
                        user={user}
                        handleFunction={() => handleAddUser(user)}
                      />
                    )
                  })
                )}
              </>
            ) : (
              ''
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='red' onClick={() => handleRemove(user)}>
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default UpdateGroupChatModal
