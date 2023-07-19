import { SearchFormProps } from './types';
import { FC } from 'react'
import styles from './App.module.css';
import InputWithLabel from './InputWithLabel';

const SearchForm: FC<SearchFormProps> = ({
  searchTerm,
  onSearchInput,
  onSearchSubmit
}) => (
  <form onSubmit={onSearchSubmit} className={styles.searchForm}>
    <InputWithLabel 
      id="search"
      value={searchTerm} 
      onInputChange={onSearchInput}
      isFocused={true}
    >
      <strong>Search:</strong>
    </InputWithLabel>

    <button type="submit" disabled={!searchTerm} className={`${styles.button} ${styles.button_large}`}>Submit</button>
  </form>
)

export default SearchForm;