import { InputWithLabelProps } from './types';
import { FC } from 'react'
import styles from './App.module.css';

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

export default InputWithLabel;