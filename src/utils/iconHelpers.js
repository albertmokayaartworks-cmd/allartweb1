// Location: src/utils/iconHelpers.js

import React from 'react';
import * as FiIcons from 'react-icons/fi';

/**
 * Render a Feather icon by name string
 * @param {string} iconName - The name of the icon (e.g., 'FiHome', 'FiShoppingCart')
 * @param {number} size - Icon size (default: 18)
 * @param {string} className - Additional CSS classes
 * @returns {React.ReactElement}
 */
export const renderIcon = (iconName, size = 18, className = '') => {
  const IconComponent = FiIcons[iconName];
  if (!IconComponent) {
    console.warn(`Icon "${iconName}" not found in react-icons/fi`);
    return null;
  }
  return <IconComponent size={size} className={className} />;
};

/**
 * Get icon component by name
 * @param {string} iconName - The name of the icon
 * @returns {React.ComponentType}
 */
export const getIconComponent = (iconName) => {
  return FiIcons[iconName] || null;
};
