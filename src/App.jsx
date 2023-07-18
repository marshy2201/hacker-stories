import { 
  useState, 
  useEffect, 
  useReducer,
  useCallback, 
  useRef,
  memo,
  useMemo
} from 'react'
import styles from './App.module.css';
import axios from 'axios';
import { ReactComponent as Check } from './check.svg';

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

const useStorageState = (key, initialState) => {
  const isMounted = useRef(false);

  const [value, setValue] = useState(
    localStorage.getItem(key) ?? initialState
  );

  // update local storage when value changes
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      localStorage.setItem(key, value);
    }
  }, [value, key]);

  return [value, setValue];
}

const storiesReducer = (state, action) => {
  switch (action.type) {
    case 'STORIES_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload
      };
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true
      };
    case 'REMOVE_STORY':
      return {
        ...state,
        data: state.data.filter(story => story.objectID !== action.payload.objectID)
      };
    default:
      throw new Error();
  }
}

const getSumComments = (stories) => {
  console.log('comments total render');

  return stories.data.reduce((result, value) => result + value.num_comments, 0);
}

const App = () => {
  const [stories, dispatchStories] = useReducer(
    storiesReducer, 
    { data: [], isLoading: false, isError: false }
  );

  const [searchTerm, setSearchTerm] = useStorageState('search', 'react');
  const [url, setUrl] = useState(`${API_ENDPOINT}${searchTerm}`);

  // memorized function
  const handleFetchStories = useCallback(async () => {
    if (!searchTerm) return;

    dispatchStories({ type: 'STORIES_FETCH_INIT' });
    
    try {
      const result = await axios.get(url);

      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS', 
        payload: result.data.hits
      });
    } catch (err) {
      dispatchStories({ type: 'STORIES_FETCH_FAILURE' })
    }
  }, [url]);

  useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  // update the search term field
  const handleSearchInput = (e) => setSearchTerm(e.target.value);

  // remove story
  const handleRemoveStory = useCallback((item) => {
    dispatchStories({
      type: 'REMOVE_STORY', 
      payload: item
    });
  }, []);

  // handle search submit
  const handleSearchSubmit = (event) => {
    setUrl(`${API_ENDPOINT}${searchTerm}`)
  
    event.preventDefault();
  }

  console.log('B:App')

  const sumComments = useMemo(
    () => getSumComments(stories),
    [stories]
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.headlinePrimary}>My Hacker Stories with {sumComments} comments.</h1>

      <SearchForm
        searchTerm={searchTerm}
        onSearchSubmit={handleSearchSubmit}
        onSearchInput={handleSearchInput}
      />

      {stories.isError && <p>Something went wrong...</p>}

      {stories.isLoading ? (
        <p>Loading...</p>
      ) : (
        <List list={stories.data} onRemoveItem={handleRemoveStory} />
      )}
    </div>
  );
};

const InputWithLabel = ({ 
  id, 
  value, 
  onInputChange,
  isFocused, 
  children 
}) => (
  <>
    <label htmlFor={id} className={styles.label}>{children}</label>
    &nbsp;
    <input 
     id={id}
     onChange={onInputChange} 
     value={value}
     autoFocus={isFocused}
     className={styles.input}
    />
  </>
);

const List = memo(
  ({ list, onRemoveItem }) => 
    console.log('B:List') || (
      <ul>
        {list.map(item => (
          <Item 
            key={item.objectID} 
            item={item} 
            onRemoveItem={onRemoveItem} 
          />
        ))}
      </ul>
  )
);

const Item = memo(
  ({ item, onRemoveItem }) => console.log('item render') || (
    <li className={styles.item}>
      <span style={{ width: '40%'}}><a href={item.url}>{item.title}</a></span>
      <span style={{ width: '30%'}}><strong>Author:</strong> {item.author}</span>
      <span style={{ width: '10%'}}><strong>Comments:</strong> {item.num_comments}</span>
      <span style={{ width: '10%'}}><strong>Points:</strong> {item.points}</span>
      <span style={{ width: '10%'}}>
        <button onClick={() => onRemoveItem(item)} className={`${styles.button} ${styles.button_small}`}>
          <Check height="18px" width="18px" />
        </button>
      </span>
    </li>
  )
);

const SearchForm = ({
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

    <button type="button" disabled={!searchTerm} className={`${styles.button} ${styles.button_large}`}>Submit</button>
  </form>
)

export default App;
