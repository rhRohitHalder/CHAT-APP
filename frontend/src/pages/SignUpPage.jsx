import React, { useState } from "react";
import { Cat } from "lucide-react";
import { Link } from "react-router-dom";
import useSignUp from "../hooks/useSignUp";
import { useThemeStore } from "../store/useTheme";

const SignUpPage = () => {
  const [signupData, setSignupData] = useState({
    Fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Mutation for signup
  // const queryClient = useQueryClient();

  // const {
  //   mutate: signUp_mutation,
  //   isPending,
  //   error,
  // } = useMutation({
  //   mutationFn: signupUser,
  //   onSuccess: () => {
  //     // Invalidate the auth query to trigger a refetch
  //     queryClient.invalidateQueries({ queryKey: ["authUser"] });
  //     // Redirect to home page after successful signup
  //     // window.location.href = "/";
  //   },
  // });
  const { isPending, error, signUp_mutation } = useSignUp();
  const handleSignUp = (e) => {
    e.preventDefault();

    // Client-side validation
    if (
      !signupData.Fullname ||
      !signupData.email ||
      !signupData.password ||
      !signupData.confirmPassword
    ) {
      alert("Please fill in all fields");
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (signupData.password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    // Only include the fields that the backend expects
    const { confirmPassword: _confirmPassword, ...dataToSend } = signupData;
    signUp_mutation(dataToSend);
  };
  const {theme } = useThemeStore();

  return (
    <div
      className="h-screen flex justify-center items-center p-4 sm:p-6 md:p-8"
      data-theme={theme}
    >
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
        {/* SIGNUP FORM - LEFT SIDE */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          {/* LOGO */}
          <div className="mb-6 flex items-center justify-center gap-2 w-full">
            <Cat className="size-10 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              logoName
            </span>
          </div>
          {/* ERROR MESSAGE */}
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error.response.data.message}</span>
            </div>
          )}
          {/* FORM */}
          <div className="w-full">
            <form onSubmit={handleSignUp}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold mb-6">
                    Create an account
                  </h2>
                  <p className="text-sm opacity-70">
                    Join Streamify and start your language learning adventure!
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* FULL NAME */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Full Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="input input-bordered w-full"
                    value={signupData.Fullname}
                    onChange={(e) =>
                      setSignupData({ ...signupData, Fullname: e.target.value })
                    }
                    required
                  />
                </div>

                {/* EMAIL */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    type="email"
                    placeholder="JohnDoe123@gmail.com"
                    className="input input-bordered w-full"
                    value={signupData.email}
                    onChange={(e) =>
                      setSignupData({ ...signupData, email: e.target.value })
                    }
                    required
                  />
                </div>

                {/* PASSWORD */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Password</span>
                  </label>
                  <input
                    type="password"
                    placeholder="******"
                    className="input input-bordered w-full"
                    value={signupData.password}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        password: e.target.value,
                      })
                    }
                    required
                  />
                  <p className="text-xs opacity-70 mt-1">
                    Password must be at least 6 characters long
                  </p>
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Confirm Password</span>
                  </label>
                  <input
                    type="password"
                    placeholder="******"
                    className="input input-bordered w-full"
                    value={signupData.confirmPassword}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                {/* TERMS & CONDITIONS */}
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      required
                    />
                    <span className="text-xs leading-tight">
                      I agree to the{" "}
                      <span className="text-primary hover:underline">
                        terms of service
                      </span>{" "}
                      and{" "}
                      <span className="text-primary hover:underline">
                        privacy policy
                      </span>
                    </span>
                  </label>
                </div>

                {/* SUBMIT BUTTON */}
                <button type="submit" className="btn btn-primary w-full mt-4">
                  {isPending ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Loading...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
                {/* REDIRECT TO LOGIN */}
                <div className="text-center mt-4">
                  <p className="text-sm">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
        {/* IMAGE - RIGHT SIDE */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-8">
            {/* Illustration */}
            <div className="relative aspect-square max-w-sm mx-auto">
              <img
                src="/i-png.png"
                alt="Language connection illustration"
                className="w-full h-full"
              />
            </div>

            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-semibold">
                Connect with language partners worldwide
              </h2>
              <p className="opacity-70">
                Practice conversations, make friends, and improve your language
                skills together
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
