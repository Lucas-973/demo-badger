import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface ComboboxOption<T extends string = string> {
  value: T;
  label: string;
  /** Leading glyph shown in the list and, for selected options, in the trigger. */
  icon?: React.ReactNode;
  /** Trailing detail, e.g. a count. List only. */
  meta?: React.ReactNode;
}

interface BaseProps<T extends string> {
  /** Accessible name; not rendered visibly. */
  label: string;
  options: ComboboxOption<T>[];
  className?: string;
  /** Max trigger width before the label truncates. */
  maxWidth?: number;
}

interface SingleProps<T extends string> extends BaseProps<T> {
  multiple?: false;
  value: T;
  onChange: (value: T) => void;
}

interface MultiProps<T extends string> extends BaseProps<T> {
  multiple: true;
  /** Selected values. Empty means "all". */
  value: T[];
  onChange: (value: T[]) => void;
  /** Row at the top that clears the selection, e.g. "All statuses". */
  allLabel: string;
  allMeta?: React.ReactNode;
  /** Trigger text when several are selected, e.g. (3) => "3 statuses". */
  summarize?: (count: number) => string;
}

export type ComboboxProps<T extends string> = SingleProps<T> | MultiProps<T>;

interface Row {
  key: string;
  label: string;
  icon?: React.ReactNode;
  meta?: React.ReactNode;
  selected: boolean;
  pick: () => void;
}

/**
 * Select-only combobox (WAI-ARIA APG pattern): focus stays on the trigger and
 * the active option is tracked with aria-activedescendant.
 * Single mode: choosing closes the list. Multiple mode: options toggle and the
 * list stays open; the first row clears the selection.
 * Keys: ↑/↓ Home/End move · Enter/Space choose · Esc close · type to jump.
 */
