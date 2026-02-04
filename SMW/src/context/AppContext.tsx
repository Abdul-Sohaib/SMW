/* eslint-disable @typescript-eslint/no-explicit-any */
// AppContext.tsx
import React, { createContext, useContext } from 'react';

interface AppContextProps {
    warriorController: any;
    taskController: any;
    customFetch: (url: string, options?: any) => Promise<Response>; // Add customFetch to context
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
};

interface AppProviderProps {
    children: React.ReactNode;
    customFetch: (url: string, options?: any) => Promise<Response>; // Receive customFetch
}

export const AppProvider: React.FC<AppProviderProps> = ({ children, customFetch }) => {
    const warriorController = {};
    const taskController = {};

    return (
        <AppContext.Provider value={{ warriorController, taskController, customFetch }}>
            {children}
        </AppContext.Provider>
    );
};