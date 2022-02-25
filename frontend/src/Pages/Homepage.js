import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text
} from '@chakra-ui/react'
import { useEffect } from 'react'
import { useHistory } from 'react-router'
import Signin from '../components/Authentication/Signin'
import Signup from '../components/Authentication/Signup'

function Homepage () {
  const history = useHistory()

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userInfo'))
    if (user) history.push('/chats')
  }, [history])

  return (
    <Container maxW='xl' centerContent>
      <Box
        d='flex'
        justifyContent='center'
        bg='white'
        w='100%'
        m=' 20px 0 15px 0'
        borderRadius='lg'
        borderWidth='1px'
      >
        <Text fontSize='3xl' fontFamily='Work sans'>
          Geek-Chat
        </Text>
      </Box>
      <Box bg='white' w='100%' p={4} borderRadius='lg' borderWidth='1px'>
        <Tabs isFitted variant='soft-rounded' colorScheme='green'>
          <TabList>
            <Tab>Sign In</Tab>
            <Tab>Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Signin />
            </TabPanel>
            <TabPanel>
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  )
}

export default Homepage
