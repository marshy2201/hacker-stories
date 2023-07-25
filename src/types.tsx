import { ChangeEvent, ReactNode, FormEvent } from 'react'

type Story = {
  objectID: string;
  url: string;
  title: string;
  author: string;
  num_comments: number;
  points: number;
}

type Stories = Story[];

type ItemProps = {
  item: Story;
  onRemoveItem: (item: Story) => void;
}

type InputWithLabelProps = {
  id: string;
  value: string;
  type?: string;
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  isFocused?: boolean;
  children: ReactNode;
}

type SearchFormProps = {
  searchTerm: string;
  onSearchInput: (event: ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

type LastSearchesProps = {
  lastSearches: string[],
  onLastSearch: (searchTerm: string) => void
}

export type { 
  Story,
  Stories,
  ItemProps,
  InputWithLabelProps,
  SearchFormProps,
  LastSearchesProps
};