import React from "react";
import { Loader } from "lucide-react";
import { useThemeStore } from "../store/useTheme";
 
export const PageLoader = () => {
  const { theme } = useThemeStore();
  return (
    <div className="min-h-screen flex justify-center items-center" data-theme={theme}>
      <Loader className="animate-spin size-10 text-primary" />
    </div>
  );
};

export default PageLoader;
