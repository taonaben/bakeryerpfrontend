import React from 'react';
import { Layers, Activity, Database } from 'lucide-react';
import './SearchDropdown.css';

const GROUP_ICONS = {
  batches: Layers,
  movements: Activity,
  balances: Database,
};

/**
 * Wraps the matched substring in <mark> for bold highlighting.
 * query is the raw search term; text is the label to highlight.
 */
function highlightMatch(text, query) {
  if (!text || !query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function badgeClass(badge) {
  if (!badge) return '';
  return `search-result-badge search-result-badge--${badge.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
}

const SearchDropdown = ({
  groups,
  query,
  loading,
  onNavigate,
  activeIndex,
  setActiveIndex,
}) => {
  // Build a flat list so activeIndex maps across all groups
  const flatItems = groups.flatMap((g) => g.results);
  const hasResults = flatItems.length > 0;

  let flatIdx = 0;

  return (
    <div className="search-dropdown" role="listbox" aria-label="Search results">
      <div className="search-dropdown-body">
        {loading && (
          <div className="search-loading">
            <span className="search-spinner" aria-hidden="true" />
            Searching…
          </div>
        )}

        {!loading && !hasResults && (
          <div className="search-empty">No results for &ldquo;{query}&rdquo;</div>
        )}

        {!loading &&
          hasResults &&
          groups.map((group) => {
            if (group.results.length === 0) return null;
            const Icon = GROUP_ICONS[group.key] || Database;

            return (
              <div className="search-group" key={group.key}>
                <div className="search-group-header">
                  <Icon size={11} className="search-group-icon" aria-hidden="true" />
                  {group.label}
                </div>

                {group.results.map((item) => {
                  const itemIdx = flatIdx++;
                  const isActive = itemIdx === activeIndex;

                  return (
                    <div
                      key={item.id}
                      role="option"
                      aria-selected={isActive}
                      className={`search-result-row${isActive ? ' search-result-row--active' : ''}`}
                      onMouseEnter={() => setActiveIndex(itemIdx)}
                      onClick={() => onNavigate(item)}
                    >
                      <div className="search-result-info">
                        <div className="search-result-label">
                          {highlightMatch(item.label, query)}
                        </div>
                        {item.sublabel && (
                          <div className="search-result-sublabel">{item.sublabel}</div>
                        )}
                      </div>
                      {item.badge && (
                        <span className={badgeClass(item.badge)}>{item.badge}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
      </div>

      {/* Keyboard hint footer */}
      <div className="search-dropdown-footer" aria-hidden="true">
        <span className="search-hint">
          <kbd className="search-kbd">↑↓</kbd> navigate
        </span>
        <span className="search-hint">
          <kbd className="search-kbd">↵</kbd> open
        </span>
        <span className="search-hint">
          <kbd className="search-kbd">esc</kbd> dismiss
        </span>
      </div>
    </div>
  );
};

export default SearchDropdown;
