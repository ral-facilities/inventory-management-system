describe('System', () => {
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

  it('should be able to navigate through subsystems', () => {
    cy.findByText('No system selected').should('be.visible');
    cy.findByText('Please select a system').should('be.visible');

    // Navigate deeper
    cy.findByRole('button', { name: 'Giant laser' }).click();
    cy.url().should('include', '/systems/65328f34a40ff5301575a4e3');
    cy.findByText('No system selected').should('not.exist');
    cy.findByText('Please select a system').should('not.exist');

    cy.findByText('Smaller laser').should('be.visible');
    cy.findByText('Description').should('be.visible');

    // Navigate deeper again
    cy.findByRole('button', { name: 'Smaller laser' }).click();
    cy.url().should('include', '/systems/65328f34a40ff5301575a4e4');

    cy.findByText('Pulse Laser').should('be.visible');
    cy.findByText('Description').should('be.visible');
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

      cy.findBrowserMockedRequests({
        method: 'POST',
        url: '/v1/systems',
      }).should(async (postRequests) => {
        expect(postRequests.length).equal(1);
        expect(JSON.stringify(await postRequests[0].json())).equal(
          JSON.stringify({ name: 'System name', importance: 'medium' })
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
      cy.findByRole('button', { name: 'Save' }).click();
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
      cy.findByRole('button', { name: 'Cancel' }).click();
      cy.findByRole('button', { name: 'add system' }).click();
      cy.findByText(
        'A System with the same name already exists within the same parent System'
      ).should('not.exist');
    });

    it('displays error message if any other error occurs that disappears once closed', () => {
      cy.visit('/systems');

      cy.findByRole('button', { name: 'add system' }).click();
      cy.findByLabelText('Name *').type('Error 500');
      cy.findByRole('button', { name: 'Save' }).click();
      cy.findByText('Please refresh and try again').should('be.visible');
      cy.findByRole('button', { name: 'Cancel' }).click();
      cy.findByRole('button', { name: 'add system' }).click();
      cy.findByText('Please refresh and try again').should('not.exist');
    });
  });

  describe('Edit', () => {
    it("edits all of a system's fields", () => {
      cy.visit('/systems/65328f34a40ff5301575a4e3');

      cy.findByRole('button', { name: 'Edit System' }).click();

      cy.findByLabelText('Name *').clear().type('System name');
      cy.findByLabelText('Description').clear().type('System description');
      cy.findByLabelText('Location').clear().type('System location');
      cy.findByLabelText('Owner').clear().type('System owner');
      cy.findByLabelText('Importance').click();
      cy.findByRole('option', { name: 'medium' }).click();

      cy.startSnoopingBrowserMockedRequest();
      cy.findByRole('button', { name: 'Save' }).click();

      cy.findBrowserMockedRequests({
        method: 'PATCH',
        url: '/v1/systems/65328f34a40ff5301575a4e3',
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
      cy.visit('/systems/65328f34a40ff5301575a4e3');

      cy.findByRole('button', { name: 'Edit System' }).click();

      cy.findByLabelText('Name *').clear().type('System name');

      cy.startSnoopingBrowserMockedRequest();
      cy.findByRole('button', { name: 'Save' }).click();

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

    it('displays error message when no field has been edited that disappears when description is edited', () => {
      cy.visit('/systems/65328f34a40ff5301575a4e3');

      cy.findByRole('button', { name: 'Edit System' }).click();

      cy.findByRole('button', { name: 'Save' }).click();
      cy.findByText('Please edit a form entry before clicking save').should(
        'be.visible'
      );
      cy.findByLabelText('Description').type('1');
      cy.findByText('Please edit a form entry before clicking save').should(
        'not.exist'
      );
    });

    it('displays error message when name is not given that disappears once closed', () => {
      cy.visit('/systems/65328f34a40ff5301575a4e3');

      cy.findByRole('button', { name: 'Edit System' }).click();

      cy.findByLabelText('Name *').clear();
      cy.findByRole('button', { name: 'Save' }).click();
      cy.findByText('Please enter a name').should('be.visible');
      cy.findByRole('button', { name: 'Save' }).click();
      cy.findByRole('button', { name: 'Cancel' }).click();
      cy.findByRole('button', { name: 'Edit System' }).click();
      cy.findByText('Please enter a name').should('not.exist');
    });

    it('displays error message if the system has a duplicate name that disappears once closed', () => {
      cy.visit('/systems/65328f34a40ff5301575a4e3');

      cy.findByRole('button', { name: 'Edit System' }).click();

      cy.findByLabelText('Name *').clear().type('Error 409');
      cy.findByRole('button', { name: 'Save' }).click();
      cy.findByText(
        'A System with the same name already exists within the same parent System'
      ).should('be.visible');
      cy.findByRole('button', { name: 'Cancel' }).click();
      cy.findByRole('button', { name: 'Edit System' }).click();
      cy.findByText(
        'A System with the same name already exists within the same parent System'
      ).should('not.exist');
    });

    it('displays error message if any other error occurs that disappears once closed', () => {
      cy.visit('/systems/65328f34a40ff5301575a4e3');

      cy.findByRole('button', { name: 'Edit System' }).click();

      cy.findByLabelText('Name *').clear().type('Error 500');
      cy.findByRole('button', { name: 'Save' }).click();
      cy.findByText('Please refresh and try again').should('be.visible');
      cy.findByRole('button', { name: 'Cancel' }).click();
      cy.findByRole('button', { name: 'Edit System' }).click();
      cy.findByText('Please refresh and try again').should('not.exist');
    });
  });

  it('deletes a system', () => {
    cy.visit('/systems/65328f34a40ff5301575a4e9');

    cy.findByRole('button', { name: 'Delete System' }).click();
    cy.startSnoopingBrowserMockedRequest();
    cy.findByRole('button', { name: 'Continue' }).click();

    cy.findBrowserMockedRequests({
      method: 'DELETE',
      url: '/v1/systems/65328f34a40ff5301575a4e9',
    }).should((patchRequests) => {
      expect(patchRequests.length).equal(1);
    });

    // ID of the parent
    cy.url().should('include', '/systems/65328f34a40ff5301575a4e8');
  });

  it('displays an error when attempting to delete a system with children that hides once closed', () => {
    cy.visit('/systems/65328f34a40ff5301575a4e3');

    cy.findByRole('button', { name: 'Delete System' }).click();
    cy.startSnoopingBrowserMockedRequest();
    cy.findByRole('button', { name: 'Continue' }).click();

    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByText(
          'System has child elements and cannot be deleted, please delete the child systems first'
        ).should('be.visible');
      });

    cy.findByRole('button', { name: 'Cancel' }).click();
    cy.findByRole('button', { name: 'Delete System' }).click();
    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findByText(
          'System has child elements and cannot be deleted, please delete the child systems first'
        ).should('not.exist');
      });
  });

  it('moves systems', () => {
    cy.visit('/systems');

    cy.findByRole('button', { name: 'Pulse Laser' })
      .findByRole('checkbox')
      .click();
    cy.findByRole('button', { name: 'Pico Laser' })
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
    cy.visit('/inventory-management-system/systems');

    cy.findByRole('button', { name: 'Pulse Laser' })
      .findByRole('checkbox')
      .click();
    cy.findByRole('button', { name: 'Pico Laser' })
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
        })
      );
    });
  });
});
