export type BaseState = {
  loading: boolean;
  error: string | null;
};

export type BaseListState<T> = BaseState & {
  items: T[];
}

export type BaseEditableState = BaseState & {
  creating: boolean;
};
