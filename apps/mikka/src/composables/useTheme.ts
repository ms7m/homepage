import { ref, watchEffect } from "vue";

type Theme = "light" | "dark";

const theme = ref<Theme>(
  (typeof localStorage !== "undefined" && (localStorage.getItem("theme") as Theme)) ||
  (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light")
);

watchEffect(() => {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme.value === "dark");
  localStorage.setItem("theme", theme.value);
});

export function useTheme() {
  function toggle() {
    theme.value = theme.value === "dark" ? "light" : "dark";
  }
  return { theme, toggle };
}
