describe('Systems', () => {
  beforeEach(() => {
    cy.visit('/systems');
  });

  afterEach(() => {
    cy.clearMocks();
  });

  it('should eventually load', () => {
    cy.findByText('Root systems').should('be.visible');
    cy.findByText('Giant laser').should('be.visible');
  });

  it('should eventually load displaying system not found when system does not exist', () => {
    cy.visit('/systems/invalid_id');

    // Can take a moment to load due to react-query retries
    cy.findByText('System not found', { timeout: 10000 }).should('exist');
    cy.findByText(
      'The system you searched for does not exist. Please navigate home by pressing the home button at the top left of your screen.'
    ).should('exist');
  });

  it('should be able to navigate through subsystems', () => {
    cy.findByText('No system selected').should('be.visible');
    cy.findByText('Please select a system').should('be.visible');

    // Navigate deeper
    cy.findByRole('cell', { name: 'Giant laser' }).click();
    cy.url().should('include', '/systems/65328f34a40ff5301575a4e3');
    cy.findByText('No system selected').should('not.exist');
    cy.findByText('Please select a system').should('not.exist');

    cy.findByRole('cell', { name: 'Smaller laser' }).should('be.visible');
    cy.findByText('Description').should('be.visible');

    // Navigate deeper again
    cy.findByRole('cell', { name: 'Smaller laser' }).click();
    cy.url().should('include', '/systems/65328f34a40ff5301575a4e4');

    cy.findByRole('cell', { name: 'Pulse Laser' }).should('be.visible');
    cy.findByText('Description').should('be.visible');
  });

  it('should be able to navigate to an items catalogue item landing page', () => {
    cy.findByRole('cell', { name: 'Pulse Laser' }).click();
    cy.findAllByRole('link', { name: 'Cameras 8' }).first().click();

    // Check now on landing page for the catalogue item
    cy.url().should('include', '/catalogue/item/27');
    cy.findByText('Properties').should('be.visible');
  });

  it("should be able to navigate to an item's landing page", () => {
    cy.findByRole('cell', { name: 'Pulse Laser' }).click();
    cy.findAllByRole('button', { name: 'Expand' }).eq(1).click();
    cy.findByRole('link', { name: 'QnfSKahnQuze' }).click();

    // Check now on landing page for the item
    cy.url().should('include', '/catalogue/item/28/items/z1hJvV8Z');
    cy.findByText('Properties').should('be.visible');
  });

  it('breadcrumbs should work correctly', () => {
    cy.visit('/systems/65328f34a40ff5301575a4e9');

    cy.findByRole('link', { name: 'Pulse Laser' }).should('be.visible');
    cy.findByRole('link', { name: 'Giant laser' }).should('be.visible');
    cy.findByRole('link', { name: 'Laser Star' }).should('be.visible');
    cy.findByRole('link', { name: 'Smaller laser' }).should('be.visible');

    // One in title, one in breadcrumbs
    cy.findAllByText('Plasma Beam').should('have.length', 2);

    // Check can navigate back with breadcrumbs
    cy.findByRole('link', { name: 'Giant laser' }).click();
    cy.url().should('include', '/systems/65328f34a40ff5301575a4e6');
    cy.findAllByText('Giant laser').should('have.length', 2);

    // Check can go back to root
    cy.findByRole('button', { name: 'navigate to systems home' }).click();
    cy.url().then((url) => {
      expect(url.endsWith('/systems'));
    });
    cy.findByText('No system selected').should('be.visible');
    cy.findByText('Please select a system').should('be.visible');
  });

  describe('Add', () => {
    it('adds a root system with only required parameters', () => {
      cy.findByRole('button', { name: 'add system' }).click();
      cy.findByLabelText('Name *').type('System name');

      cy.startSnoopingBrowserMockedRequest();

      cy.findByRole('button', { name: 'Save' }).click();
      cy.findByRole('dialog').should('not.exist');

      cy.findBrowserMockedRequests({
        method: 'POST',
        url: '/v1/systems',
      }).should(async (postRequests) => {
        expect(postRequests.length).equal(1);
        expect(JSON.stringify(await postRequests[0].json())).equal(
          JSON.stringify({
            name: 'System name',
            importance: 'medium',
            parent_id: null,
          })
        );
      });
    });

    it('adds a root system with all parameters', () => {
      cy.findByRole('button', { name: 'add system' }).click();

      cy.findByLabelText('Name *').type('System name');
      cy.findByLabelText('Description').type('System description');
      cy.findByLabelText('Location').type('System location');
      cy.findByLabelText('Owner').type('System owner');
      cy.findByLabelText('Importance').click();
      cy.findByRole('option', { name: 'high' }).click();

      cy.startSnoopingBrowserMockedRequest();

      cy.findByRole('button', { name: 'Save' }).click();
      cy.findByRole('dialog').should('not.exist');

      cy.findBrowserMockedRequests({
        method: 'POST',
        url: '/v1/systems',
      }).should(async (postRequests) => {
        expect(postRequests.length).equal(1);
        expect(JSON.stringify(await postRequests[0].json())).equal(
          JSON.stringify({
            name: 'System name',
            description: 'System description',
            location: 'System location',
            owner: 'System owner',
            importance: 'high',
            parent_id: null,
          })
        );
      });
    });

    it('adds a subsystem', () => {
      cy.visit('/systems/65328f34a40ff5301575a4e3');

      cy.findByRole('button', { name: 'add subsystem' }).click();
      cy.findByLabelText('Name *').type('System name');

      cy.startSnoopingBrowserMockedRequest();

      cy.findByRole('button', { name: 'Save' }).click();
      cy.findByRole('dialog').should('not.exist');

      cy.findBrowserMockedRequests({
        method: 'POST',
        url: '/v1/systems',
      }).should(async (postRequests) => {
        expect(postRequests.length).equal(1);
        expect(JSON.stringify(await postRequests[0].json())).equal(
          JSON.stringify({
            name: 'System name',
            importance: 'medium',
            parent_id: '65328f34a40ff5301575a4e3',
          })
        );
      });
    });

    it('displays error message when name is not given that disappears once closed', () => {
      cy.visit('/systems');

      cy.findByRole('button', { name: 'add system' }).click();
      cy.findByRole('button', { name: 'Save' }).click();
      cy.findByText('Please enter a name').should('be.visible');
      cy.findByRole('button', { name: 'Save' }).should('be.disabled');
      cy.findByRole('button', { name: 'Cancel' }).click();
      cy.findByRole('button', { name: 'add system' }).click();
      cy.findByText('Please enter a name').should('not.exist');
    });

    it('displays error message if the system has a duplicate name that disappears once closed', () => {
      cy.visit('/systems');

      cy.findByRole('button', { name: 'add system' }).click();
      cy.findByLabelText('Name *').type('Error 409');
      cy.findByRole('button', { name: 'Save' }).click();
      cy.findByText(
        'A System with the same name already exists within the same parent System'
      ).should('be.visible');
      cy.findByRole('button', { name: 'Save' }).should('be.disabled');
      cy.findByRole('button', { name: 'Cancel' }).click();
      cy.findByRole('button', { name: 'add system' }).click();
      cy.findByText(
        'A System with the same name already exists within the same parent System'
      ).should('not.exist');
    });
  });

  describe('Edit', () => {
    it("edits all of a system's fields", () => {
      cy.visit('/systems');

      cy.findAllByLabelText('Row Actions').eq(1).click();
      cy.findByText('Edit').click();

      cy.findByLabelText('Name *').clear().type('System name');
      cy.findByLabelText('Description').clear().type('System description');
      cy.findByLabelText('Location').clear().type('System location');
      cy.findByLabelText('Owner').clear().type('System owner');
      cy.findByLabelText('Importance').click();
      cy.findByRole('option', { name: 'medium' }).click();

      cy.startSnoopingBrowserMockedRequest();

      cy.findByRole('button', { name: 'Save' }).click();
      cy.findByRole('dialog').should('not.exist');

      cy.findBrowserMockedRequests({
        method: 'PATCH',
        url: '/v1/systems/656da8ef9cba7a76c6f81a5d',
      }).should(async (patchRequests) => {
        expect(patchRequests.length).equal(1);
        expect(JSON.stringify(await patchRequests[0].json())).equal(
          JSON.stringify({
            name: 'System name',
            description: 'System description',
            location: 'System location',
            owner: 'System owner',
            importance: 'medium',
          })
        );
      });
    });

    it("edits only a system's name", () => {
      cy.visit('/systems');

      cy.findAllByLabelText('Row Actions').eq(1).click();
      cy.findByText('Edit').click();

      cy.findByLabelText('Name *').clear().type('System name');

      cy.startSnoopingBrowserMockedRequest();

      cy.findByRole('button', { name: 'Save' }).click();
      cy.findByRole('dialog').should('not.exist');

      cy.findBrowserMockedRequests({
        method: 'PATCH',
        url: '/v1/systems/656da8ef9cba7a76c6f81a5d',
      }).should(async (patchRequests) => {
        expect(patchRequests.length).equal(1);
        expect(JSON.stringify(await patchRequests[0].json())).equal(
          JSON.stringify({
            name: 'System name',
          })
        );
      });
    });

    it('displays error message when no field has been edited that disappears when description is edited', () => {
      cy.visit('/systems');

      cy.findAllByLabelText('Row Actions').eq(1).click();
      cy.findByText('Edit').click();

      cy.findByRole('button', { name: 'Save' }).click();
      cy.findByText('Please edit a form entry before clicking save').should(
        'be.visible'
      );
      cy.findByRole('button', { name: 'Save' }).should('be.disabled');
      cy.findByLabelText('Description').type('1');
      cy.findByText('Please edit a form entry before clicking save').should(
        'not.exist'
      );
    });

    it('displays error message when name is not given that disappears once closed', () => {
      cy.visit('/systems');

      cy.findAllByLabelText('Row Actions').eq(1).click();
      cy.findByText('Edit').click();

      cy.findByLabelText('Name *').clear();
      cy.findByRole('button', { name: 'Save' }).click();
      cy.findByText('Please enter a name').should('be.visible');
      cy.findByRole('button', { name: 'Save' }).should('be.disabled');
      cy.findByRole('button', { name: 'Cancel' }).click();

      cy.findAllByLabelText('Row Actions').eq(1).click();
      cy.findByText('Edit').click();

      cy.findByText('Please enter a name').should('not.exist');
    });

    it('displays error message if the system has a duplicate name that disappears once closed', () => {
      cy.visit('/systems');

      cy.findAllByLabelText('Row Actions').eq(1).click();
      cy.findByText('Edit').click();

      cy.findByLabelText('Name *').clear().type('Error 409');
      cy.findByRole('button', { name: 'Save' }).click();
      cy.findByText(
        'A System with the same name already exists within the same parent System'
      ).should('be.visible');
      cy.findByRole('button', { name: 'Save' }).should('be.disabled');
      cy.findByRole('button', { name: 'Cancel' }).click();

      cy.findAllByLabelText('Row Actions').eq(1).click();
      cy.findByText('Edit').click();

      cy.findByText(
        'A System with the same name already exists within the same parent System'
      ).should('not.exist');
    });
  });

  describe('Save as', () => {
    // Error checking is ommitted here as same logic as in add

    it('save as a system editing all fields (in root)', () => {
      cy.visit('/systems');

      cy.findAllByLabelText('Row Actions').eq(1).click();
      cy.findByText('Save as').click();

      // Should default to having _copy_1 in the name
      cy.findByLabelText('Name *').should('have.value', 'Pulse Laser_copy_1');

      cy.findByLabelText('Name *').clear().type('System name');
      cy.findByLabelText('Description').clear().type('System description');
      cy.findByLabelText('Location').clear().type('System location');
      cy.findByLabelText('Owner').clear().type('System owner');
      cy.findByLabelText('Importance').click();
      cy.findByRole('option', { name: 'medium' }).click();

      cy.startSnoopingBrowserMockedRequest();

      cy.findByRole('button', { name: 'Save' }).click();
      cy.findByRole('dialog').should('not.exist');

      cy.findBrowserMockedRequests({
        method: 'POST',
        url: '/v1/systems',
      }).should(async (postRequests) => {
        expect(postRequests.length).equal(1);
        expect(JSON.stringify(await postRequests[0].json())).equal(
          JSON.stringify({
            name: 'System name',
            description: 'System description',
            location: 'System location',
            owner: 'System owner',
            importance: 'medium',
            parent_id: null,
          })
        );
      });
    });

    it("save as a system editing only a system's name (in subsystem)", () => {
      cy.visit('/systems/65328f34a40ff5301575a4e3');

      cy.findAllByLabelText('Row Actions').eq(0).click();
      cy.findByText('Save as').click();

      // Should default to having _copy_1 in the name
      cy.findByLabelText('Name *').should('have.value', 'Smaller laser_copy_1');

      cy.findByLabelText('Name *').clear().type('System name');

      cy.startSnoopingBrowserMockedRequest();

      cy.findByRole('button', { name: 'Save' }).click();
      cy.findByRole('dialog').should('not.exist');

      cy.findBrowserMockedRequests({
        method: 'POST',
        url: '/v1/systems',
      }).should(async (postRequests) => {
        expect(postRequests.length).equal(1);
        expect(JSON.stringify(await postRequests[0].json())).equal(
          JSON.stringify({
            name: 'System name',
            description:
              'Pretty speech spend mouth control skill. Fire together return message catch food wish.',
            location: '848 James Lock Suite 863\nNew Robertbury, PW 17883',
            owner: 'Daniel Morrison',
            importance: 'low',
            parent_id: '65328f34a40ff5301575a4e3',
          })
        );
      });
    });
  });

  it('edits a system from a landing page', () => {
    cy.visit('/systems/65328f34a40ff5301575a4e3');

    cy.findByRole('button', { name: 'Edit System' }).click();

    cy.findByLabelText('Name *').clear().type('System name');

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('button', { name: 'Save' }).click();
    cy.findByRole('dialog').should('not.exist');

    cy.findBrowserMockedRequests({
      method: 'PATCH',
      url: '/v1/systems/65328f34a40ff5301575a4e3',
    }).should(async (patchRequests) => {
      expect(patchRequests.length).equal(1);
      expect(JSON.stringify(await patchRequests[0].json())).equal(
        JSON.stringify({
          name: 'System name',
        })
      );
    });
  });

  it('deletes a system', () => {
    cy.visit('/systems');

    cy.findAllByLabelText('Row Actions').eq(1).click();
    cy.findByText('Delete').click();

    cy.startSnoopingBrowserMockedRequest();
    cy.findByRole('button', { name: 'Continue' }).click();

    cy.findBrowserMockedRequests({
      method: 'DELETE',
      url: '/v1/systems/656da8ef9cba7a76c6f81a5d',
    }).should((deleteRequests) => {
      expect(deleteRequests.length).equal(1);
    });
  });

  it('displays an error when attempting to delete a system with children that hides once closed', () => {
    cy.visit('/systems');

    cy.findAllByLabelText('Row Actions').eq(0).click();
    cy.findByText('Delete').click();

    cy.startSnoopingBrowserMockedRequest();
    cy.findByRole('button', { name: 'Continue' }).click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByText(
          'System has child elements and cannot be deleted, please delete the child systems first'
        ).should('be.visible');
      });
    cy.findByRole('button', { name: 'Continue' }).should('be.disabled');

    cy.findByRole('button', { name: 'Cancel' }).click();

    cy.findAllByLabelText('Row Actions').eq(0).click();
    cy.findByText('Delete').click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByText(
          'System has child elements and cannot be deleted, please delete the child systems first'
        ).should('not.exist');
      });
  });

  it('opens add dialog from directory and then closes it', () => {
    cy.visit('/systems');
    cy.findByRole('row', { name: 'Toggle select row Pulse Laser' })
      .findByRole('checkbox')
      .click();
    cy.findByRole('button', { name: 'Move to' }).click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByRole('button', { name: 'Add System' }).click();
      });

    cy.findByLabelText('Name *').should('be.visible');

    cy.findByRole('button', { name: 'Cancel' }).click();

    //checks directory is the only dialog on screen
    cy.findAllByRole('dialog').should('have.length', 1);
  });

  it('moves systems', () => {
    cy.visit('/systems');

    cy.findByRole('row', { name: 'Toggle select row Pulse Laser' })
      .findByRole('checkbox')
      .click();
    cy.findByRole('row', { name: 'Toggle select row Pico Laser' })
      .findByRole('checkbox')
      .click();

    cy.findByRole('button', { name: 'Move to' }).click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Giant laser row').click();
        cy.findByRole('button', { name: 'Move here' }).click();
      });

    cy.findByRole('dialog').should('not.exist');

    cy.findBrowserMockedRequests({
      method: 'PATCH',
      url: '/v1/systems/:id',
    }).should(async (patchRequests) => {
      expect(patchRequests.length).eq(2);
      expect(patchRequests[0].url.toString()).to.contain(
        '/656da8ef9cba7a76c6f81a5d'
      );
      expect(JSON.stringify(await patchRequests[0].json())).equal(
        JSON.stringify({ parent_id: '65328f34a40ff5301575a4e3' })
      );
      expect(patchRequests[1].url.toString()).to.contain(
        '/656ef565ed0773f82e44bc6d'
      );
      expect(JSON.stringify(await patchRequests[1].json())).equal(
        JSON.stringify({ parent_id: '65328f34a40ff5301575a4e3' })
      );
    });
  });

  it('copies systems', () => {
    cy.visit('/systems');

    cy.findByRole('row', { name: 'Toggle select row Pulse Laser' })
      .findByRole('checkbox')
      .click();
    cy.findByRole('row', { name: 'Toggle select row Pico Laser' })
      .findByRole('checkbox')
      .click();

    cy.findByRole('button', { name: 'Copy to' }).click();

    cy.startSnoopingBrowserMockedRequest();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByLabelText('Giant laser row').click();
        cy.findByRole('button', { name: 'Copy here' }).click();
      });

    cy.findByRole('dialog').should('not.exist');

    cy.findBrowserMockedRequests({
      method: 'POST',
      url: '/v1/systems',
    }).should(async (postRequests) => {
      expect(postRequests.length).eq(2);
      expect(JSON.stringify(await postRequests[0].json())).equal(
        JSON.stringify({
          parent_id: '65328f34a40ff5301575a4e3',
          name: 'Pulse Laser',
          description: 'Ullam fuga neque fugiat dolores laborum.',
          location: "Studio 80s\nO'Sullivan trail\nVictoriaville\nNP1R 4QP",
          owner: 'Antony Yates',
          importance: 'high',
          id: '656da8ef9cba7a76c6f81a5d',
          code: 'pulse-laser',
          created_time: '2024-01-01T12:00:00.000+00:00',
          modified_time: '2024-01-02T13:10:10.000+00:00',
        })
      );
      expect(JSON.stringify(await postRequests[1].json())).equal(
        JSON.stringify({
          parent_id: '65328f34a40ff5301575a4e3',
          name: 'Pico Laser',
          description: 'Totam maxime est.',
          location: 'Flat 90w\nWatson inlet\nNew Eric\nG05 6SZ',
          owner: 'Dr Stacey Ward',
          importance: 'low',
          id: '656ef565ed0773f82e44bc6d',
          code: 'pico-laser',
          created_time: '2024-01-01T12:00:00.000+00:00',
          modified_time: '2024-01-02T13:10:10.000+00:00',
        })
      );
    });
  });
  describe.only('Move', () => {
    it('moves items', () => {
      cy.findByRole('cell', { name: 'Pulse Laser' }).click();
      cy.findAllByRole('button', { name: 'Expand' }).eq(1).click();

      // Second table, first checkbox
      cy.findAllByRole('table')
        .eq(1)
        .within(() => {
          cy.findAllByRole('checkbox', {
            name: 'Toggle select row',
          })
            .eq(1)
            .click();
          cy.findAllByRole('checkbox', {
            name: 'Toggle select row',
          })
            .eq(2)
            .click();
        });

      cy.findByRole('button', { name: 'Move to' }).click();

      cy.startSnoopingBrowserMockedRequest();

      cy.findByRole('dialog')
        .should('be.visible')
        .within(() => {
          cy.findByRole('button', { name: 'navigate to systems home' }).click();
          cy.findByLabelText('Giant laser row').click();
          cy.findByRole('button', { name: 'Next' }).click();
        });

      cy.findAllByRole('combobox').eq(1).click();
      cy.findByText('Scrapped').click();

      cy.findByRole('button', { name: 'Finish' }).click();

      cy.findByRole('dialog').should('not.exist');

      cy.findBrowserMockedRequests({
        method: 'PATCH',
        url: '/v1/items/:id',
      }).should(async (patchRequests) => {
        expect(patchRequests.length).eq(2);
        expect(patchRequests[0].url.toString()).to.contain('/z1hJvV8Z');
        expect(JSON.stringify(await patchRequests[0].json())).equal(
          JSON.stringify({
            system_id: '65328f34a40ff5301575a4e3',
            usage_status: 3,
          })
        );
        expect(patchRequests[1].url.toString()).to.contain('/4mYoI7pr');
        expect(JSON.stringify(await patchRequests[1].json())).equal(
          JSON.stringify({
            system_id: '65328f34a40ff5301575a4e3',
            usage_status: 3,
          })
        );
      });
    });

    it('display errors message and clears error message when resolved', () => {
      cy.findByRole('cell', { name: 'Pulse Laser' }).click();
      cy.findAllByRole('button', { name: 'Expand' }).eq(1).click();

      // Second table, first checkbox
      cy.findAllByRole('table')
        .eq(1)
        .within(() => {
          cy.findAllByRole('checkbox', {
            name: 'Toggle select row',
          })
            .eq(1)
            .click();
          cy.findAllByRole('checkbox', {
            name: 'Toggle select row',
          })
            .eq(2)
            .click();
        });

      cy.findByRole('button', { name: 'Move to' }).click();

      cy.findByText('Set usage statues').click();
      cy.findByRole('button', { name: 'Finish' }).click();

      cy.findByText(
        'Move items from current location or root to another directory'
      ).should('exist');
      cy.findByText('Please select a usage status for all items').should(
        'exist'
      );
      cy.findAllByLabelText('Expand all').eq(2).click();
      cy.findAllByText('Please select a usage status').should('have.length', 2);
      cy.findAllByRole('combobox').eq(1).click();
      cy.findByText('Scrapped').click();
      cy.findAllByText('Please select a usage status').should('have.length', 0);
      cy.findByText('Please select a usage status for all items').should(
        'not.exist'
      );
      cy.findByText('Place into a system').click();
      cy.findByRole('button', { name: 'navigate to systems home' }).click();
      cy.findByText(
        'Move items from current location or root to another directory'
      ).should('not.exist');
      cy.findByRole('button', { name: 'Next' }).click();
      cy.findByText(
        'Move items from current location or root to another directory'
      ).should('exist');

      cy.findByText('Pico Laser').click();
      cy.findByRole('button', { name: 'Next' }).click();
      cy.findByText(
        'Move items from current location or root to another directory'
      ).should('not.exist');
      cy.findByRole('button', { name: 'Finish' }).should('not.be.disabled');
    });
  });
});
