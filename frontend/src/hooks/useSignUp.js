import { useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react'
import { signupUser } from '../lib/Api';

const useSignUp = () => {
   const queryClient = useQueryClient();
  
    const {
      mutate: signUp_mutation,
      isPending,
      error,
    } = useMutation({
      mutationFn: signupUser,
      onSuccess: () => {
        // Invalidate the auth query to trigger a refetch
        queryClient.invalidateQueries({ queryKey: ["authUser"] });

      }
    });
    return {isPending , error , signUp_mutation}
}

export default useSignUp