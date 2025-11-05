import { useEffect } from "react";
import { useSettings } from "./useSettings";

export const useDarkMode = () => {
  const { settings, updateSettings } = useSettings();

  useEffect(() => {
    if (settings?.dark_mode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings?.dark_mode]);

  const toggleDarkMode = () => {
    if (settings) {
      updateSettings({ dark_mode: !settings.dark_mode });
    }
  };

  return {
    isDark: settings?.dark_mode ?? false,
    toggleDarkMode
  };
};
