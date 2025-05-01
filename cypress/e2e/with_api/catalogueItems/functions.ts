const modifyCatalogueItem = (
  values: {
    editCatalogueItemName?: string;
    name: string;
    description?: string;
    costGbp: string;
    costToReworkGbp?: string;
    daysToReplace: string;
    daysToRework?: string;
    expectedLifetimeDays?: string;
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

      if (values.expectedLifetimeDays) {
        cy.findByLabelText('Expected Lifetime (days)').clear();
        cy.findByLabelText('Expected Lifetime (days)').type(
          values.expectedLifetimeDays
        );
      } else {
        cy.findByLabelText('Expected Lifetime (days)').clear();
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

    if (values.expectedLifetimeDays)
      cy.findByText(values.expectedLifetimeDays).should('exist');

    if (values.drawingNumber)
      cy.findByText(values.drawingNumber).should('exist');

    if (values.drawingLink) cy.findByText(values.drawingLink).should('exist');

    if (values.itemModelNumber)
      cy.findByText(values.itemModelNumber).should('exist');

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
      expectedLifetimeDays: '365',
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
    expectedLifetimeDays: '365',
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

export const addFile = (
  values: {
    files: string[];
  },
  type: 'image' | 'attachment',
  ignoreChecks?: boolean
) => {
  const tabValue = type === 'image' ? 'Gallery' : 'Attachments';
  const uploadButton =
    type === 'image' ? 'Upload Images' : 'Upload Attachments';
  cy.findByText(tabValue).click();
  cy.findByRole('button', {
    name: uploadButton,
  }).click();

  cy.findAllByText('Files cannot be larger than', { exact: false }).should(
    'exist'
  );
  cy.get('.uppy-Dashboard-input').as('fileInput');

  if (type === 'image') {
    cy.get('@fileInput').last().selectFile(values.files, { force: true });
  } else {
    cy.get('@fileInput').first().selectFile(values.files, { force: true });
  }

  cy.findByText(
    `Upload ${values.files.length} file${values.files.length > 1 ? 's' : ''}`
  ).click({ force: true });

  cy.findByText('Uploading').should('not.exist');

  cy.findAllByRole('dialog')
    .first()
    .within(() => {
      cy.findAllByRole('button', {
        name: 'Close Modal',
      })
        .last()
        .click();
    });

  if (!ignoreChecks) {
    cy.findByText(tabValue).click();
    for (let i = 0; i++; i < values.files.length) {
      const fileName = values.files[i].slice(
        values.files[i].lastIndexOf('/') + 1
      );
      cy.findByText(fileName).should('exist');
    }
  }
};

export const editFile = (
  values: {
    originalFileName: string;
    newFileName?: string;
    description?: string;
    title?: string;
  },
  type: 'image' | 'attachment',
  ignoreChecks: boolean
) => {
  const tabValue = type === 'image' ? 'Gallery' : 'Attachments';
  cy.findByText(tabValue).click();
  cy.findAllByText(`${values.originalFileName}`).last().scrollIntoView();

  cy.findAllByText(`${values.originalFileName}`).last().should('exist');

  if (type === 'image') {
    cy.findAllByLabelText('Card Actions').first().click();
    cy.findAllByText('Edit').last().click();
  } else {
    cy.findByRole('row', { name: `${values.originalFileName} row` }).within(
      () => {
        cy.findByLabelText('Row Actions').click();
      }
    );
    cy.findByLabelText(`Edit ${values.originalFileName} attachment`).click();
  }

  cy.findByRole('dialog')
    .should('be.visible')
    .within(() => {
      if (values.newFileName) {
        cy.findByLabelText('File Name *').clear();
        cy.findByText(type === 'attachment' ? '.txt' : '.png').should('exist');
        cy.findByLabelText('File Name *').type(values.newFileName);
      }

      if (values.title) {
        cy.findByLabelText('Title').clear();
        cy.findByLabelText('Title').type(values.title);
      }

      if (values.description) {
        cy.findByLabelText('Description').clear();
        cy.findByLabelText('Description').type(values.description);
      }
    });
  cy.findByRole('button', { name: 'Save' }).click();
  cy.findByRole('dialog').should('not.exist');

  if (!ignoreChecks) {
    cy.findByText(type).click();
    cy.findByText(values.newFileName ?? values.originalFileName).should(
      'exist'
    );
    if (values.description) {
      cy.findByText(values.description).should('exist');
    }
    if (values.title) {
      cy.findByText(values.title).should('exist');
    }
  }
};

export const downloadFile = (
  fileName: string,
  type: 'image' | 'attachment'
) => {
  const tabValue = type === 'image' ? 'Gallery' : 'Attachments';
  cy.findByText(tabValue).click();
  if (type === 'image') {
    cy.findAllByLabelText('Card Actions').first().click();
    cy.findAllByText('Download').last().click();
  } else {
    cy.findByLabelText(`${fileName} row`).within(() => {
      cy.findByLabelText('Row Actions').click();
    });
    cy.findByLabelText(`Download ${fileName} attachment`).click();
  }

  cy.findByRole('dialog').should('be.visible');

  cy.findByRole('button', { name: 'Continue' }).click();
};

export const deleteFile = (
  fileNames: string[],
  type: 'image' | 'attachment'
) => {
  const tabValue = type === 'image' ? 'Gallery' : 'Attachments';
  cy.findByText(tabValue).click();
  fileNames.forEach((fileName) => {
    if (type === 'image') {
      cy.findAllByLabelText('Card Actions').first().click();
      cy.findAllByText('Delete').last().click();
    } else {
      cy.findByLabelText(`${fileName} row`).within(() => {
        cy.findByLabelText('Row Actions').click();
      });
      cy.findByLabelText(`Delete attachment ${fileName}`).click();
    }

    cy.findByRole('dialog').should('be.visible');

    cy.findByRole('button', { name: 'Continue' }).click();

    cy.findByRole('dialog').should('not.exist');
  });
};

export const setPrimaryImage = (index: number, ignoreChecks: boolean) => {
  it('sets a primary image', () => {
    cy.findByRole('button', { name: 'primary images action menu' }).click();
    cy.findByText('Set Primary Image').click();
    cy.findByRole('dialog')
      .should('be.visible')
      .within(() => {
        cy.findAllByRole('radio').eq(index).click();
        cy.findByText('Save').click();
      });
    cy.findByRole('dialog').should('not.exist');
    if (!ignoreChecks) {
      cy.findByText('No Image').should('not.exist');
    }
  });
};
