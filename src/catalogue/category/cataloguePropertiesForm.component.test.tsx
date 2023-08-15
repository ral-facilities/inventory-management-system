import React from 'react';
import { renderComponentWithBrowserRouter } from '../../setupTests';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CataloguePropertiesForm, {
  CataloguePropertiesFormProps,
} from './cataloguePropertiesForm.component';

describe('Catalogue Properties Form', () => {
  let props: CataloguePropertiesFormProps;
  let user;
  const onChangeFormFields = jest.fn();
  const onChangeNameFields = jest.fn();
  const onChangeTypeFields = jest.fn();
  const onChangeErrorFields = jest.fn();
  const createView = () => {
    return renderComponentWithBrowserRouter(
      <CataloguePropertiesForm {...props} />
    );
  };

  beforeEach(() => {
    props = {
      formFields: [],
      onChangeFormFields: onChangeFormFields,
      nameFields: [],
      onChangeNameFields: onChangeNameFields,
      typeFields: [],
      onChangeTypeFields: onChangeTypeFields,
      errorFields: [],
      onChangeErrorFields: onChangeErrorFields,
    };
    user = userEvent.setup();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    const formFields = [
      { name: 'Field 1', type: 'text', unit: '', mandatory: false },
      { name: 'Field 2', type: 'number', unit: 'cm', mandatory: true },
    ];

    props = {
      ...props,
      formFields: formFields,
    };
    const { asFragment } = createView();
    expect(asFragment()).toMatchSnapshot();
  });

  it('should add a new field when clicking on the add button', async () => {
    createView();

    // Click on the add button
    user.click(screen.getByTestId('AddIcon'));

    await waitFor(() => {
      expect(onChangeFormFields).toHaveBeenCalledWith([
        { mandatory: false, name: '', type: '', unit: '' },
      ]);
    });

    expect(onChangeNameFields).toHaveBeenCalledTimes(1);
    expect(onChangeNameFields).toHaveBeenCalledWith(['']);

    expect(onChangeTypeFields).toHaveBeenCalledTimes(1);
    expect(onChangeTypeFields).toHaveBeenCalledWith(['']);
  });

  it('should add a delete a field when clicking on the bin button', async () => {
    const formFields = [
      { name: 'Field 1', type: 'text', unit: '', mandatory: false },
      { name: 'Field 2', type: 'number', unit: 'cm', mandatory: true },
    ];

    props = {
      ...props,
      formFields: formFields,
    };
    createView();

    // Click on the add button
    user.click(screen.getAllByTestId('DeleteIcon')[0]);

    await waitFor(() => {
      expect(onChangeFormFields).toHaveBeenCalledWith([
        { mandatory: true, name: 'Field 2', type: 'number', unit: 'cm' },
      ]);
    });
  });

  it('should handle changes in form fields', async () => {
    const formFields = [
      { name: 'Field 1', type: 'text', unit: '', mandatory: false },
    ];
    props = { ...props, formFields: formFields };
    createView();

    // Modify the name field using userEvent
    fireEvent.change(screen.getByLabelText('Property Name *'), {
      target: { value: 'Updated Field' },
    });

    // Modified name should be called in the handleChange function
    expect(onChangeFormFields).toHaveBeenCalledWith([
      { name: 'Updated Field', type: 'text', unit: '', mandatory: false },
    ]);
  });

  it('should handle changes in the "Type" field', async () => {
    const formFields = [
      { name: 'Field 1', type: 'text', unit: '', mandatory: false },
    ];
    props = { ...props, formFields: formFields };
    createView();

    // Modify the type field
    const select = screen.getByLabelText('Select Type *');
    await user.click(select);

    const dropdown = screen.getByRole('listbox', {
      name: 'Select Type',
    });

    await user.click(within(dropdown).getByRole('option', { name: 'Number' }));
    expect(onChangeFormFields).toHaveBeenCalledWith([
      { name: 'Field 1', type: 'number', unit: '', mandatory: false },
    ]);
  });

  it('should handle changes in the "Mandatory" field', async () => {
    const formFields = [
      { name: 'Field 1', type: 'text', unit: '', mandatory: false },
    ];
    props = { ...props, formFields: formFields };
    createView();

    // Modify the mandatory field

    const select = screen.getByLabelText('Select is mandatory?');
    await user.click(select);

    const dropdown = screen.getByRole('listbox', {
      name: 'Select is mandatory?',
    });

    await user.click(within(dropdown).getByRole('option', { name: 'Yes' }));

    // Modified mandatory should be called in the handleChange function
    expect(onChangeFormFields).toHaveBeenCalledWith([
      { name: 'Field 1', type: 'text', unit: '', mandatory: true },
    ]);
  });

  it('should handle changes in the "Unit" field', async () => {
    const formFields = [
      { name: 'Field 1', type: 'text', unit: '', mandatory: false },
    ];
    props = { ...props, formFields: formFields };
    createView();

    // Modify the Unit field

    fireEvent.change(screen.getByLabelText('Select Unit'), {
      target: { value: 'mm' },
    });

    // Modified mandatory should be called in the handleChange function
    expect(onChangeFormFields).toHaveBeenCalledWith([
      { name: 'Field 1', type: 'text', unit: 'mm', mandatory: false },
    ]);
  });

  it('should disable "Unit" field when type is boolean', async () => {
    const formFields = [
      { name: 'Field 1', type: 'boolean', unit: '', mandatory: false },
    ];
    props = { ...props, formFields: formFields };
    createView();

    expect(screen.getByLabelText('Select Unit')).toBeDisabled();
  });

  it('should remove "Unit" field when type is boolean', async () => {
    const formFields = [
      { name: 'Field 1', type: 'number', unit: '', mandatory: false },
    ];
    props = { ...props, formFields: formFields };
    createView();

    expect(screen.getByLabelText('Select Unit')).not.toBeDisabled();

    // Modify the type field
    const select = screen.getByLabelText('Select Type *');
    await user.click(select);

    const dropdown = screen.getByRole('listbox', {
      name: 'Select Type',
    });

    await user.click(within(dropdown).getByRole('option', { name: 'Boolean' }));

    expect(onChangeFormFields).toHaveBeenCalledWith([
      { name: 'Field 1', type: 'boolean', mandatory: false },
    ]);
  });

  it('display error message for type and name if they are not filled in', async () => {
    const formFields = [
      { name: '', type: 'number', unit: '', mandatory: false },
      { name: '', type: '', unit: '', mandatory: false },
      { name: 'raduis', type: '', unit: '', mandatory: false },
      { name: 'raduis', type: 'number', unit: '', mandatory: false },
    ];
    const nameFields = ['', '', 'raduis', 'raduis'];
    const typeFields = ['number', '', '', 'number'];
    const errorFields = [0, 1, 2];
    props = {
      ...props,
      formFields: formFields,
      nameFields: nameFields,
      typeFields: typeFields,
      errorFields: errorFields,
    };
    createView();

    const nameHelperTexts = screen.queryAllByText('Select Type is required');
    const typeHelperTexts = screen.queryAllByText('Property Name is required');

    expect(nameHelperTexts.length).toBe(2);
    expect(typeHelperTexts.length).toBe(2);

    const formName = screen.getAllByLabelText('Property Name *');
    const formType = screen.getAllByLabelText('Select Type *');

    // Modify the name field using userEvent
    fireEvent.change(formName[0], {
      target: { value: 'Updated Field' },
    });

    await user.click(formType[0]);

    const dropdown = screen.getByRole('listbox', {
      name: 'Select Type',
    });

    await user.click(within(dropdown).getByRole('option', { name: 'Boolean' }));

    expect(onChangeNameFields).toHaveBeenCalledWith([
      'Updated Field',
      '',
      'raduis',
      'raduis',
    ]);
    expect(onChangeTypeFields).toHaveBeenCalledWith([
      'boolean',
      '',
      '',
      'number',
    ]);
  });
});
