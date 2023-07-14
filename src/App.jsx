import { 
  useState, 
  useEffect, 
  useReducer,
  useCallback 
} from 'react'
import './App.css';
import axios from 'axios';

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

const useStorageState = (key, initialState) => {
  const [value, setValue] = useState(
    localStorage.getItem(key) ?? initialState
  );

  // update local storage when value changes
  useEffect(() => {
    localStorage.setItem(key, value);
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
  const handleRemoveStory = (item) => {
    dispatchStories({
      type: 'REMOVE_STORY', 
      payload: item
    });
  }

  // handle search submit
  const handleSearchSubmit = () => setUrl(`${API_ENDPOINT}${searchTerm}`);

  return (
    <div>
      <h1>My Hacker Stories</h1>

      <InputWithLabel 
        id="search"
        value={searchTerm} 
        onInputChange={handleSearchInput}
        isFocused={true}
      >
        <strong>Search:</strong>
      </InputWithLabel>

      <button
        type="button"
        disabled={!searchTerm}
        onClick={handleSearchSubmit}
      >
        Submit
      </button>
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

const InputWithLabel = ({ 
  id, 
  value, 
  onInputChange,
  isFocused, 
  children 
}) => (
  <>
    <label htmlFor={id}>{children}</label>
    &nbsp;
    <input 
     id={id}
     onChange={onInputChange} 
     value={value}
     autoFocus={isFocused}
    />
  </>
);

const List = ({ list, onRemoveItem }) => (
  <ul>
    {list.map(item => (
      <Item 
        key={item.objectID} 
        item={item} 
        onRemoveItem={onRemoveItem} 
      />
    ))}
  </ul>
);

const Item = ({ item, onRemoveItem }) => (
  <li className="item">
    {item.title}
    <ul>
      <li><a href={item.url}>{item.url}</a></li>
      <li><strong>Author:</strong> {item.author}</li>
      <li><strong>Comments:</strong> {item.num_comments}</li>
      <li><strong>Points:</strong> {item.points}</li>
    </ul>
    <button onClick={() => onRemoveItem(item)}>X</button>
  </li>
);

export default App;
