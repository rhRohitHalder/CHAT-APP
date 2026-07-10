import { useMutation, useQueryClient } from "@tanstack/react-query";
import { googleLogin } from "../lib/Api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const useGoogleLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: googleLogin,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      if (data.user?.isOnboarded) {
        navigate("/");
      } else {
        navigate("/onboarding");
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Google login failed");
    },
  });
};

export default useGoogleLogin;