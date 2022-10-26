import { createContext, useContext } from 'react'

type IProvider<State> = React.FC<{ initialState?: State }>

const EMPTY: unique symbol = Symbol()

const createModal = <Value, State = void>(
  useHook: (initialState?: State) => Value,
): { Provider: IProvider<State>; useModal: () => Value } => {
  const Container = createContext<Value | typeof EMPTY>(EMPTY)
  const Provider: IProvider<State> = ({ initialState, children }) => {
    const value = useHook(initialState)
    return <Container.Provider value={value}>{children}</Container.Provider>
  }
  const useModal = () => {
    const v = useContext(Container)
    if (v === EMPTY) {
      throw new Error('Component must be wrapped with <Provider>')
    }
    return v
  }

  return { Provider, useModal }
}

export default createModal
