import { addUsageStatuses, deleteUsageStatuses } from './functions';

describe('Usage Statuses', () => {
  beforeEach(() => {
    cy.dropIMSCollections(['usage_statuses']);
    cy.visit('/admin-ims/usage-statuses');
  });
  afterEach(() => {
    cy.clearMocks();
    cy.dropIMSCollections(['usage_statuses']);
  });

  it('CRD for usage statuses', () => {
    addUsageStatuses(['New', 'In Use', 'Used', 'Scrapped']);
    deleteUsageStatuses(['New', 'In Use', 'Used', 'Scrapped']);
  });
});
