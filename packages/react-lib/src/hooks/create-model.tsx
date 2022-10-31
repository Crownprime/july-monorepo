import React, { createContext, useContext, PropsWithChildren } from 'react'

type IProvider<State> = React.FC<PropsWithChildren<{ initialState?: State }>>

const EMPTY: unique symbol = Symbol()

export const createModel = <Value, State>(
  useHook: (initialState?: State) => Value
): { Provider: IProvider<State>; useModel: () => Value } => {
  const Container = createContext<Value | typeof EMPTY>(EMPTY)
  const Provider: IProvider<State> = ({ initialState, children }) => {
    const value = useHook(initialState)
    return <Container.Provider value={value}>{children}</Container.Provider>
  }
  const useModel = () => {
    const v = useContext(Container)
    if (v === EMPTY) {
      throw new Error('Component must be wrapped with <Provider>')
    }
    return v
  }

  return { Provider, useModel }
}
