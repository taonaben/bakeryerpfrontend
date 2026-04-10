import React from 'react';
import { Search } from 'lucide-react';
import './SearchBar.css';

const SearchBar = ({
    searchTerm,
    onSearchChange,
    placeholder = 'Search...'
}) => (
    <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input
            type="text"
            className="search-input"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search input"
        />
    </div>
);

export default SearchBar;
