import { 
  useState, 
  useEffect, 
  useReducer,
  useCallback,
  ChangeEvent,
  FormEvent
} from 'react'
import styles from './App.module.css';
import axios from 'axios';
import List from './List';
import SearchForm from './SearchForm';
import { Story } from './types';
import storiesReducer from './reducer';
import LastSearches from './LastSearches';

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

const useStorageState = (
  key: string, 
  initialState: string
): [string, (newValue: string) => void] => {
  const [value, setValue] = useState(
    localStorage.getItem(key) ?? initialState
  );

  // update local storage when value changes
  useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
}

const getLastSearches = (urls: string[]) => 
  urls
    .reduce((result, url, index) => {
      const searchTerm: any = url.replace(API_ENDPOINT, '');

      if (index === 0) {
        return result.concat(searchTerm);
      }

      const previousSearchTerm = result[result.length - 1];

      if (searchTerm === previousSearchTerm) {
        return result;
      } else {
        return result.concat(searchTerm);
      }
    }, [])
    .slice(-6)
    .slice(0, -1);

const getUrl = (searchTerm: string) => `${API_ENDPOINT}${searchTerm}`;

const App = () => {
  const [stories, dispatchStories] = useReducer(
    storiesReducer, 
    { data: [], isLoading: false, isError: false }
  );

  const [searchTerm, setSearchTerm] = useStorageState('search', 'react');
  const [urls, setUrls] = useState([getUrl(searchTerm)]);

  // memorized function
  const handleFetchStories = useCallback(async () => {
    if (!searchTerm) return;

    dispatchStories({ type: 'STORIES_FETCH_INIT' });
    
    try {
      const lastUrl = urls[urls.length - 1];
      const result = await axios.get(lastUrl);

      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS', 
        payload: result.data.hits
      });
    } catch (err) {
      dispatchStories({ type: 'STORIES_FETCH_FAILURE' })
    }
  }, [urls]);

  useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  // update the search term field
  const handleSearchInput = (e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);

  // remove story
  const handleRemoveStory = (item: Story) => {
    dispatchStories({
      type: 'REMOVE_STORY', 
      payload: item
    });
  }

  const handleSearch = (searchTerm: string) => {
    const url = getUrl(searchTerm);
    setUrls(urls.concat(url));
  }

  // handle search submit
  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    handleSearch(searchTerm);
  
    e.preventDefault();
  }

  const handleLastSearch = (searchTerm: string) => {
    handleSearch(searchTerm);
    setSearchTerm(searchTerm);
  }

  const lastSearches = getLastSearches(urls);

  return (
    <div className={styles.container}>
      <h1 className={styles.headlinePrimary}>My Hacker Stories</h1>

      <SearchForm
        searchTerm={searchTerm}
        onSearchSubmit={handleSearchSubmit}
        onSearchInput={handleSearchInput}
      />

      <LastSearches 
        lastSearches={lastSearches}
        onLastSearch={handleLastSearch}
      />

      <hr />

      {stories.isError && <p>Something went wrong...</p>}

      {stories.isLoading ? (
        <p>Loading...</p>
      ) : (
        <List list={stories.data} onRemoveItem={handleRemoveStory} />
      )}
    </div>
  );
};

export default App;
