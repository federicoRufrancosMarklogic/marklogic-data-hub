/// <reference types="cypress"/>

import modelPage from '../../support/pages/model';
import {
  entityTypeModal,
  entityTypeTable,
  propertyModal,
  propertyTable,
  structuredTypeModal
} from '../../support/components/model/index';
import { confirmationModal, toolbar, tiles } from '../../support/components/common/index';
import { Application } from '../../support/application.config';
import { ConfirmationType } from '../../support/types/modeling-types';
import 'cypress-wait-until';

describe('Entity Modeling: Writer Role', () => {

  //login with valid account
  beforeEach(() => {
    cy.visit('/');
    cy.contains(Application.title);
    console.log(Cypress.env('mlHost'));
    cy.loginAsTestUserWithRoles("hub-central-entity-model-reader", "hub-central-entity-model-writer", "hub-central-saved-query-user").withRequest()
    cy.waitUntil(() => toolbar.getModelToolbarIcon().should('have.css', 'cursor', 'pointer')).click();
    entityTypeTable.waitForTableToLoad();
  });

  after(() => {
      //resetting the test user back to only have 'hub-central-user' role
      cy.resetTestUser();
  });

  it('can edit, can navigate and see persisted edits, can see navigation warning when logging out with edits', () => {
    cy.waitUntil(() => entityTypeTable.getExpandEntityIcon('Customer')).click();
    propertyTable.editProperty('nicknames');
    propertyModal.clickCheckbox('facetable');
    propertyModal.clickCheckbox('sortable');
    propertyModal.getSubmitButton().click();
    propertyTable.getFacetIcon('nicknames').should('exist');
    propertyTable.getSortIcon('nicknames').should('exist');
    modelPage.getEntityModifiedAlert().should('exist');

    toolbar.getExploreToolbarIcon().click();
    cy.waitUntil(() => tiles.getExploreTile());
    cy.url().should('include', '/tiles/explore');

    toolbar.getModelToolbarIcon().click();
    tiles.getModelTile().should('exist');
    cy.waitUntil(() => entityTypeTable.getExpandEntityIcon('Customer')).click();
    modelPage.getEntityModifiedAlert().should('exist');
    propertyTable.getFacetIcon('nicknames').should('exist');
    propertyTable.getSortIcon('nicknames').should('exist');

    cy.get('.userDropdown').trigger('mouseover');
    cy.waitUntil(() => cy.get('#logOut').should('be.visible')).click();
    confirmationModal.getNavigationWarnText().should('be.visible');
    confirmationModal.getYesButton(ConfirmationType.NavigationWarn).click();
    cy.location('pathname').should('eq', '/');
  });

  it('can add new properties to existing Entity, revert the entity, and delete shows step warning', () => {
    // Adding property to Order entity
    entityTypeTable.getExpandEntityIcon('Order').click();
    propertyTable.getAddPropertyButton('Order').click();

    propertyModal.newPropertyName('orderID');
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('string').click();
    propertyModal.getNoRadio('identifier').click();
    propertyModal.getYesRadio('multiple').click();
    propertyModal.getYesRadio('pii').click();
    //propertyModal.clickCheckbox('wildcard');
    propertyModal.getSubmitButton().click();

    modelPage.getEntityModifiedAlert().should('exist');

    propertyTable.getMultipleIcon('orderID').should('exist');
    propertyTable.getPiiIcon('orderID').should('exist');
    //propertyTable.getWildcardIcon('orderID').should('exist');

    entityTypeTable.getRevertEntityIcon('Order').should('exist');
    entityTypeTable.getRevertEntityIcon('Order').click();
    confirmationModal.getYesButton(ConfirmationType.RevertEntity).click();
    confirmationModal.getRevertEntityText().should('exist');
    confirmationModal.getRevertEntityText().should('not.exist');

    propertyTable.getMultipleIcon('orderID').should('not.exist');
    propertyTable.getPiiIcon('orderID').should('not.exist');
    modelPage.getEntityModifiedAlert().should('not.exist');
    //propertyTable.getWildcardIcon('orderID').should('not.exist');

    // Adding property to Person entity
    entityTypeTable.getExpandEntityIcon('Person').click();
    propertyTable.getAddPropertyButton('Person').click();

    propertyModal.newPropertyName('newID');
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('string').click();
    propertyModal.getNoRadio('identifier').click();
    propertyModal.getYesRadio('multiple').click();
    propertyModal.getYesRadio('pii').click();
    //propertyModal.clickCheckbox('wildcard');
    propertyModal.clickCheckbox('facetable');
    propertyModal.clickCheckbox('sortable');
    propertyModal.getSubmitButton().click();

    propertyTable.getMultipleIcon('newID').should('exist');
    propertyTable.getPiiIcon('newID').should('exist');
    //propertyTable.getWildcardIcon('newID').should('exist');
    propertyTable.getFacetIcon('newID').should('exist');
    propertyTable.getSortIcon('newID').should('exist');

    // show identifier confirm modal, and then show delete property confim modal
    propertyTable.editProperty('lname');
    propertyModal.getYesRadio('identifier').click();
    confirmationModal.getYesButton(ConfirmationType.Identifer).click();
    propertyModal.getYesRadio('identifier').should('be.checked');

    propertyModal.getDeleteIcon('lname').click();
    confirmationModal.getDeletePropertyStepWarnText().should('exist');
    confirmationModal.getNoButton(ConfirmationType.DeletePropertyStepWarn).click();
    propertyModal.getCancelButton().click();
    propertyTable.getProperty('lname').should('exist');

    propertyTable.editProperty('fname');
    cy.waitUntil(() => propertyModal.getToggleStepsButton().should('exist')).click();
    cy.contains('mapPersonJSON').should('be.visible');
    cy.contains('match-person').should('be.visible');
    cy.contains('merge-person').should('be.visible');
    cy.contains('master-person').should('be.visible');
    cy.contains('Hide Steps...').should('be.visible');

    cy.contains('Show Steps...').should('not.be.visible');

    propertyModal.getToggleStepsButton().click();

    cy.contains('Show Steps...').should('be.visible');

    cy.contains('mapPersonJSON').should('not.be.visible');
    cy.contains('match-person').should('not.be.visible');
    cy.contains('merge-person').should('not.be.visible');
    cy.contains('master-person').should('not.be.visible');
    cy.contains('Hide Steps...').should('not.be.visible');
    propertyModal.getCancelButton().click();

    entityTypeTable.getDeleteEntityIcon('Person').click();
    cy.contains('Entity type is used in one or more steps.').should('be.visible');
    cy.contains('Show Steps...').should('be.visible');
    cy.contains('Hide Steps...').should('not.be.visible');

    confirmationModal.getToggleStepsButton().click();
    cy.contains('mapPersonJSON').should('be.visible');
    cy.contains('Hide Steps...').should('be.visible');
    cy.contains('Show Steps...').should('not.be.visible');

    confirmationModal.getCloseButton(ConfirmationType.DeleteEntityStepWarn).click();
    entityTypeTable.getEntity('Person').should('exist');

    modelPage.getRevertAllButton().click();
    confirmationModal.getYesButton(ConfirmationType.RevertAll).click();
    confirmationModal.getRevertAllEntityText().should('exist');
    confirmationModal.getRevertAllEntityText().should('not.exist');
  });

  it('can check for duplicate entity, create a new entity, add relationship type, and add identifier confirmation, delete property from modal, and delete entity', () => {
    cy.waitUntil(() => modelPage.getAddEntityButton()).click();
    entityTypeModal.newEntityName('Person');
    entityTypeModal.getAddButton().click();
    cy.contains('An entity type already exists with a name of Person').should('be.visible');
    entityTypeModal.getAddButton().should('not.be.disabled');

    entityTypeModal.clearEntityName();
    entityTypeModal.newEntityName('Product');
    entityTypeModal.newEntityDescription('An entity for Products');
    entityTypeModal.getAddButton().click();

    propertyTable.getAddPropertyButton('Product').trigger('mouseover');
    cy.contains(`Click to add properties to this entity type.`).should('be.visible');
    propertyTable.getAddPropertyButton('Product').click();

    propertyModal.newPropertyName('user');
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('Relationship').click();
    propertyModal.getCascadedTypeFromDropdown('Person').click();
    propertyModal.getYesRadio('multiple').click();
    propertyModal.getSubmitButton().click();

    propertyTable.getMultipleIcon('user').should('exist');

    //Add cascaded type with identifer
    propertyTable.getAddPropertyButton('Product').click();
    propertyModal.newPropertyName('newId');
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('More string types').click();
    propertyModal.getCascadedTypeFromDropdown('hexBinary').click();

    propertyModal.getYesRadio('identifier').click();
    propertyModal.getYesRadio('multiple').click();
    propertyModal.getNoRadio('pii').click();
    //propertyModal.clickCheckbox('wildcard');
    propertyModal.getSubmitButton().click();

    propertyTable.getIdentifierIcon('newId').should('exist');
    propertyTable.getMultipleIcon('newId').should('exist');
    //propertyTable.getWildcardIcon('newId').should('exist');

    // add basic type with identifier, show confirmation modal
    propertyTable.getAddPropertyButton('Product').click();
    propertyModal.newPropertyName('product-id');
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('string').click();

    propertyModal.getYesRadio('identifier').click();
    confirmationModal.getYesButton(ConfirmationType.Identifer).click()
    propertyModal.getSubmitButton().click();

    propertyTable.getIdentifierIcon('newId').should('not.exist');
    propertyTable.getIdentifierIcon('product-id').should('exist');

    // edit property and change type to relationship
    propertyTable.editProperty('product-id');
    propertyModal.getToggleStepsButton().should('not.exist')
    propertyModal.clearPropertyName();
    propertyModal.newPropertyName('user-id');
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('Relationship').click();
    propertyModal.getCascadedTypeFromDropdown('Customer').click();

    propertyModal.getYesRadio('idenifier').should('not.exist');
    propertyModal.getYesRadio('multiple').click();
    propertyModal.getNoRadio('pii').should('not.exist');
    propertyModal.getSubmitButton().click();

    propertyTable.getMultipleIcon('user-id').should('exist');
    propertyTable.getIdentifierIcon('user-id').should('not.exist');
    propertyTable.getPiiIcon('user-id').should('not.exist');
    //propertyTable.getWildcardIcon('user-id').should('not.exist');

    propertyTable.editProperty('newId');
    propertyModal.getDeleteIcon('newId').click();
    confirmationModal.getDeletePropertyWarnText().should('exist');
    confirmationModal.getYesButton(ConfirmationType.DeletePropertyWarn).click();
    propertyTable.getProperty('newId').should('not.exist');

    entityTypeTable.getSaveEntityIcon('Product').click();
    confirmationModal.getYesButton(ConfirmationType.SaveEntity).click();
    confirmationModal.getSaveEntityText().should('exist');
    confirmationModal.getSaveEntityText().should('not.exist');

    entityTypeTable.getDeleteEntityIcon('Product').click();
    confirmationModal.getYesButton(ConfirmationType.DeleteEntity).click();
    confirmationModal.getDeleteEntityText().should('exist');
    confirmationModal.getDeleteEntityText().should('not.exist');
    entityTypeTable.getEntity('Product').should('not.exist');
  });

  it('create new entity types, add relationship type, delete entity type with outstanding edits', () => {
    cy.waitUntil(() => modelPage.getAddEntityButton()).click();
    entityTypeModal.newEntityName('User');
    entityTypeModal.getAddButton().click();
    cy.waitForModalToDisappear();

    cy.waitUntil(() => modelPage.getAddEntityButton()).click();
    entityTypeModal.newEntityName('Product');
    entityTypeModal.getAddButton().click();

    propertyTable.getAddPropertyButton('Product').trigger('mouseover');
    cy.contains(`Click to add properties to this entity type.`).should('be.visible');
    propertyTable.getAddPropertyButton('Product').click();

    // add relation type property for 'User' and save
    propertyModal.newPropertyName('user');
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('Relationship').click();
    propertyModal.getCascadedTypeFromDropdown('User').click();
    propertyModal.getSubmitButton().click();

    modelPage.getSaveAllButton().click();
    confirmationModal.getYesButton(ConfirmationType.SaveAll).click();
    confirmationModal.getSaveAllEntityText().should('exist');
    confirmationModal.getSaveAllEntityText().should('not.exist');

    // add basic type property but dont save
    propertyTable.getAddPropertyButton('Product').click();
    propertyModal.newPropertyName('product-id');
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('string').click();
    propertyModal.getSubmitButton().click();
    propertyTable.getProperty('product-id').should('exist');


    // delete 'User' entity type
    entityTypeTable.getDeleteEntityIcon('User').click();
    confirmationModal.getYesButton(ConfirmationType.DeleteEntityRelationshipOutstandingEditWarn).click();
    confirmationModal.getDeleteEntityRelationshipEditText().should('exist');
    confirmationModal.getDeleteEntityRelationshipEditText().should('not.exist');
    entityTypeTable.getEntity('User').should('not.exist');
    propertyTable.getProperty('product-id').should('exist');


    // add 'User' entity type again
    cy.waitUntil(() => modelPage.getAddEntityButton()).click();
    entityTypeModal.newEntityName('User');
    entityTypeModal.getAddButton().click();
    cy.waitForModalToDisappear();

    // add basic type property but dont save
    propertyTable.getAddPropertyButton('User').click();
    propertyModal.newPropertyName('user-id');
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('string').click();
    propertyModal.getSubmitButton().click();
    propertyTable.getProperty('user-id').should('exist');

    // delete 'Product' entity type
    entityTypeTable.getDeleteEntityIcon('Product').click();
    confirmationModal.getYesButton(ConfirmationType.DeleteEntityNoRelationshipOutstandingEditWarn).click();
    confirmationModal.getDeleteEntityNoRelationshipEditText().should('exist');
    confirmationModal.getDeleteEntityNoRelationshipEditText().should('not.exist');
    entityTypeTable.getEntity('Product').should('not.exist');
    propertyTable.getProperty('user-id').should('exist');

    // finally delete 'User' entity type
    entityTypeTable.getDeleteEntityIcon('User').click();
    confirmationModal.getYesButton(ConfirmationType.DeleteEntity).click();
    confirmationModal.getDeleteEntityText().should('exist');
    confirmationModal.getDeleteEntityText().should('not.exist');
    entityTypeTable.getEntity('User').should('not.exist');
  });

  it('can create entity, can create a structured type, add properties to structure type, add structure type as property, delete structured type, and delete entity', () => {
    cy.waitUntil(() => modelPage.getAddEntityButton()).click();
    entityTypeModal.newEntityName('User');
    entityTypeModal.newEntityDescription('An entity for User');
    entityTypeModal.getAddButton().click();

    propertyTable.getAddPropertyButton('User').click();
    propertyModal.newPropertyName('address');
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('Structured').click();
    propertyModal.getCascadedTypeFromDropdown('New Property Type').click();

    structuredTypeModal.newName('Address');
    structuredTypeModal.getAddButton().click();

    propertyModal.getYesRadio('multiple').click();
    propertyModal.getSubmitButton().click();

    propertyTable.getMultipleIcon('address').should('exist');

    // add basic property to structured type
    propertyTable.getAddPropertyToStructureType('Address').should('exist').trigger('mouseover');
    cy.contains(`Click to add properties within this structured property.`).should('be.visible');
    propertyTable.getAddPropertyToStructureType('Address').click({ force: true });
    propertyModal.getStructuredTypeName().should('have.text', 'Address');
    propertyModal.newPropertyName('street');
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('More string types').click();
    propertyModal.getCascadedTypeFromDropdown('hexBinary').click();

    propertyModal.getNoRadio('multiple').click();
    propertyModal.getYesRadio('pii').click();
    //propertyModal.clickCheckbox('wildcard');
    propertyModal.getSubmitButton().click();

    propertyTable.getMultipleIcon('street').should('not.exist');
    propertyTable.getPiiIcon('street').should('exist');
    //propertyTable.getWildcardIcon('street').should('exist');

    // add structured property to structured type
    propertyTable.getAddPropertyToStructureType('Address').click({ force: true });
    propertyModal.newPropertyName('zip')
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('Structured').click();
    propertyModal.getCascadedTypeFromDropdown('New Property Type').click();

    structuredTypeModal.newName('Zip');
    structuredTypeModal.getAddButton().click();

    propertyModal.getYesRadio('multiple').click();
    propertyModal.getNoRadio('pii').click();
    propertyModal.getSubmitButton().click();

    propertyTable.getMultipleIcon('zip').should('exist');
    propertyTable.getPiiIcon('zip').should('not.exist');
    //propertyTable.getWildcardIcon('zip').should('not.exist');

    // add properties to nested structured type
    propertyTable.getAddPropertyToStructureType('Zip').should('exist').trigger('mouseover');
    cy.contains(`Click to add properties within this structured property.`).should('be.visible');
    propertyTable.getAddPropertyToStructureType('Zip').click({ force: true });

    propertyModal.getStructuredTypeName().should('have.text', 'Address.Zip');
    propertyModal.newPropertyName('fiveDigit')
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('More number types').click();
    propertyModal.getCascadedTypeFromDropdown('int').click();
    propertyModal.getSubmitButton().click();

    propertyTable.getMultipleIcon('code').should('not.exist');
    propertyTable.getPiiIcon('code').should('not.exist');
    //propertyTable.getWildcardIcon('code').should('not.exist');

    // Test for additional nesting of structured types
    propertyTable.getAddPropertyToStructureType('Zip').click({ force: true });
    propertyModal.newPropertyName('extra')
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('Structured').click();
    propertyModal.getCascadedTypeFromDropdown('New Property Type').click();

    structuredTypeModal.newName('Extra');
    structuredTypeModal.getAddButton().click();

    propertyModal.getSubmitButton().click();

    propertyTable.getAddPropertyToStructureType('Extra').should('exist').trigger('mouseover');
    cy.contains(`Click to add properties within this structured property.`).should('be.visible');
    propertyTable.getAddPropertyToStructureType('Extra').click({ force: true });

    propertyModal.newPropertyName('fourDigit')
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('integer').click();
    propertyModal.getYesRadio('pii').click();
    //propertyModal.clickCheckbox('wildcard');
    propertyModal.getSubmitButton().click();

    propertyTable.expandStructuredTypeIcon('extra').click();
    propertyTable.getMultipleIcon('fourDigit').should('not.exist');
    propertyTable.getPiiIcon('fourDigit').should('exist');
    //propertyTable.getWildcardIcon('fourDigit').should('exist');

    //Edit Property Structured Property
    propertyTable.editProperty('street');
    propertyModal.getToggleStepsButton().should('not.exist')
    propertyModal.clearPropertyName();
    propertyModal.newPropertyName('Zip');
    propertyModal.getSubmitButton().click();
    cy.contains(`A property already exists with a name of Zip`).should('be.visible');
    propertyModal.clearPropertyName();

    propertyModal.newPropertyName('streetAlt');
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('More string types').click();
    propertyModal.getCascadedTypeFromDropdown('base64Binary').click();

    propertyModal.getYesRadio('idenifier').should('not.exist');
    propertyModal.getYesRadio('multiple').click();
    propertyModal.getNoRadio('pii').click();
    //propertyModal.clickCheckbox('wildcard');
    propertyModal.getSubmitButton().click();

    propertyTable.getMultipleIcon('streetAlt').should('exist');
    propertyTable.getPiiIcon('streetAlt').should('not.exist');
    //propertyTable.getWildcardIcon('streetAlt').should('exist');

    //rename property and change type from structured to relationship
    propertyTable.editProperty('address');
    propertyModal.clearPropertyName();
    propertyModal.newPropertyName('alt_address');

    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('Relationship').click();
    propertyModal.getCascadedTypeFromDropdown('Person').click();

    propertyModal.getYesRadio('multiple').click();
    propertyModal.getYesRadio('idenifier').should('not.exist');
    propertyModal.getYesRadio('pii').should('not.exist');
    //propertyModal.getCheckbox('wildcard').should('not.exist');

    propertyModal.getSubmitButton().click();

    propertyTable.getMultipleIcon('alt_address').should('exist');
    propertyTable.getIdentifierIcon('alt_address').should('not.exist');
    propertyTable.getPiiIcon('alt_address').should('not.exist');

    // change relationship property to structured
    propertyTable.editProperty('alt_address');
    propertyModal.getToggleStepsButton().should('not.exist')
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('Structured').click();
    propertyModal.getCascadedTypeFromDropdown('Address').click();
    propertyModal.getSubmitButton().click();
    propertyTable.expandStructuredTypeIcon('alt_address').click();
    propertyTable.getProperty('streetAlt').should('exist');

    // delete structured property
    propertyTable.getDeleteStructuredPropertyIcon('User', 'Address', 'streetAlt').click();
    confirmationModal.getDeletePropertyWarnText().should('exist');
    confirmationModal.getYesButton(ConfirmationType.DeletePropertyWarn).click();
    propertyTable.getProperty('streetAlt').should('not.exist');

    propertyTable.getDeletePropertyIcon('User', 'alt_address').click();
    confirmationModal.getDeletePropertyWarnText().should('exist');
    confirmationModal.getYesButton(ConfirmationType.DeletePropertyWarn).click();
    propertyTable.getProperty('alt_address').should('not.exist');

    entityTypeTable.getSaveEntityIcon('User').click();
    confirmationModal.getYesButton(ConfirmationType.SaveEntity).click();
    confirmationModal.getSaveEntityText().should('exist');
    confirmationModal.getSaveEntityText().should('not.exist');

    entityTypeTable.getDeleteEntityIcon('User').click();
    confirmationModal.getYesButton(ConfirmationType.DeleteEntity).click();
    confirmationModal.getDeleteEntityText().should('exist');
    confirmationModal.getDeleteEntityText().should('not.exist');
    entityTypeTable.getEntity('User').should('not.exist');
  });

  it('can add new properties to existing Entities, revert all entities, add multiple entities, add properties, delete properties, and save all entities', () => {
    // Adding property to Order entity
    entityTypeTable.getExpandEntityIcon('Order').click();
    propertyTable.getAddPropertyButton('Order').click();

    propertyModal.newPropertyName('orderID');
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('string').click();
    propertyModal.getNoRadio('identifier').click();
    propertyModal.getYesRadio('multiple').click();
    propertyModal.getYesRadio('pii').click();
    //propertyModal.clickCheckbox('wildcard');
    propertyModal.getSubmitButton().click();

    propertyTable.getMultipleIcon('orderID').should('exist');
    propertyTable.getPiiIcon('orderID').should('exist');
    //propertyTable.getWildcardIcon('orderID').should('exist');

    modelPage.getEntityModifiedAlert().should('exist');


    // Adding property to Person entity
    entityTypeTable.getExpandEntityIcon('Person').click();
    propertyTable.getAddPropertyButton('Person').click();

    propertyModal.newPropertyName('personID');
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('string').click();
    propertyModal.getNoRadio('identifier').click();
    propertyModal.getYesRadio('multiple').click();
    propertyModal.getYesRadio('pii').click();
    //propertyModal.clickCheckbox('wildcard');
    propertyModal.getSubmitButton().click();

    propertyTable.getMultipleIcon('personID').should('exist');
    propertyTable.getPiiIcon('personID').should('exist');
    //propertyTable.getWildcardIcon('personID').should('exist');


    modelPage.getRevertAllButton().should('exist');
    modelPage.getRevertAllButton().click();
    confirmationModal.getYesButton(ConfirmationType.RevertAll).click();
    confirmationModal.getRevertAllEntityText().should('exist');
    confirmationModal.getRevertAllEntityText().should('not.exist');

    propertyTable.getMultipleIcon('personID').should('not.exist');
    propertyTable.getPiiIcon('personID').should('not.exist');
    //propertyTable.getWildcardIcon('personID').should('not.exist');
    propertyTable.getMultipleIcon('orderID').should('not.exist');
    propertyTable.getPiiIcon('orderID').should('not.exist');
    //propertyTable.getWildcardIcon('orderID').should('not.exist');
    modelPage.getEntityModifiedAlert().should('not.exist');

    // Create first entity
    modelPage.getAddEntityButton().should('exist');
    modelPage.getAddEntityButton().click();
    entityTypeModal.newEntityName('Concept');
    entityTypeModal.newEntityDescription('A concept entity');
    entityTypeModal.getAddButton().click();

    propertyTable.getAddPropertyButton('Concept').should('exist').trigger('mouseover');
    cy.contains(`Click to add properties to this entity type.`).should('be.visible');
    propertyTable.getAddPropertyButton('Concept').click();

    propertyModal.newPropertyName('order');
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('Relationship').click();
    propertyModal.getCascadedTypeFromDropdown('Order').click();
    propertyModal.getYesRadio('multiple').click();
    propertyModal.getSubmitButton().click();

    propertyTable.getMultipleIcon('order').should('exist');

    propertyTable.getAddPropertyButton('Concept').click();
    propertyModal.newPropertyName('testing');
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('More date types').click();    
    propertyModal.getCascadedTypeFromDropdown('gDat').click();
    propertyModal.getSubmitButton().click();

    propertyTable.getDeletePropertyIcon('Concept','testing').should('exist');
    propertyTable.getDeletePropertyIcon('Concept','testing').click();
    confirmationModal.getDeletePropertyWarnText().should('exist');
    confirmationModal.getYesButton(ConfirmationType.DeletePropertyWarn).click();
    propertyTable.getProperty('testing').should('not.exist');

    modelPage.getEntityModifiedAlert().should('exist');

    //create second Entity
    modelPage.getAddEntityButton().should('exist').click();
    //modelPage.getAddEntityButton().click();
    entityTypeModal.newEntityName('Patient');
    entityTypeModal.newEntityDescription('An entity for patients');
    entityTypeModal.getAddButton().click();

    propertyTable.getAddPropertyButton('Patient').should('exist').trigger('mouseover');
    cy.contains(`Click to add properties to this entity type.`).should('be.visible');
    propertyTable.getAddPropertyButton('Patient').click();
    propertyModal.newPropertyName('patientID');
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('More number types').click();
    propertyModal.getCascadedTypeFromDropdown('byte').click();
    propertyModal.getYesRadio('identifier').click();
    //propertyModal.clickCheckbox('wildcard');
    propertyModal.getSubmitButton().click();

    propertyTable.getIdentifierIcon('patientID').should('exist');
    //propertyTable.getWildcardIcon('patientID').should('exist');

    propertyTable.getAddPropertyButton('Patient').should('exist');
    propertyTable.getAddPropertyButton('Patient').click();
    propertyModal.newPropertyName('conceptType');
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('Relationship').click();
    propertyModal.getCascadedTypeFromDropdown('Concept').click();
    propertyModal.getSubmitButton().click();

    propertyTable.getProperty('conceptType').should('exist');

    // add second property and delete it
    propertyTable.getAddPropertyButton('Patient').click();
    propertyModal.newPropertyName('patientId');
    propertyModal.openPropertyDropdown();
    propertyModal.getTypeFromDropdown('More number types').click();    
    propertyModal.getCascadedTypeFromDropdown('byte').click();
    propertyModal.getSubmitButton().click();

    propertyTable.editProperty('patientId');
    propertyModal.getDeleteIcon('patientId').click();
    confirmationModal.getDeletePropertyWarnText().should('exist');
    confirmationModal.getYesButton(ConfirmationType.DeletePropertyWarn).click();
    propertyTable.getProperty('patientId').should('not.exist');

    modelPage.getSaveAllButton().click();
    confirmationModal.getYesButton(ConfirmationType.SaveAll).click();
    confirmationModal.getSaveAllEntityText().should('exist');
    confirmationModal.getSaveAllEntityText().should('not.exist');

    modelPage.getEntityModifiedAlert().should('not.exist');

    entityTypeTable.getDeleteEntityIcon('Concept').click();
    confirmationModal.getYesButton(ConfirmationType.DeleteEntityRelationshipWarn).click();
    confirmationModal.getDeleteEntityRelationshipText().should('exist');
    confirmationModal.getDeleteEntityRelationshipText().should('not.exist');

    entityTypeTable.getEntity('Concept').should('not.exist');
    propertyTable.getProperty('conceptType').should('not.exist');

    entityTypeTable.getDeleteEntityIcon('Patient').click();
    confirmationModal.getYesButton(ConfirmationType.DeleteEntity).click();
    confirmationModal.getDeleteEntityText().should('exist');
    confirmationModal.getDeleteEntityText().should('not.exist');
    entityTypeTable.getEntity('Patient').should('not.exist');
  });
});
