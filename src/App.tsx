import { 
  useState, 
  useEffect, 
  useReducer,
  useCallback,
  FC,
  ChangeEvent,
  FormEvent,
  ReactNode
} from 'react'
import styles from './App.module.css';
import axios from 'axios';
import { ReactComponent as Check } from './check.svg';

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

type Story = {
  objectID: string;
  url: string;
  title: string;
  author: string;
  num_comments: number;
  points: number;
}

type Stories = Story[];

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

type StoriesState = {
  data: Stories;
  isLoading: boolean;
  isError: boolean;
}

type StoriesFetchInitAction = {
  type: 'STORIES_FETCH_INIT'
}

type StoriesFetchSuccessAction = {
  type: 'STORIES_FETCH_SUCCESS';
  payload: Stories
}

type StoriesFetchFailureAction = {
  type: 'STORIES_FETCH_FAILURE'
}

type StoriesRemoveAction = {
  type: 'REMOVE_STORY';
  payload: Story
}

type StoriesAction = 
  StoriesFetchInitAction
  | StoriesFetchSuccessAction
  | StoriesFetchFailureAction
  | StoriesRemoveAction;

const storiesReducer = (
  state: StoriesState, 
  action: StoriesAction
) => {
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
  const handleSearchInput = (e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);

  // remove story
  const handleRemoveStory = (item: Story) => {
    dispatchStories({
      type: 'REMOVE_STORY', 
      payload: item
    });
  }

  // handle search submit
  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    setUrl(`${API_ENDPOINT}${searchTerm}`)
  
    e.preventDefault();
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.headlinePrimary}>My Hacker Stories</h1>

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

type InputWithLabelProps = {
  id: string;
  value: string;
  type?: string;
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  isFocused?: boolean;
  children: ReactNode
}

const InputWithLabel: FC<InputWithLabelProps> = ({ 
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

type ListProps = {
  list: Stories;
  onRemoveItem: (item: Story) => void 
}

const List: FC<ListProps> = ({ list, onRemoveItem }) => (
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

type ItemProps = {
  item: Story;
  onRemoveItem: (item: Story) => void;
}

const Item: FC<ItemProps> = ({ item, onRemoveItem }) => (
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
);

type SearchFormProps = {
  searchTerm: string;
  onSearchInput: (event: ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

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

export default App;
