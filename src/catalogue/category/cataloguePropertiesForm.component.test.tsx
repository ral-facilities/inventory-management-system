import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  CatalogueCategoryFormData,
  CatalogueItemPropertiesErrorsType,
} from '../../app.types';
import { renderComponentWithBrowserRouter } from '../../testUtils';
import CataloguePropertiesForm, {
  CataloguePropertiesFormProps,
} from './cataloguePropertiesForm.component';

describe('Catalogue Properties Form', () => {
  let props: CataloguePropertiesFormProps;
  let user;
  const onChangeFormFields = vi.fn();
  const onChangeCatalogueItemPropertiesErrors = vi.fn();
  const onChangeAllowedValuesListErrors = vi.fn();

  const resetFormError = vi.fn();
  const createView = () => {
    return renderComponentWithBrowserRouter(
      <CataloguePropertiesForm {...props} />
    );
  };

  beforeEach(() => {
    props = {
      formFields: [],
      onChangeFormFields: onChangeFormFields,
      catalogueItemPropertiesErrors: [],
      onChangeCatalogueItemPropertiesErrors:
        onChangeCatalogueItemPropertiesErrors,
      onChangeAllowedValuesListErrors: onChangeAllowedValuesListErrors,
      allowedValuesListErrors: [],
      resetFormError: resetFormError,
    };
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
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
      {
        name: 'Field 5',
        type: 'string',
        unit: '',
        allowed_values: { type: 'list', values: [] },
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
    await user.click(
      screen.getByRole('button', { name: 'Add catalogue category field entry' })
    );

    await waitFor(() => {
      expect(onChangeFormFields).toHaveBeenCalledWith([
        { mandatory: false, name: '', type: '', unit: '' },
      ]);
    });
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
    await user.click(screen.getAllByTestId('DeleteIcon')[0]);

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

    const select = screen.getByLabelText('Select Unit');
    await user.click(select);

    const dropdown = screen.getByRole('listbox', {
      name: 'Select Unit',
    });

    await user.click(
      within(dropdown).getByRole('option', { name: 'millimeters' })
    );
    // Modified mandatory should be called in the handleChange function
    expect(onChangeFormFields).toHaveBeenCalledWith([
      { name: 'Field 1', type: 'text', unit: 'millimeters', mandatory: false },
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
    const formFields: CatalogueCategoryFormData[] = [
      { name: '', type: 'number', unit: '', mandatory: false },
      { name: '', type: '', unit: '', mandatory: false },
      { name: 'raduis 1', type: '', unit: '', mandatory: false },
      {
        name: 'raduis 2',
        type: 'number',
        unit: '',
        allowed_values: { type: 'list', values: [] },
        mandatory: false,
      },
    ];
    const catalogueItemPropertiesErrors: CatalogueItemPropertiesErrorsType[] = [
      {
        index: 0,
        errors: {
          fieldName: 'name',
          errorMessage: 'Please enter a property name',
        },
      },
      {
        index: 1,
        errors: {
          fieldName: 'name',
          errorMessage: 'Please enter a property name',
        },
      },
      {
        index: 1,
        errors: {
          fieldName: 'type',
          errorMessage: 'Please select a type',
        },
      },
      {
        index: 3,
        errors: {
          fieldName: 'list',
          errorMessage: 'Please create a valid list item',
        },
      },
    ];

    props = {
      ...props,
      formFields: formFields,
      catalogueItemPropertiesErrors: catalogueItemPropertiesErrors,
    };
    createView();

    const nameHelperTexts = screen.queryAllByText(
      'Please enter a property name'
    );
    const typeHelperTexts = screen.queryAllByText('Please select a type');
    const listHelperTexts = screen.queryAllByText(
      'Please create a valid list item'
    );

    expect(nameHelperTexts.length).toBe(2);
    expect(typeHelperTexts.length).toBe(1);
    expect(listHelperTexts.length).toBe(1);

    // Click on the add button
    await user.click(
      await screen.getAllByRole('button', { name: 'Add list item 3' })[0]
    );

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

    await user.click(within(dropdown).getByRole('option', { name: 'Text' }));

    expect(onChangeFormFields).toHaveBeenCalledTimes(3);
    expect(onChangeFormFields).toHaveBeenCalledWith([
      { mandatory: false, name: 'Updated Field', type: 'string', unit: '' },
      { mandatory: false, name: '', type: '', unit: '' },
      { mandatory: false, name: 'raduis 1', type: '', unit: '' },
      {
        mandatory: false,
        name: 'raduis 2',
        allowed_values: { type: 'list', values: [''] },
        type: 'number',
        unit: '',
      },
    ]);
  });

  it('display error if duplicate property names are entered and clears when a name is changed', async () => {
    const formFields = [
      { name: 'Field', type: 'text', unit: '', mandatory: false },
      { name: 'Field 2', type: 'number', unit: 'cm', mandatory: true },
      { name: 'Field', type: 'boolean', mandatory: false },
    ];
    const catalogueItemPropertiesErrors: CatalogueItemPropertiesErrorsType[] = [
      {
        index: 0,
        errors: {
          fieldName: 'name',
          errorMessage:
            'Duplicate property name. Please change the name or remove the property',
        },
      },
      {
        index: 2,
        errors: {
          fieldName: 'name',
          errorMessage:
            'Duplicate property name. Please change the name or remove the property',
        },
      },
    ];

    props = {
      ...props,
      formFields: formFields,
      catalogueItemPropertiesErrors: catalogueItemPropertiesErrors,
    };
    createView();

    const duplicatePropertyNameHelperText = screen.queryAllByText(
      'Duplicate property name. Please change the name or remove the property'
    );
    expect(duplicatePropertyNameHelperText.length).toBe(2);

    const formName = screen.getAllByLabelText('Property Name *');

    // Modify the name field using userEvent
    fireEvent.change(formName[0], {
      target: { value: 'Updated Field' },
    });

    expect(onChangeCatalogueItemPropertiesErrors).toHaveBeenCalledWith([]);
  });

  it('display error if duplicate property names are entered and clears property is deleted', async () => {
    const formFields = [
      { name: 'Field', type: 'text', unit: '', mandatory: false },
      { name: 'Field 2', type: 'number', unit: 'cm', mandatory: true },
      { name: 'Field', type: 'boolean', mandatory: false },
    ];
    const catalogueItemPropertiesErrors: CatalogueItemPropertiesErrorsType[] = [
      {
        index: 0,
        errors: {
          fieldName: 'name',
          errorMessage:
            'Duplicate property name. Please change the name or remove the property',
        },
      },
      {
        index: 2,
        errors: {
          fieldName: 'name',
          errorMessage:
            'Duplicate property name. Please change the name or remove the property',
        },
      },
    ];

    props = {
      ...props,
      formFields: formFields,
      catalogueItemPropertiesErrors: catalogueItemPropertiesErrors,
    };
    createView();

    const duplicatePropertyNameHelperText = screen.queryAllByText(
      'Duplicate property name. Please change the name or remove the property'
    );
    expect(duplicatePropertyNameHelperText.length).toBe(2);

    // Click on the add button
    await user.click(screen.getAllByTestId('DeleteIcon')[0]);

    expect(onChangeCatalogueItemPropertiesErrors).toHaveBeenCalledWith([]);
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

  it('should add a list item when the add icon is clicked', async () => {
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

  it('should edit a list item when the add icon is clicked', async () => {
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

  it('should display error for duplicate values and incorrect type values and the error should be removed if the catalogue item property is deleted', async () => {
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

    const allowedValuesListErrors = [
      {
        index: 0,
        errors: [
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
        errors: [
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
      allowedValuesListErrors: allowedValuesListErrors,
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

    expect(onChangeAllowedValuesListErrors).toHaveBeenCalledWith([
      {
        index: 1,
        errors: [
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

    const allowedValuesListErrors = [
      {
        index: 0,
        errors: [
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
      allowedValuesListErrors: allowedValuesListErrors,
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

    expect(onChangeAllowedValuesListErrors).toHaveBeenCalledWith([
      {
        index: 0,
        errors: [{ errorMessage: 'Please enter a valid number', index: 0 }],
      },
    ]);
  });

  it('should display error for incorrect type values and remove the error if the value has been deleted', async () => {
    const formFields: CatalogueCategoryFormData[] = [
      {
        name: 'Field 3',
        type: 'number',
        unit: 'cm',
        mandatory: true,
        allowed_values: { type: 'list', values: ['top', 'bottom'] },
      },
    ];

    const allowedValuesListErrors = [
      {
        index: 0,
        errors: [
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
      allowedValuesListErrors: allowedValuesListErrors,
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

    expect(onChangeAllowedValuesListErrors).toHaveBeenCalledWith([
      {
        index: 0,
        errors: [{ errorMessage: 'Please enter a valid number', index: 0 }],
      },
    ]);
  });

  it('should display error for duplicate values and incorrect type values and the error should be removed if the type is changed', async () => {
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

    const allowedValuesListErrors = [
      {
        index: 0,
        errors: [
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
        errors: [
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
      allowedValuesListErrors: allowedValuesListErrors,
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

    // Modify the type field
    const select = screen.getAllByLabelText('Select Type *');
    await user.click(select[0]);

    const dropdown = screen.getByRole('listbox', {
      name: 'Select Type',
    });

    await user.click(within(dropdown).getByRole('option', { name: 'Text' }));

    expect(onChangeFormFields).toHaveBeenCalledWith([
      {
        allowed_values: { type: 'list', values: ['top', 'bottom'] },
        mandatory: true,
        name: 'Field 3',
        type: 'string',
        unit: 'cm',
      },
      {
        allowed_values: { type: 'list', values: [12, 11, '13', '13'] },
        mandatory: true,
        name: 'Field 4',
        type: 'string',
        unit: '',
      },
    ]);

    expect(onChangeAllowedValuesListErrors).toHaveBeenCalledWith([
      {
        index: 1,
        errors: [
          { errorMessage: 'Please enter valid text', index: 0 },
          { errorMessage: 'Please enter valid text', index: 1 },
          { errorMessage: 'Duplicate value', index: 2 },
          { errorMessage: 'Duplicate value', index: 3 },
        ],
      },
    ]);
  });
});
