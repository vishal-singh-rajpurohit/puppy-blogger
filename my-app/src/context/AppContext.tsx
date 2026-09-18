"use client"
import { createContext } from "react";

interface AppContextType { }

const AppContext = createContext<AppContextType | null>(null);


const AppProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <AppContext.Provider value={null}>
            {children}
        </AppContext.Provider>
    );
};

export { AppProvider, AppContext };
