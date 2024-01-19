describe('Items', () => {
  beforeEach(() => {
    cy.visit('/catalogue/item/1/items');
  });
  afterEach(() => {
    cy.clearMocks();
  });
  it('should be able to navigate back to the catalogue catalogue item table view', () => {
    cy.findByRole('link', { name: 'cameras' }).click();
    cy.findByText('Cameras 1').should('be.visible');
    cy.findByText('Cameras 2').should('be.visible');
    cy.findByText('Cameras 3').should('be.visible');
  });

  it('should be able to navigate back to the catalogue home', () => {
    cy.findByRole('button', { name: 'navigate to catalogue home' }).click();
    cy.findByText('Motion').should('be.visible');
    cy.findByText('Beam Characterization').should('be.visible');
  });

  it('should be able to navigate back to the catalogue home step by step', () => {
    cy.visit('/catalogue/item/1/items/KvT2Ox7n');

    cy.findByRole('link', { name: 'Items' }).click();

    cy.findByText('5YUQDDjKpz2z').should('exist');
    cy.findByText('vYs9Vxx6yWbn').should('exist');
    cy.findByText('PcfCM1jp0SUV').should('exist');
    cy.findByText('Zf7P8Qu8TD8c').should('exist');

    cy.findByRole('link', { name: 'Cameras 1' }).click();

    cy.findByText(
      'High-resolution cameras for beam characterization. 1'
    ).should('exist');
    cy.findByText('Obsolete reason').should('exist');
    cy.findByText('Drawing Number').should('exist');

    cy.findByRole('link', { name: 'cameras' }).click();

    cy.findByText('Cameras 1').should('exist');
    cy.findByText('Cameras 2').should('exist');
    cy.findByText('Cameras 3').should('exist');
    cy.findByText('Cameras 4').should('exist');

    cy.findByRole('link', { name: 'beam-characterization' }).click();

    cy.findByText('Cameras').should('exist');
    cy.findByText('Energy Meters').should('exist');

    cy.findByRole('button', { name: 'navigate to catalogue home' }).click();
    cy.findByText('Motion').should('be.visible');
    cy.findByText('Beam Characterization').should('be.visible');
  });

  it('should be able to navigate back to the catalogue item landing page', () => {
    cy.findByRole('link', { name: 'Cameras 1' }).click();
    cy.findByText('Obsolete reason').should('be.visible');
    cy.findByText(
      'High-resolution cameras for beam characterization. 1'
    ).should('be.visible');
    cy.findByText('Older than five years').should('be.visible');
  });

  it('adds an item with only mandatory fields', () => {
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

  it('adds an item with all fields altered', () => {
    cy.findByRole('button', { name: 'Add Item' }).click();

    cy.findByLabelText('Serial number').type('test1234');
    cy.findByLabelText('Asset number').type('test13221');
    cy.findByLabelText('Purchase order number').type('test23');
    cy.findByLabelText('Warranty end date').type('12/02/2028');
    cy.findByLabelText('Delivered date').type('12/02/2028');
    cy.findByLabelText('Is defective *').click();
    cy.findByRole('option', { name: 'Yes' }).click();
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
          warranty_end_date: '2028-02-12T00:00:00.000Z',
          asset_number: 'test13221',
          serial_number: 'test1234',
          delivered_date: '2028-02-12T00:00:00.000Z',
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

    cy.findAllByText('Date format: dd/MM/yyyy').should('have.length', 2);
    cy.findByLabelText('Warranty end date').clear();
    cy.findByLabelText('Delivered date').clear();

    cy.findByLabelText('Warranty end date').type('12/02/4000');
    cy.findByLabelText('Delivered date').type('12/02/4000');
    cy.findAllByText('Exceeded maximum date').should('have.length', 2);

    cy.findByLabelText('Warranty end date').type('12/02/2000');
    cy.findByLabelText('Delivered date').type('12/02/2000');
    cy.findByText('Exceeded maximum date').should('not.exist');
    cy.findByText('Date format: dd/MM/yyyy').should('not.exist');

    cy.findByRole('button', { name: 'Save' }).click();

    cy.findAllByText('This field is mandatory').should('have.length', 2);
    cy.findByText('Please select either True or False').should('exist');

    cy.findByLabelText('Resolution (megapixels) *').type('test');
    cy.findByLabelText('Sensor Type *').type('test');
    cy.findByLabelText('Broken *').click();
    cy.findByRole('option', { name: 'True' }).click();

    cy.findByText('Please select either True or False').should('not.exist');
    cy.findAllByText('This field is mandatory').should('not.exist');
  });

  it('sets the table filters and clears the table filters', () => {
    cy.findByText('5YUQDDjKpz2z').should('exist');
    cy.findByText('vYs9Vxx6yWbn').should('exist');
    cy.findByText('PcfCM1jp0SUV').should('exist');
    cy.findByText('Zf7P8Qu8TD8c').should('exist');
    cy.findByRole('button', { name: 'Clear Filters' }).should('be.disabled');
    cy.findByLabelText('Filter by Serial Number').type('5y');
    cy.findByText('vYs9Vxx6yWbn').should('not.exist');
    cy.findByText('PcfCM1jp0SUV').should('not.exist');
    cy.findByText('Zf7P8Qu8TD8c').should('not.exist');
    cy.findByRole('button', { name: 'Clear Filters' }).click();
    cy.findByText('5YUQDDjKpz2z').should('exist');
    cy.findByText('vYs9Vxx6yWbn').should('exist');
    cy.findByText('PcfCM1jp0SUV').should('exist');
    cy.findByText('Zf7P8Qu8TD8c').should('exist');
  });

  it('navigates to the landing page, toggles the properties and navigates back to the table view', () => {
    cy.findByText('KvT2Ox7n').click();
    cy.findByText(
      'High-resolution cameras for beam characterization. 1'
    ).should('exist');
    cy.findByLabelText('Close item properties').should('exist');

    cy.findByLabelText('Close item properties').click();

    cy.findByLabelText('Close item properties').should('not.exist');
    cy.findByLabelText('Show item properties').should('exist');

    cy.findByLabelText('Close item manufacturer details').should('exist');

    cy.findByLabelText('Close item manufacturer details').click();

    cy.findByLabelText('Close item manufacturer details').should('not.exist');

    cy.findByLabelText('Close item details').should('exist');

    cy.findByLabelText('Close item details').click();

    cy.findByLabelText('Close item details').should('not.exist');
    cy.findByLabelText('Show item manufacturer details').should('exist');

    cy.findByRole('link', {
      name: 'Items',
    }).click();

    cy.findByText('5YUQDDjKpz2z').should('exist');
    cy.findByText('vYs9Vxx6yWbn').should('exist');
    cy.findByText('PcfCM1jp0SUV').should('exist');
    cy.findByText('Zf7P8Qu8TD8c').should('exist');
  });

  it('delete an item', () => {
    cy.findAllByLabelText('Row Actions').first().click();
    cy.findByText('Delete').click();

    cy.findByText('ID: KvT2Ox7n').should('exist');

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Continue' }).click();

    cy.findBrowserMockedRequests({
      method: 'DELETE',
      url: '/v1/items/:id',
    }).should((patchRequests) => {
      expect(patchRequests.length).equal(1);
      const request = patchRequests[0];
      expect(request.url.toString()).to.contain('KvT2Ox7n');
    });
  });

  it('should display a link a system in the delete dialog when the item has a system id', () => {
    cy.findAllByLabelText('Row Actions').last().click();
    cy.findByText('Delete').click();

    cy.findByRole('link', { name: 'Pico Laser' }).should('exist');
  });
});
