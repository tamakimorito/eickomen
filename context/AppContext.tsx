import React, { createContext, useMemo, type PropsWithChildren } from 'https://esm.sh/react@^19.1.0';
import { useFormLogic } from '../hooks/useFormLogic.ts';
import { useAppLogic } from '../hooks/useAppLogic.ts';

export const AppContext = createContext(null);

export const AppContextProvider = ({ children }: PropsWithChildren) => {
    const formLogic = useFormLogic();
    const appLogic = useAppLogic(formLogic);

    const contextValue = useMemo(() => ({
        ...formLogic,
        ...appLogic
    }), [formLogic, appLogic]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};