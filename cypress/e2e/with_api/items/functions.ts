const modifyItem = (
  values: {
    edit?: number;
    serialNumber?: string;
    assetNumber?: string;
    purchaseOrderNumber?: string;
    warrantyEndDate?: string;
    deliveredDate?: string;
    isDefective: string;
    usageStatus: string;
    notes?: string;
    substrate: string;
    diameter?: string;
    wavelengthRange: string;
    broken?: string;
    system: string;
  },
  ignore?: boolean
) => {
  if (typeof values.edit === 'number') {
    cy.findAllByLabelText('Row Actions').eq(values.edit).click();

    cy.findByText('Edit').click();
  } else {
    cy.findByRole('button', { name: 'Add Item' }).click();
  }

  if (values.serialNumber) {
    cy.findByLabelText('Serial number').clear();
    cy.findByLabelText('Serial number').type(values.serialNumber);
  } else {
    cy.findByLabelText('Serial number').clear();
  }

  if (values.assetNumber) {
    cy.findByLabelText('Asset number').clear();
    cy.findByLabelText('Asset number').type(values.assetNumber);
  } else {
    cy.findByLabelText('Asset number').clear();
  }

  if (values.purchaseOrderNumber) {
    cy.findByLabelText('Purchase order number').clear();
    cy.findByLabelText('Purchase order number').type(
      values.purchaseOrderNumber
    );
  } else {
    cy.findByLabelText('Purchase order number').clear();
  }

  if (values.warrantyEndDate) {
    cy.findByLabelText('Warranty end date').clear();
    cy.findByLabelText('Warranty end date').type(values.warrantyEndDate);
  } else {
    cy.findByLabelText('Warranty end date').clear();
  }

  if (values.deliveredDate) {
    cy.findByLabelText('Delivered date').clear();
    cy.findByLabelText('Delivered date').type(values.deliveredDate);
  } else {
    cy.findByLabelText('Delivered date').clear();
  }

  cy.findByLabelText('Usage status *').click();
  cy.findByRole('option', { name: values.usageStatus }).click();

  cy.findByLabelText('Is defective *').click();
  cy.findByRole('option', { name: values.isDefective }).click();

  if (values.notes) {
    cy.findByLabelText('Notes').clear();
    cy.findByLabelText('Notes').type(values.notes);
  } else {
    cy.findByLabelText('Notes').clear();
  }

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

  cy.findByRole('button', { name: 'Next' }).click();

  cy.findByLabelText('navigate to systems home').click();

  cy.findByText(values.system).click();

  cy.findByRole('button', { name: 'Finish' }).click();

  if (!ignore) {
    if (values.serialNumber) {
      cy.findByText('Serial Number').scrollIntoView();
      cy.findByText(values.serialNumber).should('exist');
    }

    if (values.assetNumber) {
      cy.findByText('Asset Number').scrollIntoView();
      cy.findByText(values.assetNumber).should('exist');
    }

    if (values.purchaseOrderNumber) {
      cy.findByText('Purchase Order Number').scrollIntoView();
      cy.findByText(values.purchaseOrderNumber).should('exist');
    }
  }
};

export const saveAsItem = (serialNumber: string, index: number) => {
  cy.findAllByLabelText('Row Actions').eq(index).click();
  cy.findByText(`Save as`).click();

  cy.findByRole('button', { name: 'Next' }).click();
  cy.findByRole('button', { name: 'Next' }).click();
  cy.findByRole('button', { name: 'Finish' }).click();

  cy.findAllByText(serialNumber).should('have.length.gte', 2);
};

export const deleteItem = (serialNumber: string, index: number) => {
  cy.findAllByLabelText('Row Actions').eq(index).click();
  cy.findByText(`Delete`).click();

  cy.findByRole('button', { name: 'Continue' }).click();
  cy.findByText(serialNumber).should('not.exist');
};

export const addItem = (ignore?: boolean) => {
  cy.findByText('Click here').click();
  modifyItem(
    {
      serialNumber: 'MX432424',
      assetNumber: 'PY4234324',
      purchaseOrderNumber: '234',
      warrantyEndDate: '17/02/2029',
      deliveredDate: '19/03/2022',
      isDefective: 'Yes',
      usageStatus: 'New',
      notes: 'test',
      substrate: 'N-BK7',
      diameter: '10',
      wavelengthRange: '195 - 2100',
      broken: 'False',
      system: 'Storage',
    },
    ignore
  );
};

export const editItem = () => {
  modifyItem({
    edit: 0,
    serialNumber: 'MX4332424',
    assetNumber: 'PY42343424',
    purchaseOrderNumber: '2334',
    warrantyEndDate: '17/02/2030',
    deliveredDate: '19/03/2026',
    isDefective: 'No',
    usageStatus: 'Used',
    notes: 'tests',
    substrate: 'Fused Silica',
    diameter: '100',
    wavelengthRange: '195 - 2100',
    broken: 'True',
    system: 'optics 1',
  });
};
