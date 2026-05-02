/**
 * SearchFilter - Search input + filter dropdowns bar
 */

import { FiSearch, FiFilter } from 'react-icons/fi';

const SearchFilter = ({ search, onSearch, filters = [], placeholder = 'Search...' }) => {
  return (
    <div style={{
      display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center',
      marginBottom: '20px',
    }}>
      {/* Search */}
      <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '360px' }}>
        <FiSearch size={15} style={{
          position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-muted)',
        }} />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          className="input"
          style={{ paddingLeft: '36px', height: '38px' }}
        />
      </div>

      {/* Filters */}
      {filters.map((filter) => (
        <select
          key={filter.key}
          value={filter.value}
          onChange={(e) => filter.onChange(e.target.value)}
          className="input"
          style={{ width: 'auto', minWidth: '140px', height: '38px' }}
        >
          <option value="">{filter.placeholder || `All ${filter.label}`}</option>
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ))}
    </div>
  );
};

export default SearchFilter;
