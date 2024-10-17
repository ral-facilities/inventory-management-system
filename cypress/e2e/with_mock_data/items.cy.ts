describe('Items', () => {
  beforeEach(() => {
    cy.visit('/catalogue/item/1/items');
  });
  afterEach(() => {
    cy.clearMocks();
  });
  it('should be able to navigate back to the catalogue catalogue item table view', () => {
    cy.findByRole('link', { name: 'Cameras' }).click();
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

    cy.findByRole('link', { name: 'Cameras' }).click();

    cy.findByText('Cameras 1').should('exist');
    cy.findByText('Cameras 2').should('exist');
    cy.findByText('Cameras 3').should('exist');
    cy.findByText('Cameras 4').should('exist');

    cy.findByRole('link', { name: 'Beam Characterization' }).click();

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

    cy.findByLabelText('Usage status *').click();
    cy.findByText('New').click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Next' }).click();
    cy.findByRole('button', { name: 'Next' }).click();
    cy.findByText('Giant laser').click();

    cy.findByRole('button', { name: 'Finish' }).click();
    cy.findByRole('dialog').should('not.exist');

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/items',
    }).should(async (postRequests) => {
      expect(postRequests.length).eq(1);
      expect(JSON.stringify(await postRequests[0].json())).equal(
        JSON.stringify({
          purchase_order_number: null,
          is_defective: false,
          usage_status_id: '0',
          warranty_end_date: null,
          asset_number: null,
          serial_number: null,
          delivered_date: null,
          notes: null,
          properties: [
            { id: '1', value: 12 },
            { id: '2', value: 30 },
            { id: '3', value: 'CMOS' },
            { id: '4', value: null },
            { id: '5', value: true },
            { id: '6', value: false },
          ],
          catalogue_item_id: '1',
          system_id: '65328f34a40ff5301575a4e3',
        })
      );
    });
  });

  it('adds an item with only mandatory fields (serial number advanced options)', () => {
    cy.findByRole('button', { name: 'Add Item' }).click();
    cy.findByText('Show advanced options').click();
    cy.findByLabelText('Serial number').type('test %s');
    cy.findByLabelText('Quantity').type('3');
    cy.findByLabelText('Starting value').type('2');
    cy.findByLabelText('Usage status *').click();
    cy.findByText('New').click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Next' }).click();
    cy.findByRole('button', { name: 'Next' }).click();
    cy.findByText('Giant laser').click();

    cy.findByRole('button', { name: 'Finish' }).click();
    cy.findByRole('dialog').should('not.exist');

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/items',
    }).should(async (postRequests) => {
      expect(postRequests.length).eq(3);

      for (let i = 0; i < 3; i++) {
        expect(JSON.stringify(await postRequests[i].json())).equal(
          JSON.stringify({
            purchase_order_number: null,
            is_defective: false,
            usage_status_id: '0',
            warranty_end_date: null,
            asset_number: null,
            serial_number: `test ${i + 2}`,
            delivered_date: null,
            notes: null,
            properties: [
              { id: '1', value: 12 },
              { id: '2', value: 30 },
              { id: '3', value: 'CMOS' },
              { id: '4', value: null },
              { id: '5', value: true },
              { id: '6', value: false },
            ],
            catalogue_item_id: '1',
            system_id: '65328f34a40ff5301575a4e3',
          })
        );
      }
    });
  });

  it('displays error messages for serial number advanced options', () => {
    cy.findByRole('button', { name: 'Add Item' }).click();

    cy.findByLabelText('Usage status *').click();
    cy.findByText('New').click();

    cy.findByText('Show advanced options').click();

    cy.findByLabelText('Starting value').type('10');

    cy.findByRole('button', { name: 'Next' }).click();

    cy.findByText('Please enter a quantity value.').should('exist');

    cy.findByLabelText('Starting value').clear();

    cy.findByLabelText('Quantity').type('10a');
    cy.findByLabelText('Starting value').type('10a');

    cy.findAllByText('Please enter a valid number.').should('have.length', 2);

    cy.findByLabelText('Quantity').clear();
    cy.findByLabelText('Starting value').clear();

    cy.findByLabelText('Quantity').type('10.5');
    cy.findByLabelText('Starting value').type('10.5');

    cy.findAllByText('Please enter a valid integer.').should('have.length', 2);

    cy.findByLabelText('Quantity').clear();
    cy.findByLabelText('Starting value').clear();

    cy.findByLabelText('Quantity').type('-1');
    cy.findByLabelText('Starting value').type('-1');

    cy.findByText('Number must be greater than or equal to 0').should('exist');
    cy.findByText('Number must be greater than or equal to 2').should('exist');

    cy.findByLabelText('Quantity').clear();
    cy.findByLabelText('Starting value').clear();

    cy.findByLabelText('Quantity').type('100');
    cy.findByLabelText('Starting value').type('2');

    cy.findByText('Number must be less than or equal to 99').should('exist');

    cy.findByLabelText('Quantity').clear();
    cy.findByLabelText('Starting value').clear();

    cy.findByLabelText('Quantity').type('4');
    cy.findByLabelText('Starting value').type('2');

    cy.findByRole('button', { name: 'Next' }).click();

    cy.findByText(
      'Please use %s to specify the location you want to append the number to serial number.'
    ).should('exist');

    cy.findByLabelText('Serial number').type('test %s');

    cy.findByText('e.g. test 2').should('exist');
  });

  it('adds an item with only mandatory fields (allowed list of values)', () => {
    cy.visit('/catalogue/item/17/items');
    cy.findByRole('button', { name: 'Add Item' }).click();

    cy.findByLabelText('Usage status *').click();
    cy.findByRole('option', { name: 'Used' }).click();

    cy.findByRole('button', { name: 'Next' }).click();

    cy.findByLabelText('Ultimate Pressure (millibar) *').clear();
    cy.findByLabelText('Ultimate Pressure (millibar) *').type('0.2');
    cy.findByLabelText('Pumping Speed (liters per second) *').click();
    cy.findByRole('option', { name: '400' }).click();
    cy.findByLabelText('Axis').click();
    cy.findByRole('option', { name: 'y' }).click();
    cy.findByRole('button', { name: 'Next' }).click();
    cy.findByText('Giant laser').click();
    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Finish' }).click();
    cy.findByRole('dialog').should('not.exist');

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/items',
    }).should(async (postRequests) => {
      expect(postRequests.length).eq(1);
      expect(JSON.stringify(await postRequests[0].json())).equal(
        JSON.stringify({
          purchase_order_number: null,
          is_defective: false,
          usage_status_id: '2',
          warranty_end_date: null,
          asset_number: null,
          serial_number: null,
          delivered_date: null,
          notes: null,
          properties: [
            { id: '17', value: 400 },
            { id: '18', value: 0.2 },
            { id: '19', value: 'y' },
          ],
          catalogue_item_id: '17',
          system_id: '65328f34a40ff5301575a4e3',
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

    cy.findByRole('button', { name: 'Next' }).click();

    cy.findByLabelText('Resolution (megapixels) *').type('18');
    cy.findByLabelText('Frame Rate (fps)').type('60');
    cy.findByLabelText('Sensor Type *').type('IO');
    cy.findByLabelText('Sensor brand').type('pixel');
    cy.findByLabelText('Broken *').click();
    cy.findByRole('option', { name: 'False' }).click();
    cy.findByLabelText('Older than five years').click();
    cy.findByRole('option', { name: 'True' }).click();

    cy.findByRole('button', { name: 'Next' }).click();

    cy.findByText('Giant laser').click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Finish' }).click();
    cy.findByRole('dialog').should('not.exist');

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/items',
    }).should(async (postRequests) => {
      expect(postRequests.length).eq(1);
      expect(JSON.stringify(await postRequests[0].json())).equal(
        JSON.stringify({
          purchase_order_number: 'test23',
          is_defective: true,
          usage_status_id: '3',
          warranty_end_date: '2028-02-12T00:00:00.000Z',
          asset_number: 'test13221',
          serial_number: 'test1234',
          delivered_date: '2028-02-12T00:00:00.000Z',
          notes: 'test',
          properties: [
            { id: '1', value: 1218 },
            { id: '2', value: 3060 },
            { id: '3', value: 'CMOSIO' },
            { id: '4', value: 'pixel' },
            { id: '5', value: false },
            { id: '6', value: true },
          ],
          catalogue_item_id: '1',
          system_id: '65328f34a40ff5301575a4e3',
        })
      );
    });
  });

  it('displays messages for incorrect input types', () => {
    cy.findByRole('button', { name: 'Add Item' }).click();

    cy.findByLabelText('Warranty end date').type('12/02/');
    cy.findByLabelText('Delivered date').type('12/02/');

    cy.findAllByText('Date format: dd/MM/yyyy').should('have.length', 2);

    cy.findAllByRole('button', { name: 'Clear' }).first().click();
    cy.findAllByRole('button', { name: 'Clear' }).first().click();

    cy.findByLabelText('Warranty end date').type('12/02/4000');
    cy.findByLabelText('Delivered date').type('12/02/4000');
    cy.findAllByText('Date cannot be later than 1/1/2100.').should(
      'have.length',
      2
    );

    cy.findAllByRole('button', { name: 'Clear' }).first().click();
    cy.findAllByRole('button', { name: 'Clear' }).first().click();

    cy.findByLabelText('Warranty end date').type('12/02/2000');
    cy.findByLabelText('Delivered date').type('12/02/2000');
    cy.findByText('Date cannot be later than 1/1/2100.').should('not.exist');
    cy.findByText('Date format: dd/MM/yyyy').should('not.exist');

    cy.findByRole('button', { name: 'Next' }).click();

    cy.findByText('Please select a usage status.').should('exist');

    cy.findByLabelText('Usage status *').click();
    cy.findByText('New').click();

    cy.findByRole('button', { name: 'Next' }).click();

    cy.findByLabelText('Resolution (megapixels) *').clear();
    cy.findByLabelText('Sensor Type *').clear();

    cy.findByRole('button', { name: 'Next' }).click();

    cy.findAllByText(
      'Please enter a valid value as this field is mandatory.'
    ).should('have.length', 2);

    cy.findByLabelText('Resolution (megapixels) *').type('test');
    cy.findByLabelText('Sensor Type *').type('test');

    cy.findAllByText(
      'Please enter a valid value as this field is mandatory.'
    ).should('not.exist');
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

  it('navigates to the landing page and navigates back to the table view', () => {
    cy.findByText('5YUQDDjKpz2z').click();
    cy.findByText(
      'High-resolution cameras for beam characterization. 1'
    ).should('exist');

    cy.findByRole('link', {
      name: 'Items',
    }).click();

    cy.findByText('5YUQDDjKpz2z').should('exist');
    cy.findByText('vYs9Vxx6yWbn').should('exist');
    cy.findByText('PcfCM1jp0SUV').should('exist');
    cy.findByText('Zf7P8Qu8TD8c').should('exist');
  });

  describe('Attachments', () => {
    afterEach(() => {
      cy.clearMocks();
    });

    it('uploads attachment', () => {
      cy.findByText('5YUQDDjKpz2z').click();
      cy.findByText(
        'High-resolution cameras for beam characterization. 1'
      ).should('exist');
      cy.findByRole('button', {
        name: 'items landing page actions menu',
      }).click();
      cy.findByText('Upload Attachment').click();

      cy.findByText(/files cannot be larger than/i).should('exist');
      cy.get('.uppy-Dashboard-input').as('fileInput');

      cy.get('@fileInput')
        .first()
        .selectFile(
          [
            'cypress/fixtures/documents/test1.txt',
            'cypress/fixtures/documents/test2.txt',
          ],
          { force: true }
        );
      cy.startSnoopingBrowserMockedRequest();
      cy.findByText('Upload 2 files').click();

      cy.findBrowserMockedRequests({
        method: 'POST',
        url: '/attachments',
      }).should(async (postRequests) => {
        expect(postRequests.length).eq(2);
        expect(JSON.stringify(await postRequests[0].json())).equal(
          JSON.stringify({
            entity_id: 'KvT2Ox7n',
            file_name: 'test1.txt',
            title: '',
            description: '',
          })
        );
        expect(JSON.stringify(await postRequests[1].json())).equal(
          JSON.stringify({
            entity_id: 'KvT2Ox7n',
            file_name: 'test2.txt',
            title: '',
            description: '',
          })
        );
      });

      cy.findBrowserMockedRequests({
        method: 'POST',
        url: 'object-storage/:key',
      }).should(async (postRequests) => {
        expect(postRequests.length).eq(2);
      });
    });

    it('errors when file is removed mid upload', () => {
      cy.findByText('5YUQDDjKpz2z').click();
      cy.findByText(
        'High-resolution cameras for beam characterization. 1'
      ).should('exist');
      cy.findByRole('button', {
        name: 'items landing page actions menu',
      }).click();
      cy.findByText('Upload Attachment').click();

      cy.findByText(/files cannot be larger than/i).should('exist');
      cy.get('.uppy-Dashboard-input').as('fileInput');

      cy.get('@fileInput')
        .first()
        .selectFile(['cypress/fixtures/documents/removeError.txt'], {
          force: true,
        });
      cy.startSnoopingBrowserMockedRequest();
      cy.findByText('Upload 1 file').click();

      cy.findBrowserMockedRequests({
        method: 'POST',
        url: '/attachments',
      }).should(async (postRequests) => {
        expect(postRequests.length).eq(1);
        expect(JSON.stringify(await postRequests[0].json())).equal(
          JSON.stringify({
            entity_id: 'KvT2Ox7n',
            file_name: 'removeError.txt',
            title: '',
            description: '',
          })
        );
      });

      cy.findBrowserMockedRequests({
        method: 'POST',
        url: 'object-storage/:key',
      }).should(async (postRequests) => {
        expect(postRequests.length).eq(1);
      });

      // Click the "Remove file" button
      cy.findByRole('button', { name: 'Remove file' }).click();

      // Assert that the text "Upload 1 file" is not in the document
      cy.findByText('Upload 1 file').should('not.exist');
    });

    it('errors when presigned url fails', () => {
      cy.findByText('5YUQDDjKpz2z').click();
      cy.findByText(
        'High-resolution cameras for beam characterization. 1'
      ).should('exist');
      cy.findByRole('button', {
        name: 'items landing page actions menu',
      }).click();
      cy.findByText('Upload Attachment').click();

      cy.findByText(/files cannot be larger than/i).should('exist');
      cy.get('.uppy-Dashboard-input').as('fileInput');

      cy.get('@fileInput')
        .first()
        .selectFile(['cypress/fixtures/documents/uploadError.txt'], {
          force: true,
        });
      cy.startSnoopingBrowserMockedRequest();
      cy.findByText('Upload 1 file').click();

      cy.findBrowserMockedRequests({
        method: 'POST',
        url: '/attachments',
      }).should(async (postRequests) => {
        expect(postRequests.length).eq(1);
        expect(JSON.stringify(await postRequests[0].json())).equal(
          JSON.stringify({
            entity_id: 'KvT2Ox7n',
            file_name: 'uploadError.txt',
            title: '',
            description: '',
          })
        );
      });

      cy.findBrowserMockedRequests({
        method: 'POST',
        url: 'object-storage/:key',
      }).should(async (postRequests) => {
        expect(postRequests.length).eq(1);
      });

      cy.findByLabelText('Show error details').should('exist');
    });
  });

  it('delete an item', () => {
    cy.findAllByLabelText('Row Actions').first().click();
    cy.findByText('Delete').click();

    cy.findByText('Serial Number: 5YUQDDjKpz2z').should('exist');

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

  it('duplicate an item', () => {
    cy.findAllByLabelText('Row Actions').first().click();
    cy.findByText('Duplicate').click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Next' }).click();
    cy.findByRole('button', { name: 'Next' }).click();
    cy.findByRole('button', { name: 'Finish' }).click();
    cy.findByRole('dialog').should('not.exist');

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/items',
    }).should(async (postRequests) => {
      expect(postRequests.length).eq(1);
      expect(JSON.stringify(await postRequests[0].json())).equal(
        JSON.stringify({
          purchase_order_number: '6JYHEjwN',
          is_defective: false,
          usage_status_id: '1',
          warranty_end_date: '2023-04-04T23:00:00.000Z',
          asset_number: 'LyH8yp1FHf',
          serial_number: '5YUQDDjKpz2z',
          delivered_date: '2023-03-17T00:00:00.000Z',
          notes:
            '6Y5XTJfBrNNx8oltI9HE\n\nThis is a copy of the item with this Serial Number: 5YUQDDjKpz2z',
          properties: [
            { id: '1', value: 0 },
            { id: '2', value: null },
            { id: '3', value: 'CMOS' },
            { id: '4', value: null },
            { id: '5', value: true },
            { id: '6', value: false },
          ],
          catalogue_item_id: '1',
          system_id: '65328f34a40ff5301575a4e3',
        })
      );
    });
  });

  it('should display a link a system in the delete dialog when the item has a system id', () => {
    cy.findAllByLabelText('Row Actions').last().click();
    cy.findByText('Delete').click();

    cy.findByRole('link', { name: 'Pico Laser' }).should('exist');
  });

  it('edits an item with all fields altered', () => {
    cy.findAllByLabelText('Row Actions').last().click();
    cy.findByText('Edit').click();

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

    cy.findByRole('button', { name: 'Next' }).click();

    cy.findByLabelText('Resolution (megapixels) *').type('18');
    cy.findByLabelText('Frame Rate (fps)').type('60');
    cy.findByLabelText('Sensor Type *').type('IO');
    cy.findByLabelText('Sensor brand').type('pixel');
    cy.findByLabelText('Broken *').click();
    cy.findByRole('option', { name: 'False' }).click();
    cy.findByLabelText('Older than five years').click();
    cy.findByRole('option', { name: 'True' }).click();

    cy.findByRole('button', { name: 'Next' }).click();

    cy.findByRole('button', { name: 'navigate to systems home' }).click();
    cy.findByText('Giant laser').click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Finish' }).click();
    cy.findByRole('dialog').should('not.exist');

    cy.findBrowserMockedRequests({
      method: 'PATCH',
      url: '/v1/items/:id',
    }).should(async (postRequests) => {
      expect(postRequests.length).eq(1);
      expect(JSON.stringify(await postRequests[0].json())).equal(
        JSON.stringify({
          serial_number: 'Zf7P8Qu8TD8ctest1234',
          purchase_order_number: 'hpGBgi0dtest23',
          usage_status_id: '3',
          warranty_end_date: '2028-02-12T23:00:00.000Z',
          asset_number: '75YWiLwy54test13221',
          delivered_date: '2028-02-12T00:00:00.000Z',
          notes: 'zolZDKKuvAoTFRUWeZNAtest',
          system_id: '65328f34a40ff5301575a4e3',
          properties: [
            { id: '1', value: 1218 },
            { id: '2', value: 3060 },
            { id: '3', value: 'CMOSIO' },
            { id: '4', value: 'pixel' },
            { id: '5', value: false },
            { id: '6', value: true },
          ],
        })
      );
    });
  });

  it('edits an item (just the serial number)', () => {
    cy.findAllByLabelText('Row Actions').last().click();
    cy.findByText('Edit').click();

    cy.findByLabelText('Serial number').type('test1234');

    cy.findByRole('button', { name: 'Next' }).click();
    cy.findByRole('button', { name: 'Next' }).click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Finish' }).click();
    cy.findByRole('dialog').should('not.exist');

    cy.findBrowserMockedRequests({
      method: 'PATCH',
      url: '/v1/items/:id',
    }).should(async (postRequests) => {
      expect(postRequests.length).eq(1);
      expect(JSON.stringify(await postRequests[0].json())).equal(
        JSON.stringify({ serial_number: 'Zf7P8Qu8TD8ctest1234' })
      );
    });
  });

  it('edits an item (just the properties)', () => {
    cy.findAllByLabelText('Row Actions').last().click();
    cy.findByText('Edit').click();

    cy.findByRole('button', { name: 'Next' }).click();

    cy.findByLabelText('Resolution (megapixels) *').type('18');
    cy.findByLabelText('Frame Rate (fps)').type('60');
    cy.findByLabelText('Sensor Type *').type('IO');
    cy.findByLabelText('Sensor brand').type('pixel');
    cy.findByLabelText('Broken *').click();
    cy.findByRole('option', { name: 'False' }).click();
    cy.findByLabelText('Older than five years').click();
    cy.findByRole('option', { name: 'True' }).click();

    cy.findByRole('button', { name: 'Next' }).click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Finish' }).click();
    cy.findByRole('dialog').should('not.exist');

    cy.findBrowserMockedRequests({
      method: 'PATCH',
      url: '/v1/items/:id',
    }).should(async (postRequests) => {
      expect(postRequests.length).eq(1);
      expect(JSON.stringify(await postRequests[0].json())).equal(
        JSON.stringify({
          properties: [
            { id: '1', value: 1218 },
            { id: '2', value: 3060 },
            { id: '3', value: 'CMOSIO' },
            { id: '4', value: 'pixel' },
            { id: '5', value: false },
            { id: '6', value: true },
          ],
        })
      );
    });
  });

  it('should display an error message if values have not been updated', () => {
    cy.findAllByLabelText('Row Actions').last().click();
    cy.findByText('Edit').click();

    cy.findByRole('button', { name: 'Next' }).click();
    cy.findByRole('button', { name: 'Next' }).click();
    cy.findByRole('button', { name: 'Finish' }).click();

    cy.findByText(
      "There have been no changes made. Please change a field's value or press Cancel to exit."
    ).should('exist');
  });
});
