import { useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react'
import { logoutUser } from '../lib/Api';

const useLogout = () => {
   const queryClient = useQueryClient();
  const { mutate: logoutMutation
   } = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      // Invalidate the auth query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      // Optionally, you can also clear other related queries or perform additional actions here
    }
  });

  return { logoutMutation };
}

export default useLogout