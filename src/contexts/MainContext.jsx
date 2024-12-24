import { useLocation } from "react-router-dom";
import { useEffect, useContext, createContext } from "react";

const MainContext = createContext({});

const MainContextProvider = ({ children }) => {
  const { pathname } = useLocation();

  // Define the scrollTop function
  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {

    const myTimeout = setTimeout(() => {
      scrollTop();
    }, 100);

    return () => {
      clearTimeout(myTimeout);
    };
  }, [pathname]);





  return (
    <MainContext.Provider
      value={{}}
    >
      {children}
    </MainContext.Provider>
  );
};

export default MainContextProvider;

export const useMainContext = () => useContext(MainContext);
