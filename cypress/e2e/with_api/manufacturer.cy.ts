const modifyManufacturer = (values: {
  editManufacturerName?: string;
  name: string;
  url?: string;
  country: string;
  address_line: string;
  town?: string;
  county?: string;
  postcode: string;
  telephone_number?: string;
}) => {
  if (values.editManufacturerName) {
    cy.findByLabelText(`${values.editManufacturerName} row`).within(() => {
      cy.findByLabelText('Row Actions').click();
    });
    cy.findByLabelText(
      `Edit manufacturer ${values.editManufacturerName}`
    ).click();
  } else {
    cy.findByRole('button', { name: 'Add Manufacturer' }).click();
  }

  cy.findByLabelText('Name *').clear();
  cy.findByLabelText('Name *').type(values.name);

  if (values.url) {
    cy.findByLabelText('URL').clear();
    cy.findByLabelText('URL').type(values.url);
  }

  cy.findByLabelText('Country *').clear();
  cy.findByLabelText('Country *').type(values.country);

  cy.findByLabelText('Address Line *').clear();
  cy.findByLabelText('Address Line *').type(values.address_line);
  if (values.town) {
    cy.findByLabelText('Town').clear();
    cy.findByLabelText('Town').type(values.town);
  }

  if (values.county) {
    cy.findByLabelText('County').clear();
    cy.findByLabelText('County').type(values.county);
  }

  cy.findByLabelText('Post/Zip code *').clear();
  cy.findByLabelText('Post/Zip code *').type(values.postcode);

  if (values.telephone_number) {
    cy.findByLabelText('Telephone number').clear();
    cy.findByLabelText('Telephone number').type(values.telephone_number);
  }

  cy.findByRole('button', { name: 'Save' }).click();
  cy.findByText(values.name).should('exist');
  cy.findByText(values.name).click();
  cy.findAllByText(values.name).should('have.length.gte', 1);
  values.url && cy.findByText(values.url).should('exist');
  cy.findByText(values.country).should('exist');
  cy.findByText(values.address_line).should('exist');
  values.town && cy.findByText(values.town).should('exist');
  values.county && cy.findByText(values.county).should('exist');
  cy.findByText(values.postcode).should('exist');
  values.telephone_number &&
    cy.findByText(values.telephone_number).should('exist');
  cy.go('back');
};
const deleteManufacturer = (name: string) => {
  cy.findByLabelText(`${name} row`).within(() => {
    cy.findByLabelText('Row Actions').click();
  });
  cy.findByLabelText(`Delete manufacturer ${name}`).click();

  cy.findByRole('button', { name: 'Continue' }).click();
  cy.findByText(name).should('not.exist');
};

const addManufacturer = () => {
  modifyManufacturer({
    name: 'ThorsLab',
    url: 'https://www.thorlabser.com/',
    country: 'United Kingdom',
    address_line: '234 Kew Court Pynes Hill Office Campus',
    town: 'Rydon Lane4',
    county: 'Exeters',
    postcode: 'EX2 5PZ',
    telephone_number: '0744932088487',
  });
};

const editManufacturer = () => {
  modifyManufacturer({
    editManufacturerName: 'ThorsLab',
    name: 'ThorsLabs',
    url: 'https://www.thorlabs.com/',
    country: 'United Kingdom',
    address_line: '2 Kew Court Pynes Hill Office Campus',
    town: 'Rydon Lane',
    county: 'Exeter',
    postcode: 'EX2 5AZ',
    telephone_number: '074493208487',
  });
};

describe('Manufacturer', () => {
  beforeEach(() => {
    cy.dropIMSDB();
    cy.visit('/manufacturer');
  });
  afterEach(() => {
    cy.clearMocks();
    cy.dropIMSDB();
  });

  it('CRUD for Manufacturer', () => {
    addManufacturer();
    editManufacturer();
    deleteManufacturer('ThorsLabs');
  });
});
