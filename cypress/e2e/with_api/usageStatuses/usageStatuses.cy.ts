import { addUsageStatuses, deleteUsageStatuses } from './functions';

describe('Usage Statuses', () => {
  beforeEach(() => {
    cy.visit('/settings/usage-statuses');
    cy.setMode({ admin: true });
  });
  afterEach(() => {
    cy.clearMocks();
  });

  it('CRD for usage statuses', () => {
    addUsageStatuses(['New-test', 'In Use-test', 'Used-test', 'Scrapped-test']);
    deleteUsageStatuses([
      'New-test',
      'In Use-test',
      'Used-test',
      'Scrapped-test',
    ]);
  });
});
