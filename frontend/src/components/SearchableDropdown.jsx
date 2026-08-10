import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Avatar } from './Avatar';
import { CoverImage } from './CoverImage';
import { DEFAULT_BOOK_COVER } from '../utils/bookCover';

/**
 * Reusable searchable dropdown component.
 *
 * Props:
 *   - items: array of option objects
 *   - searchFields: array of keys to search within each item (e.g. ['name','email','libraryId'])
 *   - labelKey: key whose value is shown as the primary label
 *   - valueKey: key whose value is used as the option's value/id
 *   - selectedId: currently selected value (for highlight)
 *   - onSelect: (item) => void  — called when an option is chosen
 *   - onClear: () => void       — called when the × clear button is pressed
 *   - placeholder: input placeholder text
 *   - containerClass: extra class for the outer wrapper (for click-outside detection)
 *   - renderItem: (item, isSelected) => ReactNode  — custom rendering of each dropdown row
 *   - inputValue / onInputChange: controlled input (optional)
 *   - showDropdown / onToggleDropdown: controlled visibility (optional)
 *   - maxResults: number (default 8)
 */
export const SearchableDropdown = ({
  items = [],
  searchFields = [],
  labelKey = 'name',
  valueKey = '_id',
  selectedId = '',
  onSelect,
  onClear,
  placeholder = 'Search...',
  containerClass = '',
  renderItem,
  inputValue: controlledInput,
  onInputChange,
  showDropdown: controlledShow,
  onToggleDropdown,
  maxResults = 8,
}) => {
  const [internalInput, setInternalInput] = useState('');
  const [internalShow, setInternalShow] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef(null);
  const listRef = useRef(null);
  const containerRef = useRef(null);

  const isControlled = controlledInput !== undefined;
  const inputValue = isControlled ? controlledInput : internalInput;
  const showDropdown = controlledShow !== undefined ? controlledShow : internalShow;

  // Helper to get nested field value via dot-notation (e.g. "userId.name")
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  };

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!inputValue.trim()) return items.slice(0, maxResults);
    const query = inputValue.toLowerCase();
    return items.filter((item) =>
      searchFields.some((field) => {
        const val = getNestedValue(item, field);
        return val != null && String(val).toLowerCase().includes(query);
      })
    ).slice(0, maxResults);
  }, [items, inputValue, searchFields, maxResults]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (isControlled) {
      onInputChange?.(val);
    } else {
      setInternalInput(val);
    }
    if (controlledShow === undefined) setInternalShow(true);
    onToggleDropdown?.(true);
    setHighlightedIndex(-1);
  };

  const handleInputFocus = () => {
    if (controlledShow === undefined) setInternalShow(true);
    onToggleDropdown?.(true);
  };

  const handleSelect = (item) => {
    onSelect?.(item);
    if (controlledShow === undefined) {
      setInternalShow(false);
      setInternalInput('');
    } else {
      onToggleDropdown?.(false);
    }
    setHighlightedIndex(-1);
  };

  const handleClear = () => {
    onClear?.();
    if (controlledShow === undefined) {
      setInternalInput('');
      setInternalShow(false);
    } else {
      onToggleDropdown?.(false);
    }
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!showDropdown) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (controlledShow === undefined) setInternalShow(true);
        onToggleDropdown?.(true);
        setHighlightedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredItems.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredItems.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredItems.length) {
          handleSelect(filteredItems[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        if (controlledShow === undefined) {
          setInternalShow(false);
          setInternalInput('');
        } else {
          onToggleDropdown?.(false);
        }
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Click outside to close
  useEffect(() => {
    if (!showDropdown) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        if (controlledShow === undefined) {
          setInternalShow(false);
          setInternalInput('');
        } else {
          onToggleDropdown?.(false);
        }
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown, controlledShow, onToggleDropdown]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const el = listRef.current.children[highlightedIndex];
      if (el) {
        el.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const hasValue = inputValue.trim().length > 0;

  return (
    <div ref={containerRef} className={`relative ${containerClass}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full input-amo pr-8"
        />
        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-lg leading-none"
            aria-label="Clear selection"
          >
            ×
          </button>
        )}
      </div>

      {showDropdown && filteredItems.length > 0 && (
        <div
          ref={listRef}
          className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredItems.map((item, idx) => {
            const isSelected = item[valueKey] === selectedId;
            const isHighlighted = idx === highlightedIndex;
            const defaultRender = (
              <div className="flex items-start gap-3">
                <Avatar
                  name={item.name || item.title || ''}
                  src={item.profileImage || item.avatar}
                  size={2}
                  className="flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200">{item.name || item.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {item.email} • {item.libraryId}
                  </p>
                </div>
              </div>
            );

            return (
              <div
                key={item[valueKey] || idx}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={`px-4 py-3 cursor-pointer border-b border-slate-700/50 last:border-b-0 transition-colors ${
                  isSelected
                    ? 'bg-indigo-500/20 border-l-2 border-indigo-400'
                    : isHighlighted
                    ? 'bg-slate-700/50'
                    : 'hover:bg-slate-700'
                }`}
              >
                {renderItem ? renderItem(item, isSelected) : defaultRender}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
