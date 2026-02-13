import { loginUser } from '../lib/Api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const useLogin = () => {
const queryClient = useQueryClient();
  const {
    mutate: login_mutation,
    isPending,
    error,
  } = useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      // Invalidate the auth query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },

  });
  return {isPending , error , login_mutation}
}

export default useLogin