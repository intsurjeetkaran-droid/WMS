/**
 * SearchBar Component
 */

import { useState, useCallback } from 'react';
import { MdSearch, MdClose } from 'react-icons/md';
import { debounce } from '../../utils/helpers';

const SearchBar = ({ placeholder = 'Search...', onSearch, className = '' }) => {
  const [value, setValue] = useState('');

  const debouncedSearch = useCallback(debounce(onSearch, 400), [onSearch]);

  const handleChange = (e) => {
    setValue(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <div className={`relative ${className}`}>
      <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="input pl-9 pr-8"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <MdClose size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
