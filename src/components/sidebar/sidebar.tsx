import React, { useState, useEffect, useContext } from 'react';
import { Collapse, Icon, Button, DatePicker, Tooltip } from 'antd';
import moment from 'moment';
import Facet from '../facet/facet';
import SelectedFacets from '../selected-facets/selected-facets';
import { SearchContext } from '../../util/search-context';
import { facetParser } from '../../util/data-conversion';
import hubPropertiesConfig from '../../config/hub-properties.config';
import tooltipsConfig from '../../config/tooltips.config';
import styles from './sidebar.module.scss';

const { Panel } = Collapse;
const { RangePicker } = DatePicker;
const tooltips = tooltipsConfig.browseDocuments;

interface Props {
  facets: any;
  selectedEntities: string[];
  entityDefArray: any[];
};

const Sidebar:React.FC<Props> = (props) => {
  const { 
    searchOptions,
    setDateFacet,
    clearDateFacet
   } = useContext(SearchContext);
  const [entityFacets, setEntityFacets] = useState<any[]>([]);
  const [hubFacets, setHubFacets] = useState<any[]>([]);
  const [selectedFacets, setSelectedFacets] = useState<any[]>([]);
  const [datePickerValue, setDatePickerValue] = useState<any[]>([null, null]);

  useEffect(() => {
    if (props.facets) {
      const parsedFacets = facetParser(props.facets);
      if (Object.entries(searchOptions.searchFacets).length === 0) {
        const filteredHubFacets = hubPropertiesConfig.map( hubFacet => {
          let hubFacetValues = parsedFacets.find(facet => facet.facetName === hubFacet.facetName);
          return hubFacetValues && {...hubFacet, ...hubFacetValues}
        });
        setHubFacets(filteredHubFacets);
      } else {
        // TODO check if hub filters need updates
      }

      if (props.selectedEntities.length && Object.entries(searchOptions.searchFacets).length === 0) {
        const entityDef = props.entityDefArray.find(entity => entity.name === props.selectedEntities[0]);
        const filteredEntityFacets = entityDef.rangeIndex.length && entityDef.rangeIndex.map( rangeIndex => {
          let entityFacetValues = parsedFacets.find(facet => facet.facetName === rangeIndex);
          return {...entityFacetValues}
        });

        setEntityFacets(filteredEntityFacets);
      } else {
        // update counts for the entity facets by setting all facet counts to 0 initially
        let updatedEntityFacetCounts: any[] = entityFacets.map( facet => {
          facet.facetValues.forEach( facetValue => {
            facetValue.count = 0;
          });
          return facet;
        });
        entityFacets.forEach( entityFacet => {
         // console.log('entity facet', entityFacet)
          let updatedFacet = parsedFacets.find(facet => facet.facetName === entityFacet.facetName);
          if (updatedFacet.facetValues.length) {
            updatedFacet.facetValues.forEach( facetValue => {
              let currentFacet = entityFacet.facetValues.find( entFacet => entFacet.name === facetValue.name);
              if (currentFacet) {
                // update facet counts
                currentFacet.count = facetValue.count;
                let index = updatedEntityFacetCounts.findIndex(facet => {
                  return facet.facetName === entityFacet.facetName
                });
                // find facetValue index and update it to current facet
                let facet = updatedEntityFacetCounts[index];
                let updateIndex = facet.facetValues.findIndex( facVal => facVal.name === currentFacet.name);
                facet.facetValues[updateIndex] = currentFacet;
                // sort count after updating the count
                facet.facetValues.sort((a, b) => (a.count < b.count) ? 1 : -1)
              }
            });
          }
        });
        setEntityFacets(updatedEntityFacetCounts);
      }

      if (Object.entries(searchOptions.searchFacets).length !== 0) {
        let selectedFacets: any[] = [];
        for( let constraint in searchOptions.searchFacets) {
          if (constraint === 'createdOnRange') {
            selectedFacets.push({ constraint, facet: searchOptions.searchFacets[constraint] })
          } else {
            searchOptions.searchFacets[constraint].map(facet => {
              selectedFacets.push({ constraint, facet });
            });
          }
          setSelectedFacets(selectedFacets);
        }
      } else {
        setSelectedFacets([]);
        setDatePickerValue([null, null]);
      }
    }
  }, [props.selectedEntities, props.facets]);

  const onDateChange = (dateVal, dateArray) => {
    if (dateVal.length > 1) {
      setDateFacet(dateArray);
      setDatePickerValue([moment(dateArray[0]), moment(dateArray[1])]);
    } else {
      clearDateFacet();
      setDatePickerValue([null, null]);
    }
  }

  return (
    <div className={styles.sideBarContainer} id={'sideBarContainer'}>
      <SelectedFacets selectedFacets={selectedFacets}/>
      <Collapse 
        className={styles.sideBarFacets}
        defaultActiveKey={['entityProperties']}
        expandIcon={panelProps => <Icon type="up" rotate={panelProps.isActive ? 0 : 180} />}
        expandIconPosition="right"
        bordered={false}
      >
        { props.selectedEntities.length === 1 && (
          <Panel id="entity-properties" header={<div className={styles.title}>Entity Properties</div>} key="entityProperties" style={{borderBottom: 'none'}}>
            { entityFacets.length ? entityFacets.map(facet => {
              return Object.entries(facet).length !== 0 && (
                <Facet
                  name={facet.hasOwnProperty('displayName') ? facet.displayName : facet.facetName}
                  constraint={facet.facetName}
                  facetValues={facet.facetValues}
                  key={facet.facetName}
                  tooltip=""
                />
              )
            }) :
            <div>No Facets</div>
            }
          </Panel>
        )}
        <Panel id="hub-properties" header={<div className={styles.title}>Hub Properties</div>} key="hubProperties" style={{borderBottom: 'none'}}>
          <Tooltip title={tooltips.createdOn} placement="topLeft">
            <div className={styles.facetName} data-cy='created-on-facet'>Created On</div>
          </Tooltip>
          <RangePicker 
            id="range-picker"
            className={styles.datePicker} 
            onChange={onDateChange} 
            value={datePickerValue}
          />
          { hubFacets.map(facet => {
            return facet && (
              <Facet
                name={facet.hasOwnProperty('displayName') ? facet.displayName : facet.facetName}
                constraint={facet.facetName}
                facetValues={facet.facetValues}
                key={facet.facetName}
                tooltip={facet.tooltip}
              />
            )
              })}
        </Panel>
    </Collapse>
  </div>
  );
}

export default Sidebar;