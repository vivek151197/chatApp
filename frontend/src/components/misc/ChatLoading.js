import { Stack } from '@chakra-ui/layout'
import { Skeleton } from '@chakra-ui/skeleton'
import React from 'react'

const ChatLoading = () => {
  return (
    <div>
      <Stack>
        <Skeleton height='20px' />
        <Skeleton height='20px' />
        <Skeleton height='20px' />
        <Skeleton height='20px' />
        <Skeleton height='20px' />
        <Skeleton height='20px' />
        <Skeleton height='20px' />
        <Skeleton height='20px' />
        <Skeleton height='20px' />
        <Skeleton height='20px' />
        <Skeleton height='20px' />
        <Skeleton height='20px' />
      </Stack>
    </div>
  )
}

export default ChatLoading
