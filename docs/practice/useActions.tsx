/**
 * @file: description
 * @author: yongzhen
 * @Date: 2021-02-09 14:34:37
 * @LastEditors: yongzhen
 * @LastEditTime: 2021-02-20 17:01:00
 */
import React, { useImperativeHandle, useState, useMemo, useEffect, useRef } from 'react';
import curruy from 'lodash/curry';
import classnames from 'classnames';

export type EditorProps = {
  content: string;
  theme: 'dark' | 'default';
};

type Store<S = {}> = {
  state: S;
  setState: (state: S) => void;
};

type Actions<S = {}> = {
  [x: string]: (store: Store<S>, ...args: any) => any;
};

type Map<T> = {
  [K in keyof T]: T[K] extends (Store, ...args: infer others) => infer R
    ? (...args: others) => R
    : never;
};

function useBindActions<S extends {}, A extends Actions<S>>(
  actions: A,
  defaultState?: S | (() => S),
  propState?: S
): {
  actions: Map<A>;
  state: S;
  setState: (s: S) => void;
} {
  const [state, setState] = useState<S>(defaultState);
  const store = {
    state,
    setState: (newState: S) =>
      setState({
        ...state,
        ...newState
      })
  };

  useEffect(() => {
    store.setState(propState);
  }, [propState]);

  const bindActionsMap = useMemo(() => {
    const bindActions = {};

    Object.keys(actions).forEach(key => {
      bindActions[key] = actions[key].bind(null, store);
    });

    return bindActions;
  }, [actions]);

  return {
    actions: bindActionsMap as Map<A>,
    state,
    setState
  };
}

function createStore<S extends {}, A extends Actions<S>>(defaultState: S | (() => S), actions: A) {
  return (propState?: S) => useBindActions(actions, defaultState, propState);
}

const useStore = createStore(
  {
    toolbars: [],
    comments: [],
    loadingState: 'pending'
  },
  {
    uodo({ state }) {},
    fetchComment(s, docId: string) {
      // state.comments
      // setState({
      //   loadingState: 'pending',
      //   toolbars: [],
      //   comments: []
      // });
    },
    log({ state, setState }) {}
  }
);

const Editor = React.forwardRef((props: EditorProps, ref) => {
  const className = classnames(props.theme, 'docs-editor');
  const { actions, state } = useStore();
  // const { state, actions } = useStore({
  //   props,
  //   toolbars: [],
  //   comments: [],
  //   loadingState: 'pending'
  // });

  // useImperativeHandle(ref, () => { actions });

  return <div className={className}>{props.content}</div>;
});

const App = () => {
  return (
    <div>
      <Editor content="123" theme="dark" />
    </div>
  );
};
