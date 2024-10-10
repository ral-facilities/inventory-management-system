const modifyCatalogueItem = (
  values: {
    editCatalogueItemName?: string;
    name: string;
    description?: string;
    costGbp: string;
    costToReworkGbp?: string;
    daysToReplace: string;
    daysToRework?: string;
    drawingNumber?: string;
    drawingLink?: string;
    itemModelNumber?: string;
    notes?: string;
    manufacturer: string;
    substrate: string;
    diameter?: string;
    wavelengthRange: string;
    broken?: string;
  },
  ignoreChecks?: boolean
) => {
  if (values.editCatalogueItemName) {
    cy.findByLabelText(`${values.editCatalogueItemName} row`).within(() => {
      cy.findByLabelText('Row Actions').click();
    });
    cy.findByLabelText(
      `Edit catalogue item ${values.editCatalogueItemName}`
    ).click();
  } else {
    cy.findByRole('button', { name: 'Add Catalogue Item' }).click();
  }
  cy.findByRole('dialog')
    .should('be.visible')
    .within(() => {
      cy.findByLabelText('Name *').clear();
      cy.findByLabelText('Name *').type(values.name);

      if (values.description) {
        cy.findByLabelText('Description').clear();
        cy.findByLabelText('Description').type(values.description);
      } else {
        cy.findByLabelText('Description').clear();
      }

      cy.findByLabelText('Cost (£) *').clear();
      cy.findByLabelText('Cost (£) *').type(values.costGbp);

      if (values.costToReworkGbp) {
        cy.findByLabelText('Cost to rework (£)').clear();
        cy.findByLabelText('Cost to rework (£)').type(values.costToReworkGbp);
      } else {
        cy.findByLabelText('Cost to rework (£)').clear();
      }

      cy.findByLabelText('Time to replace (days) *').clear();
      cy.findByLabelText('Time to replace (days) *').type(values.daysToReplace);

      if (values.daysToRework) {
        cy.findByLabelText('Time to rework (days)').clear();
        cy.findByLabelText('Time to rework (days)').type(values.daysToRework);
      } else {
        cy.findByLabelText('Time to rework (days)').clear();
      }

      if (values.drawingNumber) {
        cy.findByLabelText('Drawing number').clear();
        cy.findByLabelText('Drawing number').type(values.drawingNumber);
      } else {
        cy.findByLabelText('Drawing number').clear();
      }

      if (values.drawingLink) {
        cy.findByLabelText('Drawing link').clear();
        cy.findByLabelText('Drawing link').type(values.drawingLink);
      } else {
        cy.findByLabelText('Drawing link').clear();
      }

      if (values.itemModelNumber) {
        cy.findByLabelText('Model number').clear();
        cy.findByLabelText('Model number').type(values.itemModelNumber);
      } else {
        cy.findByLabelText('Model number').clear();
      }

      if (values.notes) {
        cy.findByLabelText('Notes').clear();
        cy.findByLabelText('Notes').type(values.notes);
      } else {
        cy.findByLabelText('Notes').clear();
      }
    });

  cy.findAllByLabelText('Manufacturer *').first().click();
  cy.contains('Recently Added').should('be.visible');
  cy.contains('A-Z').should('be.visible');
  cy.findAllByRole('option', { name: values.manufacturer }).should(
    'have.length',
    2
  );
  cy.findAllByRole('option', { name: values.manufacturer }).first().click();

  cy.findByRole('button', { name: 'Next' }).click();

  cy.findByLabelText('Substrate *').click();
  cy.findByRole('option', { name: values.substrate }).click();

  if (values.diameter) {
    cy.findByLabelText('Diameter (mm)').clear();
    cy.findByLabelText('Diameter (mm)').type(values.diameter);
  } else {
    cy.findByLabelText('Diameter (mm)').clear();
  }

  cy.findByLabelText('Wavelength Range (nm) *').clear();
  cy.findByLabelText('Wavelength Range (nm) *').type(values.wavelengthRange);

  if (values.broken) {
    cy.findByLabelText('Broken').click();
    cy.findByRole('option', { name: values.broken }).click();
  } else {
    cy.findByLabelText('Broken').click();
    cy.findByRole('option', { name: 'None' }).click();
  }
  cy.findByRole('button', { name: 'Finish' }).click();

  if (!ignoreChecks) {
    cy.findByText(values.name).should('exist');
    cy.findByText(values.name).click();

    if (values.description) cy.findByText(values.description).should('exist');

    cy.findByText(values.costGbp).should('exist');

    if (values.costToReworkGbp)
      cy.findByText(values.costToReworkGbp).should('exist');

    cy.findByText(values.daysToReplace).should('exist');

    if (values.daysToRework) cy.findByText(values.daysToRework).should('exist');

    if (values.drawingNumber)
      cy.findByText(values.drawingNumber).should('exist');

    if (values.drawingLink) cy.findByText(values.drawingLink).should('exist');

    if (values.itemModelNumber)
      cy.findByText(values.itemModelNumber).should('exist');

    if (values.notes) {
      cy.findByText('Notes').click();
      cy.findByText(values.notes).should('exist');
      cy.findByText('Information').click();
    }

    cy.findByText(values.manufacturer).should('exist');

    cy.findByText(values.substrate).should('exist');

    if (values.diameter) cy.findByText(values.diameter).should('exist');

    cy.findByText(values.wavelengthRange).should('exist');

    if (values.broken) {
      cy.findByText(
        values.broken === 'False' ? 'false' : 'true'
      ).scrollIntoView();

      cy.findByText(values.broken === 'False' ? 'false' : 'true').should(
        'exist'
      );
    }

    if (values.notes) {
      cy.findByText('Notes').click();
      cy.findByText(values.notes).should('exist');
    }
    cy.go('back');
  }
};

