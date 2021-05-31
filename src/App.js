import React from "react";
import PropTypes from "prop-types";
import TestCaseSuite from "./testCaseSuite";
import ReactToPrint from "react-to-print";

class App extends React.Component {
  render() {
    return (
      <React.Fragment>
        <TestCaseSuite />
      </React.Fragment>
    );
  }
}

export default App;
