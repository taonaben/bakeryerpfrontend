import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useDebounce from '../hooks/useDebounce';
import SearchDropdown from './SearchDropdown';
import './SearchBar.css';

const SearchBar = ({
    searchTerm,
    onSearchChange,
    placeholder = 'Search...',
    fetchSuggestions = null,
}) => {
    const navigate = useNavigate();
    const wrapperRef = useRef(null);

    const [inputValue, setInputValue] = useState(searchTerm || '');
    const [isOpen, setIsOpen] = useState(false);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const debouncedValue = useDebounce(inputValue, 350);

    // Sync external searchTerm → inputValue (e.g. if cleared from outside)
    useEffect(() => {
        if (searchTerm !== inputValue) {
            setInputValue(searchTerm || '');
        }
    }, [searchTerm]);

    // Drive the table filter with the debounced value
    useEffect(() => {
        onSearchChange(debouncedValue);
    }, [debouncedValue]);

    // Fetch suggestions whenever debounced value changes
    useEffect(() => {
        if (!fetchSuggestions || debouncedValue.trim().length < 2) {
            setGroups([]);
            setIsOpen(false);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setIsOpen(true);
        setActiveIndex(-1);

        fetchSuggestions(debouncedValue.trim()).then((result) => {
            if (!cancelled) {
                setGroups(result || []);
                setLoading(false);
            }
        }).catch(() => {
            if (!cancelled) {
                setGroups([]);
                setLoading(false);
            }
        });

        return () => { cancelled = true; };
    }, [debouncedValue, fetchSuggestions]);

    // Close on outside click
    useEffect(() => {
        const handleMouseDown = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleMouseDown);
        return () => document.removeEventListener('mousedown', handleMouseDown);
    }, []);

    const flatItems = groups.flatMap((g) => g.results);

    const handleNavigate = useCallback((item) => {
        setIsOpen(false);
        navigate(item.href);
    }, [navigate]);

    const handleKeyDown = (e) => {
        if (!isOpen) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && flatItems[activeIndex]) {
                handleNavigate(flatItems[activeIndex]);
            }
        } else if (e.key === 'Escape' || e.key === 'Tab') {
            setIsOpen(false);
        }
    };

    const handleClear = () => {
        setInputValue('');
        setGroups([]);
        setIsOpen(false);
        onSearchChange('');
    };

    const showDropdown = isOpen && fetchSuggestions && debouncedValue.trim().length >= 2;

    return (
        <div className="search-bar-wrapper" ref={wrapperRef}>
            <div className="search-bar">
                <Search size={16} className="search-icon" aria-hidden="true" />
                <input
                    type="text"
                    className="search-input"
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onFocus={() => {
                        if (groups.length > 0) setIsOpen(true);
                    }}
                    onKeyDown={handleKeyDown}
                    aria-label="Search input"
                    aria-autocomplete="list"
                    aria-expanded={showDropdown}
                    aria-haspopup="listbox"
                    autoComplete="off"
                    spellCheck={false}
                />
                {inputValue && (
                    <button
                        className="search-clear-btn"
                        onClick={handleClear}
                        aria-label="Clear search"
                        tabIndex={-1}
                    >
                        <X size={13} />
                    </button>
                )}
            </div>

            {showDropdown && (
                <SearchDropdown
                    groups={groups}
                    query={debouncedValue}
                    loading={loading}
                    onNavigate={handleNavigate}
                    activeIndex={activeIndex}
                    setActiveIndex={setActiveIndex}
                />
            )}
        </div>
    );
};

export default SearchBar;