export const duplicateCatalogueItem = (name: string) => {
  cy.findByLabelText(`${name} row`).within(() => {
    cy.findByLabelText('Row Actions').click();
  });
  cy.findByLabelText(`Duplicate catalogue item ${name}`).click();

  cy.findByRole('button', { name: 'Next' }).click();
  cy.findByRole('button', { name: 'Finish' }).click();

  cy.findByText(`${name}_copy_1`).should('exist');
};

export const obsoleteCatalogueItem = (values: {
  isObsolete: boolean;
  name: string;
  obsolete_reason: string;
  obsolete_replacement: string;
}) => {
  cy.findByLabelText(`${values.name} row`).within(() => {
    cy.findByLabelText('Row Actions').click();
  });
  cy.findByLabelText(`Obsolete catalogue item ${values.name}`).click();
  cy.findByRole('dialog')
    .should('be.visible')
    .within(() => {
      cy.findByLabelText('Is Obsolete').click();
    });
  cy.findByRole('option', { name: values.isObsolete ? 'Yes' : 'No' }).click();
  cy.findByText('Next').click();
  cy.findByRole('textbox').type(values.obsolete_reason);
  cy.findByText('Next').click();
  cy.findByRole('dialog').within(() => {
    cy.findAllByLabelText(`${values.obsolete_replacement} row`)
      .first()
      .within(() => {
        cy.findByRole('radio').click();
      });
  });
  cy.findByText('Finish').click();

  cy.findByRole('button', { name: 'Show/Hide columns' }).click();
  cy.findByText('Hide all').click();
  cy.findByText('Obsolete replacement link').click();
  cy.findByText('Is Obsolete').click();
  cy.findByText('Obsolete Reason').click();
  cy.get('body').type('{esc}');
  cy.findByText('Yes').should('exist');
  cy.findByText(`${values.obsolete_reason}`).should('exist');
  cy.findByText('Click here').click();

  cy.findAllByText(values.obsolete_replacement).should('have.length.gte', 1);
  cy.go('back');
};

