import { useEffect, useRef, useState } from "react";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const OPTIONS = [
  { key: "light", label: "Light", icon: Sun },
  { key: "dark", label: "Dark", icon: Moon },
  { key: "system", label: "System", icon: Monitor },
];

/**
 * variant: "header" (light chrome, for the public header) or "sidebar"
 * (dark chrome, for dashboard sidebars).
 */
export default function ThemeToggle({ variant = "header" }) {
  const { mode, setMode, resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const ActiveIcon = OPTIONS.find((o) => o.key === mode)?.icon || Monitor;

  useEffect(() => {
    function onClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className={`theme-toggle theme-toggle-${variant}`} ref={wrapRef}>
      <button
        type="button"
        className="theme-toggle-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Theme: ${mode} (currently ${resolvedTheme})`}
        aria-haspopup="menu"
        aria-expanded={open}
        title={`Theme: ${mode}`}
      >
        <ActiveIcon size={16} strokeWidth={2} />
      </button>
      {open && (
        <div className="theme-toggle-menu" role="menu">
          {OPTIONS.map((opt) => (
            <button
              key={opt.key}
              role="menuitem"
              className={"theme-toggle-option" + (mode === opt.key ? " active" : "")}
              onClick={() => {
                setMode(opt.key);
                setOpen(false);
              }}
            >
              <opt.icon size={15} strokeWidth={2} />
              {opt.label}
              {mode === opt.key && <Check size={14} className="theme-toggle-check" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
