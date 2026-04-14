/**
 * Reusable Breadcrumb Component
 * Displays navigational breadcrumbs with optional dropdown menus
 * 
 * Features:
 * - Clickable breadcrumb items for navigation
 * - Dropdown menus on specific breadcrumbs (e.g., list of batches)
 * - Flexible configuration for any navigation hierarchy
 * 
 * Usage:
 * <Breadcrumb
 *   items={[
 *     { label: 'Inventory', href: '/inventory' },
 *     { label: 'Batches', href: '/inventory', dropdownItems: [...] },
 *     { label: '914CBE00', href: '/inventory/batch/914CBE00', isActive: true }
 *   ]}
 * />
 */

import React, { useRef, useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import '../styles/breadcrumb.css';

export interface BreadcrumbDropdownItem {
  label: string;
  value: string;
  href: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
  dropdownItems?: BreadcrumbDropdownItem[];
  onDropdownSelect?: (item: BreadcrumbDropdownItem) => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      dropdownRefs.current.forEach((ref) => {
        if (ref && !ref.contains(event.target as Node)) {
          setOpenDropdown(null);
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDropdownToggle = (index: number) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  const handleDropdownSelect = (
    item: BreadcrumbDropdownItem,
    breadcrumbItem: BreadcrumbItem
  ) => {
    // Call custom handler if provided
    if (breadcrumbItem.onDropdownSelect) {
      breadcrumbItem.onDropdownSelect(item);
    } else {
      // Default: navigate to href
      window.location.href = item.href;
    }
    setOpenDropdown(null);
  };

  return (
    <nav className="breadcrumb-container" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        {items.map((item, index) => (
          <li key={index} className="breadcrumb-item">
            {/* Breadcrumb link */}
            {item.href && !item.isActive ? (
              <a href={item.href} className="breadcrumb-link">
                {item.label}
              </a>
            ) : (
              <span className={`breadcrumb-label ${item.isActive ? 'active' : ''}`}>
                {item.label}
              </span>
            )}

            {/* Dropdown trigger (appears between items) */}
            {item.dropdownItems && item.dropdownItems.length > 0 && index < items.length - 1 && (
              <div
                ref={(el) => {
                  dropdownRefs.current[index] = el;
                }}
                className="breadcrumb-dropdown-wrapper"
              >
                <button
                  className="breadcrumb-dropdown-trigger"
                  onClick={() => handleDropdownToggle(index)}
                  aria-label={`Show ${item.label} list`}
                  aria-expanded={openDropdown === index}
                  title={`Show ${item.label}`}
                >
                  <ChevronDown size={16} />
                </button>

                {/* Dropdown menu */}
                {openDropdown === index && (
                  <div className="breadcrumb-dropdown-menu">
                    <ul className="breadcrumb-dropdown-list">
                      {item.dropdownItems.map((dropdownItem, dropdownIndex) => (
                        <li key={dropdownIndex} className="breadcrumb-dropdown-item">
                          <button
                            className="breadcrumb-dropdown-link"
                            onClick={() => handleDropdownSelect(dropdownItem, item)}
                          >
                            {dropdownItem.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Separator (/) */}
            {index < items.length - 1 && !item.dropdownItems && (
              <span className="breadcrumb-separator">/</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
