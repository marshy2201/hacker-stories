import { useState, useEffect, useReducer } from 'react'
import './App.css'

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
    case 'SET_STORIES':
      return action.payload;
    case 'REMOVE_STORY':
      return state.filter(story => story.objectID !== action.payload.objectID);
    default:
      return new Error();
  }
}

const App = () => {
  const initialStories = [
    {
      title: 'React',
      url: 'https://reactjs.org',
      author: 'Jordan Walke',
      num_comments: 3,
      points: 4,
      objectID: 0
    },
    {
      title: 'Redux',
      url: 'https://reduxjs.org',
      author: 'Dan Abramov, Andrew Clark',
      num_comments: 2,
      points: 5,
      objectID: 1
    }
  ];

  const [stories, dispatchStories] = useReducer(storiesReducer, []);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  // fetch data asynchronously
  const getAsyncStories = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ data: { stories: initialStories } });
      }, 2000);
    });
  }

  useEffect(() => {
    setIsLoading(true);

    getAsyncStories().
      then(result => {
        dispatchStories({
          type: 'SET_STORIES', 
          payload: result.data.stories
        });
      }).
      catch(() => setIsError(true)).
      finally(() => setIsLoading(false));
  }, []);

  const [searchTerm, setSearchTerm] = useStorageState('search', 'React');

  // update the search term field
  const handleChange = (e) => setSearchTerm(e.target.value);

  // remove story
  const handleRemoveStory = (item) => {
    dispatchStories({
      type: 'REMOVE_STORY', 
      payload: item
    });
  }

  // filter the stories
  const filterStories = stories.filter(story => {
    if (!searchTerm) {
      return true;
    }

    const regex = new RegExp(`^${searchTerm}`, 'i');

    return regex.test(story.title);
  });

  return (
    <div>
      <h1>My Hacker Stories</h1>

      <InputWithLabel 
        id="search"
        value={searchTerm} 
        onInputChange={handleChange} 
      >
        <strong>Search:</strong>
      </InputWithLabel>
      <hr />

      {isError && <p>Something went wrong...</p>}

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <List list={filterStories} onRemoveItem={handleRemoveStory} />
      )}
    </div>
  );
};

const InputWithLabel = ({ id, value, onInputChange, children }) => (
  <>
    <label htmlFor={id}>{children}</label>
    &nbsp;
    <input 
     id={id}
     onChange={onInputChange} 
     value={value}
     autoFocus
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