export function Combobox<T extends string>(props: ComboboxProps<T>) {
  const { label, options, className = '', maxWidth = 200 } = props;
  const multiple = props.multiple === true;

  const baseId = useId();
  const listId = `${baseId}-list`;
  const optionId = (index: number) => `${baseId}-opt-${index}`;

  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ text: '', timer: 0 });
  const [open, setOpen] = useState(false);

  const selectedValues = useMemo<T[]>(
    () => (props.multiple ? props.value : [props.value]),
    [props.multiple, props.value]
  );

  const rows = useMemo<Row[]>(() => {
    if (props.multiple) {
      const { value, onChange } = props;
      const toggle = (option: T) => {
        const next = value.includes(option)
          ? value.filter((v) => v !== option)
          : options.map((o) => o.value).filter((v) => v === option || value.includes(v));
        onChange(next);
      };
      return [
        {
          key: '__all__',
          label: props.allLabel,
          meta: props.allMeta,
          selected: value.length === 0,
          pick: () => onChange([]),
        },
        ...options.map((option) => ({
          key: option.value,
          label: option.label,
          icon: option.icon,
          meta: option.meta,
          selected: value.includes(option.value),
          pick: () => toggle(option.value),
        })),
      ];
    }
    const { value, onChange } = props;
    return options.map((option) => ({
      key: option.value,
      label: option.label,
      icon: option.icon,
      meta: option.meta,
      selected: option.value === value,
      pick: () => {
        if (option.value !== value) onChange(option.value);
        setOpen(false);
      },
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.multiple, props.value, props.onChange, options]);

  const firstSelected = Math.max(0, rows.findIndex((row) => row.selected));
  const [activeIndex, setActiveIndex] = useState(firstSelected);
  const hasIcons = options.some((option) => option.icon);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handlePointer);
    return () => document.removeEventListener('mousedown', handlePointer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`#${CSS.escape(optionId(activeIndex))}`);
    el?.scrollIntoView({ block: 'nearest' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeIndex]);

  useEffect(() => () => window.clearTimeout(typeahead.current.timer), []);

  const openList = (index = firstSelected) => {
    setActiveIndex(index);
    setOpen(true);
  };

  const jumpTo = (char: string) => {
    const state = typeahead.current;
    window.clearTimeout(state.timer);
    state.text += char.toLowerCase();
    state.timer = window.setTimeout(() => {
      state.text = '';
    }, 500);
    const start = open ? activeIndex + (state.text.length === 1 ? 1 : 0) : firstSelected;
    for (let step = 0; step < rows.length; step += 1) {
      const index = (start + step) % rows.length;
      if (rows[index].label.toLowerCase().startsWith(state.text)) {
        openList(index);
        return;
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const last = rows.length - 1;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!open) openList();
        else setActiveIndex((index) => Math.min(last, index + 1));
        return;
      case 'ArrowUp':
        event.preventDefault();
        if (!open) openList();
        else setActiveIndex((index) => Math.max(0, index - 1));
        return;
      case 'Home':
        if (!open) return;
        event.preventDefault();
        setActiveIndex(0);
        return;
      case 'End':
        if (!open) return;
        event.preventDefault();
        setActiveIndex(last);
        return;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (open) rows[activeIndex]?.pick();
        else openList();
        return;
      case 'Escape':
        if (!open) return;
        event.preventDefault();
        setOpen(false);
        return;
      case 'Tab':
        setOpen(false);
        return;
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          jumpTo(event.key);
        }
    }
  };

  // Trigger content
  const chosen = options.filter((option) => selectedValues.includes(option.value));
  let triggerIcons: React.ReactNode[] = [];
  let triggerText: string;
  if (multiple && chosen.length === 0) {
    triggerText = (props as MultiProps<T>).allLabel;
  } else if (chosen.length === 1) {
    triggerIcons = chosen[0].icon ? [chosen[0].icon] : [];
    triggerText = chosen[0].label;
  } else {
    triggerIcons = chosen.slice(0, 3).flatMap((option) => (option.icon ? [option.icon] : []));
    const summarize = (props as MultiProps<T>).summarize;
    triggerText = summarize ? summarize(chosen.length) : `${chosen.length} selected`;
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? optionId(activeIndex) : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={handleKeyDown}
        style={{ maxWidth }}
        className={`flex w-full items-center gap-2 rounded border bg-white py-1.5 pl-2.5 pr-2 text-left text-xs text-slate-700 transition-colors focus:outline-none focus-visible:border-[#005FB8] ${
          open ? 'border-[#005FB8]' : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        {triggerIcons.length > 0 && (
          <span className="flex shrink-0 items-center gap-1">
            {triggerIcons.map((icon, index) => (
              <span key={index} className="flex items-center">
                {icon}
              </span>
            ))}
          </span>
        )}
        <span className="min-w-0 flex-1 truncate">{triggerText}</span>
        <ChevronDown
          aria-hidden="true"
          className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={label}
          aria-multiselectable={multiple || undefined}
          className="rooms-pop absolute left-0 top-full z-50 mt-1 max-h-80 min-w-full overflow-auto rounded-lg border border-slate-200 bg-white p-1 text-xs shadow-elevated"
        >
          {rows.map((row, index) => {
            const isActive = index === activeIndex;
            const isAllRow = multiple && index === 0;
            return (
              <React.Fragment key={row.key}>
                <li
                  id={optionId(index)}
                  role="option"
                  aria-selected={row.selected}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => row.pick()}
                  className={`flex cursor-pointer select-none items-center gap-2 whitespace-nowrap rounded-md px-2 py-1.5 ${
                    isActive ? 'bg-slate-100' : ''
                  } ${row.selected ? 'font-semibold text-slate-900' : 'text-slate-700'}`}
                >
                  {multiple && (
                    <span
                      aria-hidden="true"
                      className={`grid h-3.5 w-3.5 shrink-0 place-items-center rounded-[3px] border transition-colors ${
                        row.selected
                          ? 'border-[#005FB8] bg-[#005FB8] text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {row.selected && <Check className="h-2.5 w-2.5" strokeWidth={3.5} />}
                    </span>
                  )}
                  {hasIcons && <span className="flex w-7 shrink-0 items-center">{row.icon}</span>}
                  <span className="flex-1">{row.label}</span>
                  {row.meta != null && (
                    <span className="pl-3 text-[11px] font-normal tabular-nums text-slate-400">
                      {row.meta}
                    </span>
                  )}
                  {!multiple && (
                    <Check
                      aria-hidden="true"
                      className={`h-3.5 w-3.5 shrink-0 ${row.selected ? 'text-slate-900' : 'invisible'}`}
                    />
                  )}
                </li>
                {isAllRow && <li role="presentation" className="mx-2 my-1 h-px bg-slate-100" />}
              </React.Fragment>
            );
          })}
        </ul>
      )}
    </div>
  );
}
