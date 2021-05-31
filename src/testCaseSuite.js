import React, { useEffect } from "react";
import CheckboxTree from "./checkBoxTree/CheckboxTree";

import PropTypes from "prop-types";
import clsx from "clsx";
import { lighten, makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Checkbox from "@material-ui/core/Checkbox";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import DeleteIcon from "@material-ui/icons/Delete";
import FilterListIcon from "@material-ui/icons/FilterList";
import axios from "axios";

import Button from "@material-ui/core/Button";
import { Send } from "@material-ui/icons";
import SaveIcon from "@material-ui/icons/Save";
import Icon from "@material-ui/core/Icon";
import {
  orange,
  lightGreen,
  green,
  deepPurple,
  red,
} from "@material-ui/core/colors";

import "react-checkbox-tree/lib/react-checkbox-tree.css";
import ReactToPrint, { PrintContextConsumer } from "react-to-print";

// let numTSSelected = 0;

let DATA = {};

const rows = [
  {
    value: "root",
    label: {
      name: "Test Sets",
      description: "",
      status: "",
    },
    children: [
      {
        value: "root:TestSet1",
        label: {
          name: "TestSet1",
          description: "test set for load config",
          status: "0/2 passed",
        },
        children: [
          {
            value: "root:TestSet1:TestCase1",
            label: {
              name: "TestCase1",
              description: "Sample Test Case 1",
              status: "Not Runned",
            },
          },
          {
            value: "root:TestSet1:TestCase2",
            label: {
              name: "TestCase2",
              description: "Sample Test Case 2",
              status: "Not Runned",
            },
          },
        ],
      },
      {
        value: "root:TestSet2",
        label: {
          name: "TestSet2",
          description: "test set for load config",
          status: "",
        },
        children: [
          {
            value: "root:TestSet2:TestCase1",
            label: {
              name: "TestCase1",
              description: "Sample Test Case 1",
              status: "Not Runned",
            },
          },
          {
            value: "root:TestSet2:TestCase2",
            label: {
              name: "TestCase2",
              description: "Sample Test Case 2",
              status: "Not Runned",
            },
          },
        ],
      },
    ],
  },
];

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
    theme.palette.type === "light"
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  title: {
    flex: "1 2 100%",
  },
  button: {
    margin: theme.spacing(1),
  },
}));

const EnhancedTableToolbar = (props) => {
  const classes = useToolbarStyles();
  const { checked, handleSubmit, handlePrint, handleAbort } = props;
  //   const { numSelected: numTSSelected } = props;
  const [numSelected, setSelected] = React.useState(0);

  useEffect(() => {
    let tsMap = {};
    let uniqueSets = 0;
    for (let selected of checked) {
      let testSet = selected?.split(":")[1];
      if (!tsMap.hasOwnProperty(testSet)) {
        tsMap[testSet] = true;
        uniqueSets++;
      }
    }
    setSelected(uniqueSets);
  }, [checked]);

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      {numSelected > 0 ? (
        <Typography
          className={classes.title}
          color="inherit"
          variant="subtitle1"
          component="span"
        >
          <div>{numSelected} Test Sets selected</div>
          <div>{checked.length} Test Cases selected</div>
        </Typography>
      ) : (
        <Typography
          className={classes.title}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          TESTCASE SUITE
        </Typography>
      )}
      <Button
        variant="contained"
        color="secondary"
        className={classes.button}
        onClick={handleAbort}
        endIcon={<DeleteIcon />}
      >
        Abort
      </Button>
      <Button
        variant="contained"
        color="primary"
        size="small"
        className={classes.button}
        startIcon={<SaveIcon />}
        onClick={handlePrint}
      >
        Save
      </Button>
      {numSelected > 0 ? (
        <Button
          variant="contained"
          color="secondary"
          //   style={{ color: red[500] }}
          onClick={handleSubmit}
          className={classes.button}
          endIcon={<Send />}
        >
          Send
        </Button>
      ) : (
        <Button variant="contained" color="disabled" className={classes.button}>
          None
        </Button>
      )}
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  checked: PropTypes.arrayOf(Object).isRequired,
};

class TestCaseSuite extends React.Component {
  state = {
    checked: [],
    expanded: [],
    data: [],
    abort: false,
  };

