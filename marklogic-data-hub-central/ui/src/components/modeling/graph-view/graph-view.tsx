import React, {CSSProperties, useContext, useState} from "react";
import {AutoComplete, Dropdown, Icon, Menu, Input, Tooltip} from "antd";
import styles from "./graph-view.module.scss";
import {ModelingTooltips} from "../../../config/tooltips.config";
import PublishToDatabaseIcon from "../../../assets/publish-to-database-icon";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFileExport} from "@fortawesome/free-solid-svg-icons";
import SplitPane from "react-split-pane";
import GraphViewSidePanel from "./side-panel/side-panel";
import {ModelingContext} from "../../../util/modeling-context";
import GraphVis from "./graph-vis/graph-vis";
import HCButton from "../../common/hc-button/hc-button";
import HCAlert from "../../common/hc-alert/hc-alert";
import {ChevronDown} from "react-bootstrap-icons";

type Props = {
  entityTypes: any;
  canReadEntityModel: any;
  canWriteEntityModel: any;
  deleteEntityType: (entityName: string) => void;
  updateSavedEntity: any;
  relationshipModalVisible: any;
  toggleRelationshipModal: any;
  toggleShowEntityModal: any;
  toggleIsEditModal: any;
};

const GraphView: React.FC<Props> = (props) => {

  const {modelingOptions, setSelectedEntity} = useContext(ModelingContext);
  const [filterMenuSuggestions, setFilterMenuSuggestions] = useState(["a"]);
  const [entityFiltered, setEntityFiltered] = useState("");
  const [isEntityFiltered, setIsEntityFiltered] = useState(false);
  const [graphEditMode, setGraphEditMode] = useState(false);

  const publishIconStyle: CSSProperties = {
    width: "1rem",
    fill: "currentColor"
  };

  const handleFocus = () => {
    setFilterMenuSuggestions([]);
  };

  const handleTypeaheadChange = (value: any) => {
    setEntityFiltered(value);
    setIsEntityFiltered(false);
    if (value.length > 2) {
      Object.keys(props.entityTypes).map((key) => {
        let obj = filterMenuSuggestions;
        if (value && !filterMenuSuggestions.includes(props.entityTypes[key]["entityName"]) && props.entityTypes[key]["entityName"].toLowerCase().indexOf(value.toLowerCase()) >= 0) {
          obj.push(props.entityTypes[key]["entityName"]);
        }
        setFilterMenuSuggestions(obj);
      });
    } else {
      setFilterMenuSuggestions([]);
    }
  };

  const handleFilterSelect = (value: any) => {
    setFilterMenuSuggestions([]);
    setIsEntityFiltered(true);
    setSelectedEntity(value);
  };


  const filter = <AutoComplete
    className={styles.filterInput}
    dataSource={filterMenuSuggestions}
    value={entityFiltered}
    onFocus={handleFocus}
    onChange={handleTypeaheadChange}
    onSelect={handleFilterSelect}
    aria-label="graph-view-filter-autoComplete"
    placeholder={"Filter"}
  >
    <Input aria-label="graph-view-filter-input" suffix={<Icon className={styles.searchIcon} type="search" theme="outlined" />} size="small"></Input>
  </AutoComplete>;

  const handleAddMenu = (event) => {
    if (event.key === "addNewEntityType") {
      props.toggleShowEntityModal(true);
      props.toggleIsEditModal(false);
    } else if (event.key === "addNewRelationship") {
      // TODO open Add Relationship dialog
      // console.log("addNewRelationship", event);
    }
  };

  const addMenu = (
    <Menu onClick={handleAddMenu}>
      <Menu.Item key="addNewEntityType">
        <span aria-label={"add-entity-type"}>Add new entity type</span>
      </Menu.Item>
      <Menu.Item key="addNewRelationship" onClick={() => setGraphEditMode(true)}>
        <span aria-label={"add-relationship"}>Add new relationship</span>
      </Menu.Item>
    </Menu>
  );

  const addButton = (
    <Dropdown
      overlay={addMenu}
      trigger={["click"]}
      overlayClassName={styles.stepMenu}
      placement="bottomRight"
      disabled={!props.canWriteEntityModel}
    >
      <div className={styles.addButtonContainer}>
        <HCButton
          aria-label="add-entity-type-relationship"
          variant="primary"
          size="sm"
          disabled={!props.canWriteEntityModel}
          className={!props.canWriteEntityModel ? styles.disabledPointerEvents : undefined}>
          <span className={styles.addButtonText}>Add</span>
          <ChevronDown className="ms-2" />
        </HCButton>
      </div>
    </Dropdown>
  );

  const headerButtons = <span className={styles.buttons}>
    {graphEditMode ?
      <div className={styles.editModeInfoContainer}>
        <HCAlert
          variant="info" aria-label="graph-edit-mode-info" showIcon
        >{ModelingTooltips.editModeInfo}</HCAlert>
      </div> : ""
    }
    <span>
      {props.canWriteEntityModel ?
        <span>
          {addButton}
        </span>
        :
        <Tooltip
          title={ModelingTooltips.addNewEntityGraph + " " + ModelingTooltips.noWriteAccess}
          placement="top" overlayStyle={{maxWidth: "175px"}}>
          <span className={styles.disabledCursor}>{addButton}</span>
        </Tooltip>
      }
    </span>
    <Tooltip title={ModelingTooltips.publish}>
      <HCButton aria-label="publish-to-database" variant="outline-light" size="sm"> {/* type="secondary"> */}
        <span className={styles.publishButtonContainer}>
          <PublishToDatabaseIcon style={publishIconStyle} />
          <span className={styles.publishButtonText}>Publish</span>
        </span>
      </HCButton>
    </Tooltip>
    <Tooltip title={ModelingTooltips.exportGraph} placement="topLeft">
      <FontAwesomeIcon className={styles.graphExportIcon} icon={faFileExport} aria-label="graph-export" />
    </Tooltip>
  </span>;

  const splitPaneStyles = {
    pane1: {minWidth: "150px"},
    pane2: {minWidth: "140px", maxWidth: "90%"},
    pane: {overflow: "auto"},
  };

  const splitStyle: CSSProperties = {
    position: "relative",
    height: "none",
  };

  const handleEntitySelection = (entityName) => {
    setSelectedEntity(entityName);
  };

  const onCloseSidePanel = async () => {
    //closeSidePanelInGraphView();
    setSelectedEntity(undefined);
  };

  const deleteEntityClicked = (selectedEntity) => {
    props.deleteEntityType(selectedEntity);
  };

  const graphViewMainPanel =
    <div className={styles.graphViewContainer}>
      <div className={styles.graphHeader}>
        {filter}
        {headerButtons}
      </div>
      <div>
        <GraphVis
          entityTypes={props.entityTypes}
          handleEntitySelection={handleEntitySelection}
          filteredEntityTypes={filterMenuSuggestions}
          entitySelected={entityFiltered}
          isEntitySelected={isEntityFiltered}
          updateSavedEntity={props.updateSavedEntity}
          toggleRelationshipModal={props.toggleRelationshipModal}
          relationshipModalVisible={props.relationshipModalVisible}
          canReadEntityModel={props.canReadEntityModel}
          canWriteEntityModel={props.canWriteEntityModel}
          graphEditMode={graphEditMode}
          setGraphEditMode={setGraphEditMode}
        />
      </div>
    </div>;

  // const entityTypeExistsInDatabase = (entityName, entityTypesArray) => {
  //   let entityValidation = entityTypesArray.find((obj) => obj.name === entityName);
  //   return !entityValidation ? false : true;
  // };

  // const isSelectedEntityTypeValid = () => {
  //   return modelingOptions.selectedEntity && entityTypeExistsInDatabase(modelingOptions.selectedEntity, modelingOptions.entityTypeNamesArray);
  // };

  return (
    !modelingOptions.selectedEntity ? graphViewMainPanel :
      // (isSelectedEntityTypeValid() ?
      <SplitPane
        style={splitStyle}
        paneStyle={splitPaneStyles.pane}
        allowResize={true}
        resizerClassName={styles.resizerStyle}
        pane1Style={splitPaneStyles.pane1}
        pane2Style={splitPaneStyles.pane2}
        split="vertical"
        primary="first"
        defaultSize="70%"
      >
        {graphViewMainPanel}
        <GraphViewSidePanel
          entityTypes={props.entityTypes}
          onCloseSidePanel={onCloseSidePanel}
          deleteEntityClicked={deleteEntityClicked}
          canReadEntityModel={props.canReadEntityModel}
          canWriteEntityModel={props.canWriteEntityModel}
        />
      </SplitPane> //: graphViewMainPanel
  //)
  );
};

export default GraphView;
