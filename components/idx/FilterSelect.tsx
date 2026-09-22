"use client";

import { useEffect, useId, useRef, useState } from "react";

export interface FilterOption {
  value: string;
  label: string;
}

/**
 * The filter menus, drawn by us.
 *
 * A native <select> renders its list with the operating system's own chrome,
 * so the popup ignores the site's type and color no matter how the closed
 * control is styled. This is a button plus a listbox: same keyboard and
 * screen-reader contract, but the open menu matches everything around it.
 */
export default function FilterSelect({
  value,
  options,
  placeholder,
  ariaLabel,
  onChange,
  align = "left",
}: {
  value: string;
  options: FilterOption[];
  /** Shown when nothing is selected */
  placeholder: string;
  ariaLabel: string;
  onChange: (value: string) => void;
  /** Menus near the right edge open right-aligned so they stay on screen */
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listId = useId();

  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    const onDocDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [open]);

  useEffect(() => {
    if (open) setActive(Math.max(0, options.findIndex((o) => o.value === value)));
  }, [open, options, value]);

  const commit = (option: FilterOption) => {
    onChange(option.value);
    setOpen(false);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") return setOpen(false);
    if (!open && (event.key === "Enter" || event.key === " " || event.key === "ArrowDown")) {
      event.preventDefault();
      return setOpen(true);
    }
    if (!open) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(options.length - 1, i + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const option = options[active];
      if (option) commit(option);
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div className={`fsel${open ? " is-open" : ""}`} ref={rootRef}>
      <button
        type="button"
        className={`fsel__button${selected && selected.value ? " has-value" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
      >
        <span>{selected && selected.value ? selected.label : placeholder}</span>
        <span className="fsel__chevron" aria-hidden="true" />
      </button>
      {open && (
        <ul className={`fsel__menu fsel__menu--${align}`} role="listbox" id={listId} aria-label={ariaLabel}>
          {options.map((option, i) => (
            <li key={option.value || "any"}>
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                className={`fsel__option${i === active ? " is-active" : ""}${
                  option.value === value ? " is-selected" : ""
                }`}
                onMouseEnter={() => setActive(i)}
                onClick={() => commit(option)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
