import { useEffect } from "react";
import { useSettings } from "./useSettings";

export const useDarkMode = () => {
  const { settings } = useSettings();

  useEffect(() => {
    if (settings?.dark_mode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings?.dark_mode]);
};
