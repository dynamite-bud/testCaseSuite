import classNames from "classnames";
import PropTypes from "prop-types";
import React from "react";

import Button from "./Button";
import NativeCheckbox from "./NativeCheckbox";
import iconsShape from "./shapes/iconsShape";
import languageShape from "./shapes/languageShape";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import CancelIcon from '@material-ui/icons/Cancel';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import LoopIcon from '@material-ui/icons/Loop';

import {
  orange,
  lightGreen,
  green,
  deepPurple,
  red,
} from "@material-ui/core/colors";


class TreeNode extends React.PureComponent {
  static propTypes = {
    checked: PropTypes.number.isRequired,
    disabled: PropTypes.bool.isRequired,
    expandDisabled: PropTypes.bool.isRequired,
    expanded: PropTypes.bool.isRequired,
    icons: iconsShape.isRequired,
    isLeaf: PropTypes.bool.isRequired,
    isParent: PropTypes.bool.isRequired,
    // label: PropTypes.node.isRequired,
    lang: languageShape.isRequired,
    optimisticToggle: PropTypes.bool.isRequired,
    showNodeIcon: PropTypes.bool.isRequired,
    treeId: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onCheck: PropTypes.func.isRequired,
    onExpand: PropTypes.func.isRequired,

    children: PropTypes.node,
    className: PropTypes.string,
    expandOnClick: PropTypes.bool,
    icon: PropTypes.node,
    showCheckbox: PropTypes.bool,
    title: PropTypes.string,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    children: null,
    className: null,
    expandOnClick: false,
    icon: null,
    showCheckbox: true,
    title: null,
    onClick: () => {},
  };

  constructor(props) {
    super(props);

    this.onCheck = this.onCheck.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onExpand = this.onExpand.bind(this);
  }

  onCheck() {
    const { value, onCheck } = this.props;

    onCheck({ value, checked: this.getCheckState({ toggle: true }) });
  }

  onClick() {
    const { expandOnClick, isParent, value, onClick } = this.props;

    // Auto expand if enabled
    if (isParent && expandOnClick) {
      this.onExpand();
    }

    onClick({ value, checked: this.getCheckState({ toggle: false }) });
  }

  onExpand() {
    const { expanded, value, onExpand } = this.props;

    onExpand({ value, expanded: !expanded });
  }

  getCheckState({ toggle }) {
    const { checked, optimisticToggle } = this.props;

    // Toggle off state to checked
    if (checked === 0 && toggle) {
      return true;
    }

    // Node is already checked and we are not toggling
    if (checked === 1 && !toggle) {
      return true;
    }

    // Get/toggle partial state based on cascade model
    if (checked === 2) {
      return optimisticToggle;
    }

    return false;
  }

  renderCollapseButton() {
    const { expandDisabled, isLeaf, lang } = this.props;

    if (isLeaf) {
      return (
        <span className="rct-collapse">
          <span className="rct-icon" />
        </span>
      );
    }

    return (
      <Button
        className="rct-collapse rct-collapse-btn"
        disabled={expandDisabled}
        title={lang.toggle}
        onClick={this.onExpand}
      >
        {this.renderCollapseIcon()}
      </Button>
    );
  }

  renderCollapseIcon() {
    const {
      expanded,
      icons: { expandClose, expandOpen },
    } = this.props;

    if (!expanded) {
      return expandClose;
    }

    return expandOpen;
  }

  renderCheckboxIcon() {
    const {
      checked,
      icons: { uncheck, check, halfCheck },
    } = this.props;

    if (checked === 0) {
      return uncheck;
    }

    if (checked === 1) {
      return check;
    }

    return halfCheck;
  }

  renderNodeIcon() {
    const {
      expanded,
      icon,
      icons: { leaf, parentClose, parentOpen },
      isLeaf,
    } = this.props;

    if (icon !== null) {
      return icon;
    }

    if (isLeaf) {
      return leaf;
    }

    if (!expanded) {
      return parentClose;
    }

    return parentOpen;
  }

  renderBareLabel(children) {
    const { onClick, title } = this.props;
    const clickable = onClick !== null;

    return (
      <span className="rct-bare-label" title={title}>
        {clickable ? (
          <span
            className="rct-node-clickable"
            onClick={this.onClick}
            onKeyPress={this.onClick}
            role="button"
            tabIndex={0}
          >
            {children}
          </span>
        ) : (
          children
        )}
      </span>
    );
  }

  renderCheckboxLabel(children) {
    const { checked, disabled, title, treeId, value, onClick } = this.props;
    const clickable = onClick !== null;
    const inputId = `${treeId}-${String(value).split(" ").join("_")}`;

    const render = [
      <label key={0} htmlFor={inputId} title={title}>
        <NativeCheckbox
          checked={checked === 1}
          disabled={disabled}
          id={inputId}
          indeterminate={checked === 2}
          onClick={this.onCheck}
          onChange={() => {}}
        />
        <span className="rct-checkbox">{this.renderCheckboxIcon()}</span>
        {!clickable ? children : null}
      </label>,
    ];

    if (clickable) {
      render.push(
        <span
          key={1}
          className="rct-node-clickable"
          onClick={this.onClick}
          onKeyPress={this.onClick}
          role="link"
          tabIndex={0}
        >
          {children}
        </span>
      );
    }

    return render;
  }

  renderLabel() {
    const { label, showCheckbox, showNodeIcon } = this.props;

    let status;
    let statusIcon;
    switch(label.type){
      case "root":
        status="";
        statusIcon="";
        break;
      case "TS":
        status=label.status;
        if(label.numPassed===0){
          statusIcon=<CancelIcon style={{ color: red[400] }}/>
        }else if(label.numPassed===label.totalTC){
          statusIcon=<CheckCircleIcon style={{ color: green[400] }}/>
        }else{
          statusIcon=<LoopIcon style={{ color: orange[500] }}/>
        }
        break;
      case "TC":
        status="";
        if(label.status==="failed"){
          statusIcon=<CancelIcon style={{ color: red[400] }}/>
        }else if(label.status==="passed"){
          statusIcon=<CheckCircleIcon style={{ color: green[400] }}/>
        }else{
          statusIcon=<LoopIcon style={{ color: orange[500] }}/>
        }
        break;
        default:
          break;
    }


    const labelChildren = [
      showNodeIcon ? (
        <span key={0} className="rct-node-icon">
          {this.renderNodeIcon()}
        </span>
      ) : null,
      <span key={1} className="rct-title">
          <TableBody>
            <TableRow>
              <TableCell align="right">{label.name}</TableCell>
              <TableCell align="right">{label.description}</TableCell>
              <TableCell align="right">{status}  {statusIcon}</TableCell>
            </TableRow>
          </TableBody>
      </span>,
    ];

    if (!showCheckbox) {
      return this.renderBareLabel(labelChildren);
    }

    return this.renderCheckboxLabel(labelChildren);
  }

  renderChildren() {
    if (!this.props.expanded) {
      return null;
    }

    return this.props.children;
  }

  render() {
    const { className, disabled, expanded, isLeaf } = this.props;
    const nodeClass = classNames(
      {
        "rct-node": true,
        "rct-node-leaf": isLeaf,
        "rct-node-parent": !isLeaf,
        "rct-node-expanded": !isLeaf && expanded,
        "rct-node-collapsed": !isLeaf && !expanded,
        "rct-disabled": disabled,
      },
      className
    );

    return (
      <li className={nodeClass}>
        <span className="rct-text">
          {this.renderCollapseButton()}
          {this.renderLabel()}
        </span>
        {this.renderChildren()}
      </li>
    );
  }
}

export default TreeNode;
