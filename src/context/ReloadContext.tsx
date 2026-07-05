import React, {createContext, useContext, useState, useCallback} from 'react';

interface ReloadContextType {
  reloadApp: () => void;
  rootKey: number;
}

const ReloadContext = createContext<ReloadContextType | undefined>(undefined);

export const ReloadProvider: React.FC<{children: (rootKey: number) => React.ReactNode}> = ({children}) => {
  const [rootKey, setRootKey] = useState(0);

  const reloadApp = useCallback(() => {
    setRootKey(prev => prev + 1);
  }, []);

  return (
    <ReloadContext.Provider value={{reloadApp, rootKey}}>
      {children(rootKey)}
    </ReloadContext.Provider>
  );
};

export const useReload = () => {
  const context = useContext(ReloadContext);
  if (context === undefined) {
    throw new Error('useReload must be used within a ReloadProvider');
  }
  return context;
};
