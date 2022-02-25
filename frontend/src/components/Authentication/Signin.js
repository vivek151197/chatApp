import { Button } from '@chakra-ui/button'
import { FormControl, FormLabel } from '@chakra-ui/form-control'
import { Input, InputGroup, InputRightElement } from '@chakra-ui/input'
import { VStack } from '@chakra-ui/layout'
import { toast, useToast } from '@chakra-ui/react'
import axios from 'axios'
import React, { useState } from 'react'
import { useHistory } from 'react-router'

const Signin = () => {
  const [email, setemail] = useState()
  const [password, setpassword] = useState()
  const [show, setshow] = useState(false)
  const [loading, setloading] = useState(false)
  const history = useHistory()
  const toast = useToast()
  const showHidePassword = () => {
    setshow(!show)
  }

  const signinHandler = async () => {
    setloading(true)
    if (!email || !password) {
      toast({
        title: 'Please fill all the fields',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      })
      setloading(false)
      return
    }

    try {
      const config = {
        headers: {
          'Content-type': 'application/json'
        }
      }
      const { data } = await axios.post(
        '/user/login',
        { email, password },
        config
      )
      toast({
        title: 'Login Successful',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      })
      localStorage.setItem('userInfo', JSON.stringify(data))
      setloading(false)
      history.push('/chats')
      window.location.reload()
    } catch (error) {
      toast({
        title: 'Error Occured!',
        description: "User doesn't exists. Please signup",
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      })
      setloading(false)
    }
  }

  return (
    <VStack spacing='5px'>
      <FormControl id='email' isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          placeholder='Enter your Email'
          value={email || ''}
          type='email'
          onChange={e => {
            setemail(e.target.value)
          }}
        />
      </FormControl>

      <FormControl id='password' isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? 'text' : 'password'}
            placeholder='Enter Password'
            value={password || ''}
            onChange={e => {
              setpassword(e.target.value)
            }}
          />
          <InputRightElement width='4.5em'>
            <Button height='1.5rem' size='sm' onClick={showHidePassword}>
              {show ? 'Hide' : 'Show'}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <Button
        colorScheme='green'
        width='100%'
        style={{ marginTop: 15 }}
        onClick={signinHandler}
        isLoading={loading}
      >
        SignIn
      </Button>

      <Button
        colorScheme='red'
        width='100%'
        style={{ marginTop: 15 }}
        onClick={() => {
          setemail('guest@example.com')
          setpassword('guest@12345')
        }}
      >
        Get Guest User Credentials
      </Button>
    </VStack>
  )
}

export default Signin
