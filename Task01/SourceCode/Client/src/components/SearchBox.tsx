import React from 'react';

interface SearchBoxProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSearch: () => void;
  isSearching: boolean;
}

function SearchBox({ inputValue, onInputChange, onSearch, isSearching }: SearchBoxProps) {
  
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !isSearching) {
      onSearch();
    }
  };

  return (
    <div style={styles.wrapper}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Enter city name (e.g., London, Tokyo)"
        style={styles.textInput}
        disabled={isSearching}
      />
      <button
        onClick={onSearch}
        disabled={isSearching || !inputValue.trim()}
        style={{
          ...styles.searchBtn,
          opacity: isSearching || !inputValue.trim() ? 0.6 : 1
        }}
      >
        {isSearching ? 'Checking...' : 'Check Air Quality'}
      </button>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    gap: '12px',
    marginBottom: '32px',
    flexWrap: 'wrap' as const,
    justifyContent: 'center'
  },
  textInput: {
    padding: '14px 20px',
    fontSize: '15px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    width: '320px',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
    transition: 'border-color 0.2s',
    backgroundColor: '#fff'
  },
  searchBtn: {
    padding: '14px 28px',
    fontSize: '15px',
    fontWeight: 500,
    backgroundColor: '#3d5a80',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    transition: 'background-color 0.2s'
  }
};

export default SearchBox;
