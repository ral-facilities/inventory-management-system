import React from 'react';
import { renderComponentWithBrowserRouter } from '../../setupTests';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CataloguePropertiesForm, {
  CataloguePropertiesFormProps,
} from './cataloguePropertiesForm.component';
import { CatalogueCategoryFormData } from '../../app.types';

describe('Catalogue Properties Form', () => {
  let props: CataloguePropertiesFormProps;
  let user;
  const onChangeFormFields = jest.fn();
  const onChangeNameFields = jest.fn();
  const onChangeTypeFields = jest.fn();
  const onChangeErrorFields = jest.fn();
  const onChangeListItemErrors = jest.fn();
  const onChangePropertyNameError = jest.fn();
  const resetFormError = jest.fn();
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
      propertyNameError: [],
      onChangePropertyNameError: onChangePropertyNameError,
      onChangeListItemErrors: onChangeListItemErrors,
      listItemErrors: [],
      resetFormError: resetFormError,
    };
    user = userEvent.setup();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    const formFields: CatalogueCategoryFormData[] = [
      { name: 'Field 1', type: 'text', unit: '', mandatory: false },
      { name: 'Field 2', type: 'number', unit: 'cm', mandatory: true },
      {
        name: 'Field 3',
        type: 'number',
        unit: 'cm',
        allowed_values: { type: 'list', values: ['1', '2'] },
        mandatory: true,
      },
      {
        name: 'Field 4',
        type: 'string',
        unit: '',
        allowed_values: { type: 'list', values: ['top', 'bottom'] },
        mandatory: true,
      },
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
    user.click(
      screen.getByRole('button', { name: 'Add catalogue category field entry' })
    );

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
      { name: 'raduis 1', type: '', unit: '', mandatory: false },
      { name: 'raduis 2', type: 'number', unit: '', mandatory: false },
    ];
    const nameFields = ['', '', 'raduis 1', 'raduis 2'];
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
      'raduis 1',
      'raduis 2',
    ]);
    expect(onChangeTypeFields).toHaveBeenCalledWith([
      'boolean',
      '',
      '',
      'number',
    ]);
  });

  it('display error if duplicate property names are entered', async () => {
    const formFields = [
      { name: 'Field', type: 'text', unit: '', mandatory: false },
      { name: 'Field 2', type: 'number', unit: 'cm', mandatory: true },
      { name: 'Field', type: 'boolean', mandatory: false },
    ];
    const propertyNameError = ['field'];
    props = {
      ...props,
      formFields: formFields,
      propertyNameError: propertyNameError,
    };
    createView();

    const duplicatePropertyNameHelperText = screen.queryAllByText(
      'Duplicate property name. Please change the name or remove the property'
    );
    expect(duplicatePropertyNameHelperText.length).toBe(2);
  });

  it('should delete a list item when the delete icon is click', async () => {
    const formFields: CatalogueCategoryFormData[] = [
      {
        name: 'Field 3',
        type: 'number',
        unit: 'cm',
        allowed_values: { type: 'list', values: ['1', '2'] },
        mandatory: true,
      },
      {
        name: 'Field 4',
        type: 'string',
        unit: '',
        allowed_values: { type: 'list', values: ['top', 'bottom'] },
        mandatory: true,
      },
    ];

    props = {
      ...props,
      formFields: formFields,
    };
    createView();

    // Click on the add button
    await user.click(
      screen.getAllByRole('button', { name: 'Delete list item 0' })[0]
    );

    await waitFor(() => {
      expect(onChangeFormFields).toHaveBeenCalledWith([
        {
          allowed_values: { type: 'list', values: ['2'] },
          mandatory: true,
          name: 'Field 3',
          type: 'number',
          unit: 'cm',
        },
        {
          allowed_values: { type: 'list', values: ['top', 'bottom'] },
          mandatory: true,
          name: 'Field 4',
          type: 'string',
          unit: '',
        },
      ]);
    });
  });

  it('should add a list item when the add icon is click', async () => {
    const formFields: CatalogueCategoryFormData[] = [
      {
        name: 'Field 3',
        type: 'number',
        unit: 'cm',
        allowed_values: { type: 'list', values: ['1', '2'] },
        mandatory: true,
      },
      {
        name: 'Field 4',
        type: 'string',
        unit: '',
        allowed_values: { type: 'list', values: ['top', 'bottom'] },
        mandatory: true,
      },
    ];

    props = {
      ...props,
      formFields: formFields,
    };
    createView();

    // Click on the add button
    await user.click(
      screen.getAllByRole('button', { name: 'Add list item 0' })[0]
    );

    await waitFor(() => {
      expect(onChangeFormFields).toHaveBeenCalledWith([
        {
          allowed_values: { type: 'list', values: ['1', '2', ''] },
          mandatory: true,
          name: 'Field 3',
          type: 'number',
          unit: 'cm',
        },
        {
          allowed_values: { type: 'list', values: ['top', 'bottom'] },
          mandatory: true,
          name: 'Field 4',
          type: 'string',
          unit: '',
        },
      ]);
    });
  });

  it('should edit a list item when the add icon is click', async () => {
    const formFields: CatalogueCategoryFormData[] = [
      {
        name: 'Field 3',
        type: 'number',
        unit: 'cm',
        allowed_values: { type: 'list', values: ['1', '2'] },
        mandatory: true,
      },
      {
        name: 'Field 4',
        type: 'string',
        unit: '',
        allowed_values: { type: 'list', values: ['top', 'bottom'] },
        mandatory: true,
      },
    ];

    props = {
      ...props,
      formFields: formFields,
    };
    createView();

    // Click on the add button
    const listItem1 = screen.getAllByLabelText('List Item 1');

    fireEvent.change(within(listItem1[0]).getByLabelText('List Item'), {
      target: { value: '6' },
    });
    await waitFor(() => {
      expect(onChangeFormFields).toHaveBeenCalledWith([
        {
          allowed_values: { type: 'list', values: ['1', '6'] },
          mandatory: true,
          name: 'Field 3',
          type: 'number',
          unit: 'cm',
        },
        {
          allowed_values: { type: 'list', values: ['top', 'bottom'] },
          mandatory: true,
          name: 'Field 4',
          type: 'string',
          unit: '',
        },
      ]);
    });
  });

  it('should set the allowed values to undefined if switched to any', async () => {
    const formFields: CatalogueCategoryFormData[] = [
      {
        name: 'Field 3',
        type: 'number',
        unit: 'cm',
        allowed_values: { type: 'list', values: ['1', '2'] },
        mandatory: true,
      },
      {
        name: 'Field 4',
        type: 'string',
        unit: '',
        allowed_values: { type: 'list', values: ['top', 'bottom'] },
        mandatory: true,
      },
    ];

    props = {
      ...props,
      formFields: formFields,
    };
    createView();

    const select = screen.getAllByLabelText('Select Allowed values *');
    await user.click(select[0]);

    const dropdown = screen.getByRole('listbox', {
      name: 'Select Allowed values',
    });

    await user.click(within(dropdown).getByRole('option', { name: 'Any' }));
    await waitFor(() => {
      expect(onChangeFormFields).toHaveBeenCalledWith([
        {
          mandatory: true,
          name: 'Field 3',
          type: 'number',
          unit: 'cm',
        },
        {
          allowed_values: { type: 'list', values: ['top', 'bottom'] },
          mandatory: true,
          name: 'Field 4',
          type: 'string',
          unit: '',
        },
      ]);
    });
  });

  it('should set the allowed values to empty if switched to list from any', async () => {
    const formFields: CatalogueCategoryFormData[] = [
      {
        name: 'Field 3',
        type: 'number',
        unit: 'cm',
        mandatory: true,
      },
      {
        name: 'Field 4',
        type: 'string',
        unit: '',
        allowed_values: { type: 'list', values: ['top', 'bottom'] },
        mandatory: true,
      },
    ];

    props = {
      ...props,
      formFields: formFields,
    };
    createView();

    const select = screen.getAllByLabelText('Select Allowed values *');
    await user.click(select[0]);

    const dropdown = screen.getByRole('listbox', {
      name: 'Select Allowed values',
    });

    await user.click(within(dropdown).getByRole('option', { name: 'List' }));
    await waitFor(() => {
      expect(onChangeFormFields).toHaveBeenCalledWith([
        {
          allowed_values: { type: 'list', values: [] },
          mandatory: true,
          name: 'Field 3',
          type: 'number',
          unit: 'cm',
        },
        {
          allowed_values: { type: 'list', values: ['top', 'bottom'] },
          mandatory: true,
          name: 'Field 4',
          type: 'string',
          unit: '',
        },
      ]);
    });
  });

  it('should error for duplicate values and incorrect type values and the error should be remove if catalogue item property is deleted', async () => {
    const formFields: CatalogueCategoryFormData[] = [
      {
        name: 'Field 3',
        type: 'number',
        unit: 'cm',
        mandatory: true,
        allowed_values: { type: 'list', values: ['top', 'bottom'] },
      },
      {
        name: 'Field 4',
        type: 'string',
        unit: '',
        allowed_values: { type: 'list', values: [12, 11, '13', '13'] },
        mandatory: true,
      },
    ];

    const listItemErrors = [
      {
        index: 0,
        valueIndex: [
          {
            index: 0,
            errorMessage: 'Please enter a valid number',
          },
          {
            index: 1,
            errorMessage: 'Please enter a valid number',
          },
        ],
      },
      {
        index: 1,
        valueIndex: [
          {
            index: 0,
            errorMessage: 'Please enter valid text',
          },
          {
            index: 1,
            errorMessage: 'Please enter valid text',
          },
          {
            index: 2,
            errorMessage: 'Duplicate value',
          },
          {
            index: 3,
            errorMessage: 'Duplicate value',
          },
        ],
      },
    ];

    props = {
      ...props,
      formFields: formFields,
      listItemErrors: listItemErrors,
    };
    createView();

    const invalidTextHelperText = screen.getAllByText(
      'Please enter valid text'
    );
    const invalidNumberHelperText = screen.getAllByText(
      'Please enter a valid number'
    );
    const invalidDuplicateHelperText = screen.getAllByText('Duplicate value');

    expect(invalidDuplicateHelperText.length).toEqual(2);
    expect(invalidNumberHelperText.length).toEqual(2);
    expect(invalidTextHelperText.length).toEqual(2);

    await user.click(
      screen.getAllByRole('button', {
        name: 'Delete catalogue category field entry',
      })[0]
    );

    await waitFor(() => {
      expect(onChangeFormFields).toHaveBeenCalledWith([
        {
          allowed_values: { type: 'list', values: [12, 11, '13', '13'] },
          mandatory: true,
          name: 'Field 4',
          type: 'string',
          unit: '',
        },
      ]);
    });

    expect(onChangeListItemErrors).toHaveBeenCalledWith([
      {
        index: 1,
        valueIndex: [
          { errorMessage: 'Please enter valid text', index: 0 },
          { errorMessage: 'Please enter valid text', index: 1 },
          { errorMessage: 'Duplicate value', index: 2 },
          { errorMessage: 'Duplicate value', index: 3 },
        ],
      },
    ]);
  });

  it('should error for incorrect type values and remove error if a values has been changed for the specfic list item', async () => {
    const formFields: CatalogueCategoryFormData[] = [
      {
        name: 'Field 3',
        type: 'number',
        unit: 'cm',
        mandatory: true,
        allowed_values: { type: 'list', values: ['top', 'bottom'] },
      },
    ];

    const listItemErrors = [
      {
        index: 0,
        valueIndex: [
          {
            index: 0,
            errorMessage: 'Please enter a valid number',
          },
          {
            index: 1,
            errorMessage: 'Please enter a valid number',
          },
        ],
      },
    ];

    props = {
      ...props,
      formFields: formFields,
      listItemErrors: listItemErrors,
    };
    createView();

    const invalidNumberHelperText = screen.getAllByText(
      'Please enter a valid number'
    );

    expect(invalidNumberHelperText.length).toEqual(2);

    // Click on the add button
    const listItem1 = screen.getAllByLabelText('List Item 1');

    fireEvent.change(within(listItem1[0]).getByLabelText('List Item'), {
      target: { value: '6' },
    });

    await waitFor(() => {
      expect(onChangeFormFields).toHaveBeenCalledWith([
        {
          allowed_values: { type: 'list', values: ['top', '6'] },
          mandatory: true,
          name: 'Field 3',
          type: 'number',
          unit: 'cm',
        },
      ]);
    });

    expect(onChangeListItemErrors).toHaveBeenCalledWith([
      {
        index: 0,
        valueIndex: [{ errorMessage: 'Please enter a valid number', index: 0 }],
      },
    ]);
  });

  it('should error for incorrect type values and remove error if the value has been deleted', async () => {
    const formFields: CatalogueCategoryFormData[] = [
      {
        name: 'Field 3',
        type: 'number',
        unit: 'cm',
        mandatory: true,
        allowed_values: { type: 'list', values: ['top', 'bottom'] },
      },
    ];

    const listItemErrors = [
      {
        index: 0,
        valueIndex: [
          {
            index: 0,
            errorMessage: 'Please enter a valid number',
          },
          {
            index: 1,
            errorMessage: 'Please enter a valid number',
          },
        ],
      },
    ];

    props = {
      ...props,
      formFields: formFields,
      listItemErrors: listItemErrors,
    };
    createView();

    const invalidNumberHelperText = screen.getAllByText(
      'Please enter a valid number'
    );

    expect(invalidNumberHelperText.length).toEqual(2);

    // Click on the add button
    const listItemDelete = screen.getAllByRole('button', {
      name: `Delete list item 1`,
    });

    await user.click(listItemDelete[0]);

    await waitFor(() => {
      expect(onChangeFormFields).toHaveBeenCalledWith([
        {
          allowed_values: { type: 'list', values: ['top'] },
          mandatory: true,
          name: 'Field 3',
          type: 'number',
          unit: 'cm',
        },
      ]);
    });

    expect(onChangeListItemErrors).toHaveBeenCalledWith([
      {
        index: 0,
        valueIndex: [{ errorMessage: 'Please enter a valid number', index: 0 }],
      },
    ]);
  });
});
