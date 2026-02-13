import { useQuery } from '@tanstack/react-query';
import React from 'react'
import { getAuthUser } from '../lib/Api';

const useAuthUser = () => {
    const authUser = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false,
  })
  return {isLoading: authUser.isLoading,
    isError: authUser.isError,
    authUserData: authUser.data }
}

export default useAuthUser