// CarpoolContext.js
import React, { createContext, useState } from 'react';

export const CarpoolContext = createContext();

export const CarpoolProvider = ({ children }) => {
  const [carpoolList, setCarpoolList] = useState([]);

  const addCarpool = (carpoolDetails) => {
    setCarpoolList((prevList) => [...prevList, carpoolDetails]);
  };

  return (
    <CarpoolContext.Provider value={{ carpoolList, addCarpool }}>
      {children}
    </CarpoolContext.Provider>
  );
};
