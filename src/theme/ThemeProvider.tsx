import { App as AntdApp, ConfigProvider, theme as antdTheme } from "antd";
import zhCN from "antd/locale/zh_CN";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ThemeContext,
  type ResolvedTheme,
  type ThemeMode,
} from "./ThemeContext";
const storageKey = "theme-mode";

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(
    () => (localStorage.getItem(storageKey) as ThemeMode) || "system",
  );
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setSystemTheme(mediaQuery.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const resolvedTheme = mode === "system" ? systemTheme : mode;

  useEffect(() => {
    localStorage.setItem(storageKey, mode);
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [mode, resolvedTheme]);

  const cycleTheme = useCallback(() => {
    setMode((current) =>
      current === "light" ? "dark" : current === "dark" ? "system" : "light",
    );
  }, []);

  const value = useMemo(
    () => ({ mode, resolvedTheme, cycleTheme }),
    [mode, resolvedTheme, cycleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider
        locale={zhCN}
        theme={{
          algorithm:
            resolvedTheme === "dark"
              ? antdTheme.darkAlgorithm
              : antdTheme.defaultAlgorithm,
          components: {
            Layout:
              resolvedTheme === "dark"
                ? {
                    bodyBg: "#141414",
                    headerBg: "#141414",
                    siderBg: "#141414",
                    triggerBg: "#141414",
                    headerColor: "#fff",
                    triggerColor: "rgba(255, 255, 255, 0.85)",
                  }
                : {
                    bodyBg: "#fff",
                    headerBg: "#fff",
                    siderBg: "#fff",
                    triggerBg: "#fff",
                    headerColor: "#000",
                    triggerColor: "rgba(0, 0, 0, 0.88)",
                  },
          },
        }}
      >
        <AntdApp>{children}</AntdApp>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}
