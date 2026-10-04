export function isDark() {
  const isSystemDarkMode = window?.matchMedia?.(
    "(prefers-color-scheme: dark)",
  )?.matches;
  const userMode = localStorage.getItem("discoveryjs:color-scheme");
  return userMode === "auto" ? isSystemDarkMode : userMode === "dark";
}
