/**
 * Componente de busca avançada com autocompletamento
 * 
 * Features:
 * - Input com debounce otimizado
 * - Dropdown de sugestões inteligentes
 * - Navegação por teclado (setas, enter, escape)
 * - Highlight de matches
 * - Histórico de buscas
 */

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Search, X, Clock, Hash, Folder, FileText } from 'lucide-react';
import { useAutocomplete, AutocompleteSuggestion } from '../../hooks/useAutocomplete';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (suggestion: AutocompleteSuggestion) => void;
  placeholder?: string;
  serviceType?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  onSelect,
  placeholder = "Buscar templates...",
  serviceType,
  className = ""
}: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const [keyboardIndex, setKeyboardIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    suggestions,
    loading,
    selectedIndex,
    selectSuggestion,
    clearSuggestions
  } = useAutocomplete(value, { serviceType });

  const showDropdown = focused && (suggestions.length > 0 || loading);

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setKeyboardIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setKeyboardIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (keyboardIndex >= 0 && keyboardIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[keyboardIndex]);
        }
        break;
      
      case 'Escape':
        setFocused(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelectSuggestion = (suggestion: AutocompleteSuggestion) => {
    onChange(suggestion.value);
    onSelect?.(suggestion);
    setFocused(false);
    setKeyboardIndex(-1);
    clearSuggestions();
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'template': return <FileText className="h-4 w-4" />;
      case 'category': return <Folder className="h-4 w-4" />;
      case 'tag': return <Hash className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setFocused(false);
        setKeyboardIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative w-full ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="
            block w-full pl-10 pr-10 py-3 
            border border-gray-300 rounded-lg
            placeholder-gray-500 text-gray-900
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-colors duration-200
          "
        />
        
        {value && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="
            absolute z-50 w-full mt-1 
            bg-white border border-gray-200 rounded-lg shadow-lg
            max-h-64 overflow-y-auto
          "
        >
          {loading && (
            <div className="px-4 py-3 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span>Buscando...</span>
              </div>
            </div>
          )}

          {!loading && suggestions.length === 0 && value.length >= 2 && (
            <div className="px-4 py-3 text-sm text-gray-500">
              Nenhuma sugestão encontrada
            </div>
          )}

          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.type}-${suggestion.value}-${index}`}
              onClick={() => handleSelectSuggestion(suggestion)}
              className={`
                w-full px-4 py-3 text-left hover:bg-gray-50
                flex items-center space-x-3
                ${keyboardIndex === index ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
                ${index === suggestions.length - 1 ? '' : 'border-b border-gray-100'}
              `}
            >
              <div className="text-gray-400">
                {getSuggestionIcon(suggestion.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {suggestion.label}
                </div>
                
                {suggestion.metadata && (
                  <div className="text-xs text-gray-500">
                    {suggestion.type === 'category' && suggestion.metadata.count && 
                      `${suggestion.metadata.count} templates`
                    }
                    {suggestion.type === 'template' && suggestion.metadata.category && 
                      `Categoria: ${suggestion.metadata.category}`
                    }
                  </div>
                )}
              </div>
              
              {suggestion.type === 'query' && (
                <div className="text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;