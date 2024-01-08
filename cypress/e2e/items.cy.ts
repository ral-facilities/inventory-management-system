describe('Items', () => {
  beforeEach(() => {
    cy.visit('/catalogue/item/1/items');
  });
  afterEach(() => {
    cy.clearMocks();
  });
  it('should be able to navigate back to the catalogue catalogue item table view', () => {
    cy.findByRole('link', { name: 'Back to Cameras table view' }).click();
    cy.findByText('Cameras 1').should('be.visible');
    cy.findByText('Cameras 2').should('be.visible');
    cy.findByText('Cameras 3').should('be.visible');
  });

  it('should be able to navigate back to the catalogue catalogue item landing page', () => {
    cy.findByRole('link', { name: 'Back to Cameras 1 landing page' }).click();
    cy.findByText('Cameras 1').should('be.visible');
    cy.findByText(
      'High-resolution cameras for beam characterization. 1'
    ).should('be.visible');
    cy.findByText('Older than five years').should('be.visible');
  });

  it('adds a item with only mandatory fields', () => {
    cy.findByRole('button', { name: 'Add Item' }).click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/items/',
    }).should(async (postRequests) => {
      expect(postRequests.length).eq(1);
      expect(JSON.stringify(await postRequests[0].json())).equal(
        JSON.stringify({
          catalogue_item_id: '1',
          system_id: null,
          purchase_order_number: null,
          is_defective: false,
          usage_status: 0,
          warranty_end_date: null,
          asset_number: null,
          serial_number: null,
          delivered_date: null,
          notes: null,
          properties: [
            { name: 'Resolution', value: 12 },
            { name: 'Frame Rate', value: 30 },
            { name: 'Sensor Type', value: 'CMOS' },
            { name: 'Broken', value: true },
            { name: 'Older than five years', value: false },
          ],
        })
      );
    });
  });

  it('adds a item with all fields altered', () => {
    cy.findByRole('button', { name: 'Add Item' }).click();

    cy.findByLabelText('Serial number').type('test1234');
    cy.findByLabelText('Asset number').type('test13221');
    cy.findByLabelText('Purchase order number').type('test23');
    cy.findByLabelText('Warranty end date').type('12/02/2028');
    cy.findByLabelText('Delivered date').type('12/02/2028');
    cy.findByLabelText('Is defective *').click();
    cy.findByText('Yes').click();
    cy.findByLabelText('Usage status *').click();
    cy.findByText('Scrapped').click();
    cy.findByLabelText('Notes').type('test');

    cy.findByLabelText('Resolution (megapixels) *').type('18');
    cy.findByLabelText('Frame Rate (fps)').type('60');
    cy.findByLabelText('Sensor Type *').type('IO');
    cy.findByLabelText('Sensor brand').type('pixel');
    cy.findByLabelText('Broken *').click();
    cy.findByRole('option', { name: 'False' }).click();
    cy.findByLabelText('Older than five years').click();
    cy.findByRole('option', { name: 'True' }).click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/items/',
    }).should(async (postRequests) => {
      expect(postRequests.length).eq(1);
      expect(JSON.stringify(await postRequests[0].json())).equal(
        JSON.stringify({
          catalogue_item_id: '1',
          system_id: null,
          purchase_order_number: 'test23',
          is_defective: true,
          usage_status: 3,
          warranty_end_date: '2028-02-11T00:00:00.000Z',
          asset_number: 'test13221',
          serial_number: 'test1234',
          delivered_date: '2028-02-11T00:00:00.000Z',
          notes: 'test',
          properties: [
            { name: 'Resolution', value: 1218 },
            { name: 'Frame Rate', value: 3060 },
            { name: 'Sensor Type', value: 'CMOSIO' },
            { name: 'Sensor brand', value: 'pixel' },
            { name: 'Broken', value: false },
            { name: 'Older than five years', value: true },
          ],
        })
      );
    });
  });

  it('displays messages for incorrect input types', () => {
    cy.findByRole('button', { name: 'Add Item' }).click();

    cy.findByLabelText('Warranty end date').type('12/02/');
    cy.findByLabelText('Delivered date').type('12/02/');

    cy.findByLabelText('Resolution (megapixels) *').clear();
    cy.findByLabelText('Sensor Type *').clear();
    cy.findByLabelText('Broken *').click();
    cy.findByRole('option', { name: 'None' }).click();

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findAllByText('This field is mandatory').should('have.length', 2);
    cy.findAllByText('Date format: dd/MM/yyyy').should('have.length', 2);
  });
});
