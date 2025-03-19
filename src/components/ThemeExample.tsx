"use client";

import React from 'react';
import { useTheme } from '../lib/hooks/useTheme';

/**
 * Composant d'exemple pour la gestion des thèmes
 */
export const ThemeExample: React.FC = () => {
  const { theme, setTheme, isDark, toggleTheme } = useTheme();

  return (
    <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Gestion des Thèmes
      </h2>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setTheme('light')}
            className={`px-4 py-2 rounded ${
              theme === 'light'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Clair
          </button>
          
          <button
            onClick={() => setTheme('dark')}
            className={`px-4 py-2 rounded ${
              theme === 'dark'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Sombre
          </button>
          
          <button
            onClick={() => setTheme('system')}
            className={`px-4 py-2 rounded ${
              theme === 'system'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Système
          </button>
        </div>

        <button
          onClick={toggleTheme}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Basculer le thème
        </button>

        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded">
          <p className="text-gray-900 dark:text-white">
            Thème actuel : {theme}
          </p>
          <p className="text-gray-900 dark:text-white">
            Mode sombre : {isDark ? 'Oui' : 'Non'}
          </p>
        </div>
      </div>
    </div>
  );
}; 