  constructor(props) {
    super(props);

    this.onCheck = this.onCheck.bind(this);
    this.onExpand = this.onExpand.bind(this);
    this.suiteRef = React.createRef();
  }

  createAndFormatData(data, finalExpanded, finalChecked) {
    let clearedData = [];
    for (let TS of data) {
      let tsObj = {};
      tsObj["value"] = "root:" + TS.name;
      tsObj["label"] = {
        name: TS.name,
        description: TS.description,
        numPassed: TS.testCases.filter((tc) => tc.testCaseStatus === "passed")
          .length,
        totalTC: TS.testCases.length,
        type: "TS",
      };
      tsObj["label"][
        "status"
      ] = `${tsObj["label"]["numPassed"]}/${tsObj["label"]["totalTC"]} Passed`;
      tsObj["children"] = [];

      // initial expansion
      finalExpanded.push(tsObj.value);

      for (let TC of TS.testCases) {
        let tcObj = {};

        tcObj["value"] = tsObj["value"] + ":" + TC.name;
        tcObj["label"] = {
          name: TC.name,
          description: TC.description,
          status: TC.testCaseStatus,
          type: "TC",
        };
        tcObj["label"].testSteps = TC.testSteps;

        tsObj["children"].push(tcObj);

        finalChecked.push(tcObj.value);
      }
      DATA[TS.name] = tsObj;
      clearedData.push(tsObj);
    }
    return clearedData;
  }

  createFinalData(data) {
    let finalExpanded = [];
    let finalChecked = [];
    const finalData = [
      {
        value: "root",
        label: {
          name: "Test Sets",
          description: "",
          status: "",
          type: "root",
        },
        children: this.createAndFormatData(data, finalExpanded, finalChecked),
      },
    ];
    return [finalData, finalExpanded, finalChecked];
  }
  async componentDidMount() {
    try {
      const resp = await axios.get("http://localhost:8080/data");
      let [finalData, initExpanded, initChecked] = this.createFinalData(
        resp.data
      );

      this.setState({
        data: finalData,
        expanded: ["root", ...initExpanded],
        checked: initChecked,
      });
    } catch (err) {
      // Handle Error Here
      console.error(err);
    }
  }
  componentDidUpdate() {}

  onCheck(checked) {
    this.setState({ checked });
  }

  onExpand(expanded) {
    this.setState({ expanded });
  }
  prepareToSend(data) {
    let postData = {};
    for (let tc of data) {
      let [, testSet] = tc.split(":");
      if (!postData.hasOwnProperty(testSet)) {
        postData[testSet] = [];
      }
      postData[testSet].push({
        ...DATA[testSet].children.find((child) => child.value === tc).label,
      });
    }
    return postData;
  }

  async waitUntil() {
    return await new Promise((resolve) => {
      const interval = setInterval(async () => {
        if (this.state.abort) {
          resolve("Aborted");
          clearInterval(interval);
        }
        try {
          const resp = await axios.get("http://localhost:8080/result");
          this.setState({ data: this.createFinalData(resp.data)[0] });
        } catch (err) {
          console.error(err);
        }
      }, 1000);
    });
  }

  handleSubmit = async (event) => {
    this.setState({ abort: false });
    const { checked: data } = this.state;
    try {
      const resp = await axios.post(
        "http://localhost:8080/postData",
        this.prepareToSend(data)
      );
    } catch (err) {
      // Handle Error Here
      console.error(err);
    }

    try {
      await this.waitUntil();
    } catch (err) {
      console.error(err);
    }
  };
  handleAbort = () => {
    console.log("here");
    this.setState({ abort: true });
  };

  render() {
    const { checked, expanded, data } = this.state;

    return (
      <div>
        <div ref={(el) => (this.componentRef = el)}>
          <ReactToPrint content={() => this.componentRef}>
            <PrintContextConsumer>
              {({ handlePrint }) => (
                <EnhancedTableToolbar
                  checked={checked}
                  handlePrint={handlePrint}
                  handleSubmit={this.handleSubmit}
                  handleAbort={this.handleAbort}
                />
              )}
            </PrintContextConsumer>
          </ReactToPrint>

          <div className="expand-all-container">
            <CheckboxTree
              checked={checked}
              expanded={expanded}
              iconsClass="fa5"
              nodes={data}
              showExpandAll
              onCheck={this.onCheck}
              onExpand={this.onExpand}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default TestCaseSuite;
