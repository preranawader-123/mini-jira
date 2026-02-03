import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Topbar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const name = user?.name || "User";

  return (
    <header className="h-16 bg-white/80 backdrop-blur border-b border-slate-200 flex items-center justify-between px-6 dark:bg-slate-950/70 dark:border-slate-800">
      <div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </div>
        <div className="text-lg md:text-xl font-semibold tracking-tight">
          Good morning, {name}
        </div>
      </div>

      <button
        onClick={toggleTheme}
        className="text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50
                   dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800"
      >
        {theme === "dark" ? "Light" : "Dark"}
      </button>
    </header>
  );
}
