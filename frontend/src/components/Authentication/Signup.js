import { Button } from '@chakra-ui/button'
import {
  FormControl,
  FormErrorMessage,
  FormLabel
} from '@chakra-ui/form-control'
import { Input, InputGroup, InputRightElement } from '@chakra-ui/input'
import { VStack } from '@chakra-ui/layout'
import React, { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import axios from 'axios'
import { useHistory } from 'react-router-dom'

const Signup = () => {
  const toast = useToast()
  const [name, setname] = useState()
  const [email, setemail] = useState()
  const [password, setpassword] = useState()
  const [confirmPassword, setconfirmPassword] = useState()
  const [show, setshow] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pic, setpic] = useState()
  const [loading, setloading] = useState()
  const history = useHistory()

  const showHidePassword = () => {
    setshow(!show)
  }

  const showHideConfirmPassword = () => {
    setShowConfirm(!showConfirm)
  }

  const postDetails = pic => {
    setloading(true)
    if (pic === undefined) {
      toast({
        title: 'Please Select an Image',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      })
      return
    }
    if (
      pic.type === 'image/jpeg' ||
      pic.type === 'image/png' ||
      pic.type === 'image/jpg'
    ) {
      const data = new FormData()
      data.append('file', pic)
      data.append('upload_preset', 'chat_App')
      data.append('cloud_name', 'vivekgeekskool')
      fetch('https://api.cloudinary.com/v1_1/vivekgeekskool/image/upload', {
        method: 'post',
        body: data
      })
        .then(res => res.json())
        .then(data => {
          setpic(data.url.toString())
          console.log(data.url.toString())
          setloading(false)
        })
        .catch(err => {
          console.log(err)
          setloading(false)
        })
    } else {
      toast({
        title: 'Please Select Image in jpg/jpeg/png format!',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      })
      setloading(false)
      return
    }
  }

  const signupHandler = async () => {
    setloading(true)

    if (!name || !email || !password || !confirmPassword) {
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

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      })
      setloading(false)
      return
    }

    if (!pattern.test(email)) {
      toast({
        title: 'Enter valid Email',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      })
      setloading(false)
      return
    }

    if (!passwordPattern.test(password)) {
      toast({
        title:
          'Password must contain minimum eight characters, at least 1 letter, 1 number and 1 special character.',
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
        '/user',
        { name, email, password, pic },
        config
      )
      localStorage.setItem('userInfo', JSON.stringify(data))
      toast({
        title: 'Registration Successful',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      })
      setloading(false)
      history.push('/chats')
      window.location.reload()
    } catch (error) {
      toast({
        title: 'Error Occured',
        description: 'User already exists. Please signIn',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      })
    }
  }

  let passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
  let pattern = /\S+@\S+\.\S+/
  const emailError = email && !pattern.test(email)
  const passwordError = password && !passwordPattern.test(password)
  return (
    <VStack spacing='5px'>
      <FormControl id='first-name' isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          placeholder='Enter your Name'
          onChange={e => {
            setname(e.target.value)
          }}
        />
      </FormControl>

      <FormControl id='email' isRequired isInvalid={emailError}>
        <FormLabel>Email</FormLabel>
        <Input
          placeholder='Enter your Email'
          type='email'
          onChange={e => {
            setemail(e.target.value)
          }}
        />
        {!emailError ? (
          ''
        ) : (
          <FormErrorMessage>Enter valid email</FormErrorMessage>
        )}
      </FormControl>

      <FormControl id='password' isRequired isInvalid={passwordError}>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? 'text' : 'password'}
            placeholder='Enter Password'
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
        {!passwordError ? (
          ''
        ) : (
          <FormErrorMessage>
            Password must contain minimum eight characters, at least 1 letter, 1
            number and 1 special character.
          </FormErrorMessage>
        )}
      </FormControl>

      <FormControl id='confirmPassword' isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup>
          <Input
            type={showConfirm ? 'text' : 'password'}
            placeholder='Enter Password'
            onChange={e => {
              setconfirmPassword(e.target.value)
            }}
          />
          <InputRightElement width='4.5em'>
            <Button height='1.5rem' size='sm' onClick={showHideConfirmPassword}>
              {showConfirm ? 'Hide' : 'Show'}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl id='picture'>
        <FormLabel>Upload your Picture</FormLabel>
        <Input
          type='file'
          p='1.5'
          accept='image/*'
          onChange={e => {
            postDetails(e.target.files[0])
          }}
        />
      </FormControl>

      <Button
        colorScheme='green'
        width='100%'
        style={{ marginTop: 15 }}
        onClick={signupHandler}
        isLoading={loading}
      >
        SignUp
      </Button>
    </VStack>
  )
}

export default Signup
