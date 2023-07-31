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

const API_BASE = 'https://hn.algolia.com/api/v1';
const API_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';

const getUrl = (searchTerm: string, page: number) => `${API_BASE}${API_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}`;

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
    .reduce((result: string[], url, index) => {
      const searchTerm = url
                          .substring(url.lastIndexOf('?') + 1, url.lastIndexOf('&'))
                          .replace(PARAM_SEARCH, '');

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

const App = () => {
  const [stories, dispatchStories] = useReducer(
    storiesReducer, 
    { data: [], page: 0, isLoading: false, isError: false }
  );

  const [searchTerm, setSearchTerm] = useStorageState('search', 'react');
  const [urls, setUrls] = useState([getUrl(searchTerm, 0)]);

  // memorized function
  const handleFetchStories = useCallback(async () => {
    if (!searchTerm) return;

    dispatchStories({ type: 'STORIES_FETCH_INIT' });
    
    try {
      const lastUrl = urls[urls.length - 1];
      const result = await axios.get(lastUrl);

      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS', 
        payload: {
          list: result.data.hits,
          page: result.data.page
        }
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

  const handleSearch = (searchTerm: string, page: number) => {
    const url = getUrl(searchTerm, page);
    setUrls(urls.concat(url));
  }

  // handle search submit
  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    handleSearch(searchTerm, 0);
  
    e.preventDefault();
  }

  const handleLastSearch = (searchTerm: string) => {
    handleSearch(searchTerm, 0);
    setSearchTerm(searchTerm);
  }

  const handleMore = () => {
    const lastUrl = urls[urls.length - 1];
    const searchTerm = lastUrl
                            .substring(lastUrl.lastIndexOf('?') + 1, lastUrl.lastIndexOf('&'))
                            .replace(PARAM_SEARCH, '');

    handleSearch(searchTerm, stories.page + 1);
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

      <List list={stories.data} onRemoveItem={handleRemoveStory} />

      {stories.isLoading ? (
        <p>Loading...</p>
      ) : (
        <button type="button" onClick={handleMore}>More</button>
      )}
    </div>
  );
};

export default App;
