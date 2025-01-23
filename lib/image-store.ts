import React from "react"
import { createStore } from "zustand/vanilla"
import { useStore } from "zustand"
import { createZustandContext } from "./zustand-context"
import { createJSONStorage, persist } from "zustand/middleware"

type State = {
    generating: boolean,
    setGenerating: (generating: boolean) => void,
}

const getStore = (initialState: {generating : boolean}) => {
    return createStore<State>()(
        persist(
            (set) => ({
                generating: initialState.generating,
                setGenerating: (generating) => set({ generating })
            }), 
            {
                name: 'images-store',
                storage: createJSONStorage(() => localStorage),
            }
        )
    )
}

export const ImageStore = createZustandContext(getStore)

export function useImageStore<T>(selector: (state: State) => T): T {
    const store = React.useContext(ImageStore.Context);
    if (!store) {
        throw new Error('Missing Image Store Provider');
    } return useStore(store, selector);
}