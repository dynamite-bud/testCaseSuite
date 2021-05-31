import React, { createContext, useState } from "react";



const DATA = [
  {
    name: "TestSet2",
    description: "test set for load config",
    status: "",
    testCases: [
      {
        name: "abc",
        description: "Sample Test Case 1",
        testCaseStatus: "Not Runned",
        testSteps: [
          {
            commandName: "LoadConfig",
            params: {
              Device: 1001,
            },
            expectedOutcomes: {
              Command: "LoadConfig",
              Device: 1001,
              Status: "ok",
            },
          },
        ],
      },
      {
        name: "def",
        description: "Sample Test Case 2",
        testCaseStatus: "Not Runned",
        testSteps: [
          {
            commandName: "LoadConfig",
            params: {
              Device: 1001,
            },
            expectedOutcomes: {
              Command: "LoadConfig",
              Device: 1001,
              Status: "ok",
            },
          },
        ],
      },
    ],
  },
];

const DataContext = createContext(undefined);
const DataDispatchContext = createContext(undefined);

function DataProvider({ children }) {
  const [data, setData] = useState(DATA);
  const [finalData, setFinalData] = useState([]);


  return (
    <DataContext.Provider value={{data,finalData}}>
      <DataDispatchContext.Provider value={{setData,setFinalData}}>
        {children}
      </DataDispatchContext.Provider>
    </DataContext.Provider>
  );
}

export { DataProvider, DataContext, DataDispatchContext };
