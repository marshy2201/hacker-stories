import { FC } from 'react'
import { Stories, Story, ItemProps } from './types';
import styles from './App.module.css';
import { ReactComponent as Check } from './check.svg';
import { useState } from 'react';
import { sortBy } from 'lodash';

type ListProps = {
  list: Stories;
  onRemoveItem: (item: Story) => void 
}

const SORTS: any = {
  NONE: (list: Stories) => list,
  TITLE: (list: Stories) => sortBy(list, 'title'),
  AUTHOR: (list: Stories) => sortBy(list, 'author'),
  COMMENT: (list: Stories) => sortBy(list, 'num_comments').reverse(),
  POINT: (list: Stories) => sortBy(list, 'points').reverse()
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

const List = ({ list, onRemoveItem }: ListProps) => {
  const [sort, setSort] = useState({
    sortKey: 'NONE',
    isReverse: false
  });

  const handleSort = (sortKey: string) => {
    const isReverse = sort.sortKey === sortKey && !sort.isReverse;

    setSort({ sortKey, isReverse });
  };

  const sortFunction = SORTS[sort.sortKey];
  const sortedList: Stories = sort.isReverse 
    ? sortFunction(list).reverse()
    : sortFunction(list);

  return (
    <ul>
      <li className={styles.header}>
        <span style={{ width: '40%' }}>
          <button type="button" onClick={() => handleSort('TITLE')}>Title</button>
        </span>
        <span style={{ width: '30%' }}>
          <button type="button" onClick={() => handleSort('AUTHOR')}>Author</button>
        </span>
        <span style={{ width: '10%' }}>
          <button type="button" onClick={() => handleSort('COMMENT')}>Comments</button>
        </span>
        <span style={{ width: '10%' }}>
          <button type="button" onClick={() => handleSort('POINT')}>Points</button>
        </span>
        <span style={{ width: '10%' }}>Actions</span>
      </li>

      {sortedList.map(item => (
        <Item 
          key={item.objectID} 
          item={item} 
          onRemoveItem={onRemoveItem} 
        />
      ))}
    </ul>
  );
}

export default List;