const deleteCatalogueItem = (name: string) => {
  cy.findByLabelText(`${name} row`).within(() => {
    cy.findByLabelText('Row Actions').click();
  });

  cy.findByLabelText(`Delete catalogue item ${name}`).click();

  cy.findByRole('button', { name: 'Continue' }).click();
  cy.findByText(`${name}_copy_1`).should('not.exist');
};

export const copyToCatalogueItems = (values: { checkedItems: string[] }) => {
  for (let i = 0; i < values.checkedItems.length; i++) {
    cy.findByLabelText(`${values.checkedItems[i]} row`).within(() => {
      cy.findAllByLabelText('Toggle select row').first().click();
    });
  }

  cy.findByRole('button', { name: 'Copy to' }).click();
  cy.findByRole('link', { name: 'Lenses' }).click();
  cy.findByText('Spherical Lenses_copy_1').click();
  cy.findByRole('button', { name: 'Copy here' }).click();
  cy.findByRole('dialog').should('not.exist');

  cy.findByRole('link', { name: 'Lenses' }).click();

  cy.findByText('Spherical Lenses_copy_1').click();

  for (let i = 0; i < values.checkedItems.length; i++) {
    cy.findByText(`${values.checkedItems[i]}`).should('exist');
    deleteCatalogueItem(`${values.checkedItems[i]}`);
  }
  cy.go('back');
  cy.go('back');
};

export const moveToCatalogueItems = (values: { checkedItems: string[] }) => {
  for (let i = 0; i < values.checkedItems.length; i++) {
    cy.findByLabelText(`${values.checkedItems[i]} row`).within(() => {
      cy.findAllByLabelText('Toggle select row').first().click();
    });
  }

  cy.findByRole('button', { name: 'Move to' }).click();
  cy.findByRole('link', { name: 'Lenses' }).click();
  cy.findByText('Spherical Lenses_copy_1').click();
  cy.findByRole('button', { name: 'Move here' }).click();
  cy.findByRole('dialog').should('not.exist');

  cy.findByRole('link', { name: 'Lenses' }).click();

  cy.findByText('Spherical Lenses_copy_1').click();

  for (let i = 0; i < values.checkedItems.length; i++) {
    cy.findByText(`${values.checkedItems[i]}`).should('exist');
    deleteCatalogueItem(`${values.checkedItems[i]}`);
  }
};

export const addCatalogueItem = (ignoreChecks?: boolean) => {
  cy.findByText('Spherical Lenses').click();
  modifyCatalogueItem(
    {
      name: 'Plano-Convex Lens',
      description: 'Planoconvex Lens UVFS 6mmdia x 10mm F.L. Uncoated',
      costGbp: '43.95',
      costToReworkGbp: '20',
      daysToReplace: '5',
      daysToRework: '1',
      drawingLink: 'https://example.com/',
      drawingNumber: 'GH45235324',
      itemModelNumber: 'rew5435453',
      notes: 'test',
      manufacturer: 'ThorsLabs',
      substrate: 'N-BK7',
      diameter: '10',
      wavelengthRange: '195 - 2100',
      broken: 'False',
    },
    ignoreChecks
  );
};

export const editCatalogueItem = () => {
  modifyCatalogueItem({
    editCatalogueItemName: 'Plano-Convex Lens',
    name: 'Plano-Convex Lens 2',
    description: 'Planoconvex Lens UVFS 6mmdia x 10mm F.L. Uncoated 2',
    costGbp: '43.95',
    costToReworkGbp: '20',
    daysToReplace: '5',
    drawingLink: 'https://example.com/',
    drawingNumber: 'GH4523566324',
    itemModelNumber: 'rew54359453',
    notes: 'test 2',
    manufacturer: 'ThorsLabs',
    substrate: 'Fused Silica',
    diameter: '100',
    wavelengthRange: '195 - 2100',
    broken: 'True',
  });
};
