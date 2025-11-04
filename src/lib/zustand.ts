import { useDebugValue, useSyncExternalStore } from 'react';

type StateCreator<T> = (
  set: SetState<T>,
  get: GetState<T>,
  api: StoreApi<T>,
) => T;

type SetState<T> = (
  partial: Partial<T> | ((state: T) => Partial<T>),
  replace?: boolean,
) => void;

type GetState<T> = () => T;

type Listener = () => void;

type StoreApi<T> = {
  setState: SetState<T>;
  getState: GetState<T>;
  subscribe: (listener: Listener) => () => void;
  destroy: () => void;
};

type Selector<T, U> = (state: T) => U;

type EqualityFn<U> = (a: U, b: U) => boolean;

type UseBoundStore<T> = {
  (): T;
  <U>(selector: Selector<T, U>, equality?: EqualityFn<U>): U;
  setState: SetState<T>;
  getState: GetState<T>;
  subscribe: (listener: Listener) => () => void;
  destroy: () => void;
};

const identity = <T>(value: T) => value;
const objectIs: EqualityFn<unknown> = Object.is;

export function create<T extends Record<string, unknown>>(
  initializer: StateCreator<T>,
): UseBoundStore<T> {
  let state: T;
  const listeners = new Set<Listener>();

  const setState: SetState<T> = (partial, replace) => {
    const nextState =
      typeof partial === 'function'
        ? (partial as (state: T) => Partial<T>)(state)
        : partial;

    if (nextState === undefined) {
      return;
    }

    const newState = replace
      ? (nextState as T)
      : ({ ...state, ...nextState } as T);

    if (objectIs(newState, state)) {
      return;
    }

    state = newState;
    listeners.forEach((listener) => listener());
  };

  const getState: GetState<T> = () => state;

  const subscribe = (listener: Listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const destroy = () => {
    listeners.clear();
  };

  const api: StoreApi<T> = { setState, getState, subscribe, destroy };
  state = initializer(setState, getState, api);

  function useBoundStore(): T;
  function useBoundStore<U>(selector: Selector<T, U>, equality?: EqualityFn<U>): U;
  function useBoundStore<U>(selector?: Selector<T, U>, equality: EqualityFn<U> = objectIs) {
    const select = (selector ?? ((identity as (state: T) => T))) as Selector<T, U>;
    const getSnapshot = () => select(state);

    const subscribeSelector = (listener: Listener) => {
      let prevSlice = select(state);
      return subscribe(() => {
        const nextSlice = select(state);
        if (!equality(nextSlice, prevSlice)) {
          prevSlice = nextSlice;
          listener();
        }
      });
    };

    const slice = useSyncExternalStore(subscribeSelector, getSnapshot, getSnapshot);

    useDebugValue(slice);
    return slice;
  }

  useBoundStore.setState = setState;
  useBoundStore.getState = getState;
  useBoundStore.subscribe = subscribe;
  useBoundStore.destroy = destroy;

  return useBoundStore;
}

export type { StateCreator, StoreApi };
