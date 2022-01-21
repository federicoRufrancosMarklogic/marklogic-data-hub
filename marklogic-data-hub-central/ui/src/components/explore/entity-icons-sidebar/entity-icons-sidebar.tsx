import React, {useContext} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import * as Icons from "@fortawesome/free-solid-svg-icons";
import styles from "./entity-icons-sidebar.module.scss";
import {ChevronDoubleRight} from "react-bootstrap-icons";
import {SearchContext} from "../../../util/search-context";
import {HCTooltip} from "@components/common";

interface Props {
  currentBaseEntities: any[];
  currentRelatedEntities?: Map<string, any>;
  onClose: (status: boolean) => void;
  updateSelectedEntity
}

const EntityIconsSidebar: React.FC<Props> = (props) => {
  const {currentBaseEntities, onClose, currentRelatedEntities, updateSelectedEntity} = props;
  const currentRelatedEntitiesArray = currentRelatedEntities && currentRelatedEntities.size > 0 ? Array.from(currentRelatedEntities.values()) : [];

  const {
    setEntity,
  } = useContext(SearchContext);

  const closeSpecificSidebar = (event) => {
    onClose(false);
  };

  const handleBaseEntityClicked = (index) => {
    const entity = currentBaseEntities[index];
    updateSelectedEntity(entity);
    setEntity(entity.name);
  };

  const handleRelatedEntityClicked = (index) => {
    const entity = currentRelatedEntitiesArray[index];
    updateSelectedEntity(entity);
    setEntity(entity.name);
  };

  return (
    <>
      <div className={styles.entityIconList} aria-label="base-entity-icons-list">
        <HCTooltip id="reference-tooltip" text="Return to the main side panel." placement="top">
          <ChevronDoubleRight className={styles.chevronBack} onClick={closeSpecificSidebar} aria-label="base-entity-icons-list-close"/>
        </HCTooltip>
        {currentBaseEntities.map(({color, icon, name}, index) =>
          <div key={name} aria-label={`base-entity-icon-${name}`} style={{backgroundColor: color}} className={styles.entityIconListItem} onClick={() => handleBaseEntityClicked(index)}>
            <FontAwesomeIcon icon={Icons[icon]}/>
          </div>
        )}
      </div>
      <div className={styles.separator}></div>
      {currentRelatedEntitiesArray.length > 0 &&
        <div className={styles.relatedEntityIconList} aria-label="related-entity-icons-list">
          {currentRelatedEntitiesArray.map(({color, icon, name}, index) =>
            <div key={name} aria-label={`related-entity-icon-${name}`}  style={{backgroundColor: color}} className={styles.entityIconListItem} onClick={() => handleRelatedEntityClicked(index)}>
              <FontAwesomeIcon icon={Icons[icon]}/>
            </div>
          )}
        </div>
      }
    </>
  );
};

export default EntityIconsSidebar;
