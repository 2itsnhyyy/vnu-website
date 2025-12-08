import React, {
  createContext,
  useState,
  useContext,
  type ReactNode,
} from "react";

interface MainContextType {
  refreshMain: boolean;
  triggerRefresh: () => void;
}

const MainContext = createContext<MainContextType | undefined>(undefined);

interface MainProviderProps {
  children: ReactNode;
}

export const MainProvider: React.FC<MainProviderProps> = ({ children }) => {
  const [refreshMain, setRefreshMain] = useState(false);

  const triggerRefresh = () => {
    setRefreshMain((prev) => !prev);
  };

  return (
    <MainContext.Provider value={{ refreshMain, triggerRefresh }}>
      {children}
    </MainContext.Provider>
  );
};

export const useMainContext = () => {
  const context = useContext(MainContext);
  if (!context) {
    throw new Error("useMainContext phải được sử dụng bên trong MainProvider");
  }
  return context;
};
