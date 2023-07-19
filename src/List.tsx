import { FC } from 'react'
import { Stories, Story, ItemProps } from './types';
import styles from './App.module.css';
import { ReactComponent as Check } from './check.svg';

type ListProps = {
  list: Stories;
  onRemoveItem: (item: Story) => void 
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

export default List;