import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { updateProfile } from "../lib/Api";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SaveIcon, UserIcon, CameraIcon, LinkIcon, ArrowLeftIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const { authUserData } = useAuthUser();
  const user = authUserData?.user;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    Fullname: user?.Fullname || "",
    bio: user?.bio || "",
    location: user?.location || "",
    nativeLanguage: user?.nativeLanguage || "",
    learningLanguage: user?.learningLanguage || "",
    profilePic: user?.profilePic || "",
  });

  const [isUploading, setIsUploading] = useState(false);

  const { mutate: updateProfileMutation, isPending } = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(["authUser"], data);
      toast.success("Profile updated successfully!");
    },
    onError: (error) => {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation(formData);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profilePic: reader.result }));
      };
      reader.onerror = () => {
        toast.error("Failed to read image file");
      };
      reader.readAsDataURL(file);
    }
  };

  const generateRandomAvatar = async () => {
    setIsUploading(true);
    try {
      const randomNum = Math.floor(Math.random() * 100);
      const newProfilePic = `https://avatar.iran.liara.run/public/${randomNum}`;
      setFormData((prev) => ({ ...prev, profilePic: newProfilePic }));
      toast.success("New avatar generated!");
    } catch (error) {
      toast.error("Failed to generate avatar");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-2xl pb-20">
        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-ghost btn-sm mb-4 -ml-2"
          >
            <ArrowLeftIcon className="size-4 mr-1" />
            Back
          </button>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Edit Profile
          </h2>
          <p className="opacity-70 mt-1">
            Update your profile information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center sm:items-start sm:flex-row gap-6 mb-6">
            <div className="relative">
              <div className="avatar">
                <div className="w-24 rounded-full">
                  <img 
                    src={formData.profilePic || user?.profilePic || "/default-avatar.png"} 
                    alt={user?.Fullname} 
                  />
                </div>
              </div>
              <label className="absolute bottom-0 right-0 btn btn-circle btn-sm btn-primary">
                <CameraIcon className="size-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </label>
            </div>
            
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold text-lg">{user?.Fullname}</h3>
              <p className="text-sm opacity-70">{user?.email}</p>
              
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={generateRandomAvatar}
                  className="btn btn-outline btn-sm"
                  disabled={isUploading}
                >
                  <LinkIcon className="size-4 mr-1" />
                  Random Avatar
                </button>
              </div>
            </div>
          </div>

          {/* Profile Picture URL */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Profile Picture URL</span>
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 opacity-50" />
              <input
                type="text"
                name="profilePic"
                value={formData.profilePic}
                onChange={handleChange}
                placeholder="Enter image URL or select an option above"
                className="input input-bordered w-full pl-10"
              />
            </div>
          </div>

          {/* Full Name */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Full Name</span>
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 opacity-50" />
              <input
                type="text"
                name="Fullname"
                value={formData.Fullname}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="input input-bordered w-full pl-10"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Bio</span>
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell others about yourself..."
              className="textarea textarea-bordered w-full"
              rows={3}
            />
          </div>

          {/* Location */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Location</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., New York, USA"
              className="input input-bordered w-full"
            />
          </div>

          {/* Languages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Native Language</span>
              </label>
              <input
                type="text"
                name="nativeLanguage"
                value={formData.nativeLanguage}
                onChange={handleChange}
                placeholder="e.g., English"
                className="input input-bordered w-full"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Learning Language</span>
              </label>
              <input
                type="text"
                name="learningLanguage"
                value={formData.learningLanguage}
                onChange={handleChange}
                placeholder="e.g., Spanish"
                className="input input-bordered w-full"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isPending}
            >
              {isPending ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <>
                  <SaveIcon className="size-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;