import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import {
  CatalogueItemPropertiesErrorsType,
  AddCatalogueCategoryPropertyWithPlacementIds,
  AllowedValuesListErrorsType,
} from '../../app.types';
import { renderComponentWithRouterProvider } from '../../testUtils';
import CataloguePropertiesForm, {
  CataloguePropertiesFormProps,
} from './cataloguePropertiesForm.component';
import { resetUniqueIdCounter } from '../../utils';

describe('Catalogue Properties Form', () => {
  let props: CataloguePropertiesFormProps;
  let user: UserEvent;
  const onChangeFormFields = vi.fn();
  const onChangeCatalogueItemPropertiesErrors = vi.fn();
  const onChangeAllowedValuesListErrors = vi.fn();
  const onChangeEditCatalogueItemField = vi.fn();

  const resetFormError = vi.fn();

  //interface test
  const createView = () => {
    return renderComponentWithRouterProvider(
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
      isDisabled: false,
    };
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
    resetUniqueIdCounter();
  });

  it('renders correctly', async () => {
    const formFields: AddCatalogueCategoryPropertyWithPlacementIds[] = [
      {
        cip_placement_id: '1',
        name: 'Field 1',
        type: 'text',
        mandatory: false,
      },
      {
        cip_placement_id: '2',
        name: 'Field 2',
        type: 'number',
        unit_id: '0',
        mandatory: true,
      },
      {
        cip_placement_id: '3',
        name: 'Field 3',
        type: 'number',
        unit_id: '0',
        allowed_values: {
          type: 'list',
          values: [
            { av_placement_id: '6', value: '1' },
            { av_placement_id: '7', value: '2' },
          ],
        },
        mandatory: true,
      },
      {
        cip_placement_id: '4',
        name: 'Field 4',
        type: 'string',
        allowed_values: {
          type: 'list',
          values: [
            { av_placement_id: '8', value: 'top' },
            { av_placement_id: '9', value: 'bottom' },
          ],
        },
        mandatory: true,
      },
      {
        cip_placement_id: '5',
        name: 'Field 5',
        type: 'string',
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

  it('renders correctly when disabled', async () => {
    const formFields: AddCatalogueCategoryPropertyWithPlacementIds[] = [
      {
        cip_placement_id: '1',
        name: 'Field 1',
        type: 'text',
        mandatory: false,
      },
      {
        cip_placement_id: '2',
        name: 'Field 2',
        type: 'number',
        unit_id: '0',
        mandatory: true,
      },
      {
        cip_placement_id: '3',
        name: 'Field 3',
        type: 'number',
        unit_id: '0',
        allowed_values: {
          type: 'list',
          values: [
            { av_placement_id: '6', value: '1' },
            { av_placement_id: '7', value: '2' },
          ],
        },
        mandatory: true,
      },
      {
        cip_placement_id: '4',
        name: 'Field 4',
        type: 'string',
        allowed_values: {
          type: 'list',
          values: [
            { av_placement_id: '8', value: 'top' },
            { av_placement_id: '9', value: 'bottom' },
          ],
        },
        mandatory: true,
      },
      {
        cip_placement_id: '5',
        name: 'Field 5',
        type: 'string',
        allowed_values: { type: 'list', values: [] },
        mandatory: true,
      },
    ];

    props = {
      ...props,
      formFields: formFields,
      isDisabled: true,
    };
    const { asFragment } = createView();
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly for migration dialog', async () => {
    const formFields: AddCatalogueCategoryPropertyWithPlacementIds[] = [
      {
        cip_placement_id: '1',
        name: 'Field 1',
        type: 'text',
        mandatory: false,
      },
      {
        cip_placement_id: '2',
        name: 'Field 2',
        type: 'number',
        unit_id: '0',
        mandatory: true,
      },
      {
        cip_placement_id: '3',
        name: 'Field 3',
        type: 'number',
        unit_id: '0',
        allowed_values: {
          type: 'list',
          values: [
            { av_placement_id: '6', value: '1' },
            { av_placement_id: '7', value: '2' },
          ],
        },
        mandatory: true,
      },
      {
        cip_placement_id: '4',
        name: 'Field 4',
        type: 'string',
        allowed_values: {
          type: 'list',
          values: [
            { av_placement_id: '8', value: 'top' },
            { av_placement_id: '9', value: 'bottom' },
          ],
        },
        mandatory: true,
      },
      {
        cip_placement_id: '5',
        name: 'Field 5',
        type: 'string',
        allowed_values: { type: 'list', values: [] },
        mandatory: true,
      },
    ];

    props = {
      formFields: formFields,
      isDisabled: true,
      onChangeEditCatalogueItemField: onChangeEditCatalogueItemField,
      selectedCatalogueItemField: {
        name: 'Field 5',
        type: 'string',
        allowed_values: { type: 'list', values: [] },
        mandatory: true,
      },
    };
    const { asFragment } = createView();
    expect(asFragment()).toMatchSnapshot();
  });

  it('should select the radio button when clicked', async () => {
    const formFields = [
      {
        id: '1',
        cip_placement_id: '1',
        name: 'Field 1',
        type: 'text',
        mandatory: false,
      },
      {
        id: '2',
        cip_placement_id: '2',
        name: 'Field 2',
        type: 'number',
        unit_id: '0',
        mandatory: true,
      },
      {
        id: '3',
        cip_placement_id: '3',
        name: 'Field 3',
        type: 'number',
        unit_id: '0',
        allowed_values: {
          type: 'list',
          values: [
            { av_placement_id: '6', value: '1' },
            { av_placement_id: '7', value: '2' },
          ],
        },
        mandatory: true,
      },
      {
        id: '4',
        cip_placement_id: '4',
        name: 'Field 4',
        type: 'string',
        allowed_values: {
          type: 'list',
          values: [
            { av_placement_id: '8', value: 'top' },
            { av_placement_id: '9', value: 'bottom' },
          ],
        },
        mandatory: true,
      },
      {
        id: '5',
        cip_placement_id: '5',
        name: 'Field 5',
        type: 'string',
        allowed_values: { type: 'list', values: [] },
        mandatory: true,
      },
    ];

    props = {
      formFields: formFields as AddCatalogueCategoryPropertyWithPlacementIds[],
      isDisabled: true,
      onChangeEditCatalogueItemField: onChangeEditCatalogueItemField,
      selectedCatalogueItemField: {
        id: '5',
        name: 'Field 5',
        type: 'string',
        allowed_values: { type: 'list', values: [] },
        mandatory: true,
      },
    };
    createView();

    const field1RadioButton = screen.getByLabelText('Field 1 radio button');

    await user.click(field1RadioButton);

    await waitFor(() => {
      expect(onChangeEditCatalogueItemField).toBeCalled();
    });

    expect(onChangeEditCatalogueItemField).toHaveBeenCalledWith({
      id: '1',
      mandatory: false,
      name: 'Field 1',
      type: 'text',
    });
  });

  it('should add a new field when clicking on the add button', async () => {
    createView();

    // Click on the add button
    await user.click(
      screen.getByRole('button', { name: 'Add catalogue category field entry' })
    );

    await waitFor(() => {
      expect(onChangeFormFields).toHaveBeenCalledWith([
        {
          mandatory: false,
          name: '',
          type: '',
          allowed_values: undefined,
          cip_placement_id: 'cip_placement_id_1',
        },
      ]);
    });
  });

  it('should add a delete a field when clicking on the bin button', async () => {
    const formFields = [
      {
        cip_placement_id: '1',
        name: 'Field 1',
        type: 'text',
        mandatory: false,
      },
      {
        cip_placement_id: '2',
        name: 'Field 2',
        type: 'number',
        unit_id: '0',
        mandatory: true,
      },
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
        {
          cip_placement_id: '2',
          mandatory: true,
          name: 'Field 2',
          type: 'number',
          unit_id: '0',
        },
      ]);
    });
  });

  it('should handle changes in form fields', async () => {
    const formFields = [
      {
        cip_placement_id: '1',
        name: 'Field 1',
        type: 'text',
        mandatory: false,
      },
    ];
    props = { ...props, formFields: formFields };
    createView();

    // Modify the name field using userEvent
    fireEvent.change(screen.getByLabelText('Property Name *'), {
      target: { value: 'Updated Field' },
    });

    // Modified name should be called in the handleChange function
    expect(onChangeFormFields).toHaveBeenCalledWith([
      {
        cip_placement_id: '1',
        name: 'Updated Field',
        type: 'text',
        mandatory: false,
      },
    ]);
  });

  it('should handle changes in the "Type" field', async () => {
    const formFields = [
      {
        cip_placement_id: '1',
        name: 'Field 1',
        type: 'text',
        mandatory: false,
      },
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
      {
        cip_placement_id: '1',
        name: 'Field 1',
        type: 'number',
        mandatory: false,
      },
    ]);
  });

  it('should handle changes in the "Mandatory" field', async () => {
    const formFields = [
      {
        cip_placement_id: '1',
        name: 'Field 1',
        type: 'text',
        mandatory: false,
      },
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
      {
        cip_placement_id: '1',
        name: 'Field 1',
        type: 'text',
        mandatory: true,
      },
    ]);
  });

  it('should handle changes in the "Unit" field', async () => {
    const formFields = [
      {
        cip_placement_id: '1',
        name: 'Field 1',
        type: 'text',
        mandatory: false,
      },
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
      {
        cip_placement_id: '1',
        name: 'Field 1',
        type: 'text',
        unit_id: '5',
        mandatory: false,
      },
    ]);
  });

  it('should disable "Unit" field when type is boolean', async () => {
    const formFields = [
      {
        cip_placement_id: '1',
        name: 'Field 1',
        type: 'boolean',
        mandatory: false,
      },
    ];
    props = { ...props, formFields: formFields };
    createView();

    expect(screen.getByLabelText('Select Unit')).toBeDisabled();
  });

  it('should remove "Unit" field when type is boolean', async () => {
    const formFields = [
      {
        cip_placement_id: '1',
        name: 'Field 1',
        type: 'number',
        mandatory: false,
      },
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
      {
        cip_placement_id: '1',
        name: 'Field 1',
        type: 'boolean',
        mandatory: false,
      },
    ]);
  });

  it('should remove the empty list error message if the allowed value is any', async () => {
    const formFields: AddCatalogueCategoryPropertyWithPlacementIds[] = [
      {
        cip_placement_id: '4',
        name: 'radius 2',
        type: 'number',
        allowed_values: { type: 'list', values: [] },
        mandatory: false,
      },
    ];
    const catalogueItemPropertiesErrors: CatalogueItemPropertiesErrorsType[] = [
      {
        cip_placement_id: '4',
        errors: {
          fieldName: 'allowed_values',
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

    const listHelperTexts = screen.queryAllByText(
      'Please create a valid list item'
    );

    expect(listHelperTexts.length).toBe(1);

    const select = screen.getAllByLabelText('Select Allowed values *');
    await user.click(select[0]);

    const dropdown = screen.getByRole('listbox', {
      name: 'Select Allowed values',
    });

    await user.click(within(dropdown).getByRole('option', { name: 'Any' }));

    expect(onChangeFormFields).toHaveBeenCalledTimes(1);
    expect(onChangeFormFields).toHaveBeenCalledWith([
      {
        cip_placement_id: '4',
        mandatory: false,
        name: 'radius 2',
        type: 'number',
      },
    ]);
  }, 10000);

  it('display error message for type and name if they are not filled in', async () => {
    const formFields: AddCatalogueCategoryPropertyWithPlacementIds[] = [
      {
        cip_placement_id: '1',
        name: '',
        type: 'number',
        mandatory: false,
      },
      {
        cip_placement_id: '2',
        name: '',
        type: '',
        mandatory: false,
      },
      {
        cip_placement_id: '3',
        name: 'radius 1',
        type: '',
        mandatory: false,
      },
      {
        cip_placement_id: '4',
        name: 'radius 2',
        type: 'number',
        allowed_values: { type: 'list', values: [] },
        mandatory: false,
      },
    ];
    const catalogueItemPropertiesErrors: CatalogueItemPropertiesErrorsType[] = [
      {
        cip_placement_id: '1',
        errors: {
          fieldName: 'name',
          errorMessage: 'Please enter a property name',
        },
      },
      {
        cip_placement_id: '2',
        errors: {
          fieldName: 'name',
          errorMessage: 'Please enter a property name',
        },
      },
      {
        cip_placement_id: '2',
        errors: {
          fieldName: 'type',
          errorMessage: 'Please select a type',
        },
      },
      {
        cip_placement_id: '4',
        errors: {
          fieldName: 'allowed_values',
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
    await user.click(screen.getByRole('button', { name: 'Add list item' }));

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
      {
        cip_placement_id: '1',
        mandatory: false,
        name: 'Updated Field',
        type: 'string',
      },
      {
        cip_placement_id: '2',
        mandatory: false,
        name: '',
        type: '',
      },
      {
        cip_placement_id: '3',
        mandatory: false,
        name: 'radius 1',
        type: '',
      },
      {
        cip_placement_id: '4',
        mandatory: false,
        name: 'radius 2',
        allowed_values: {
          type: 'list',
          values: [{ av_placement_id: 'av_placement_id_1', value: '' }],
        },
        type: 'number',
      },
    ]);
  }, 10000);

  it('display error if duplicate property names are entered and clears when a name is changed', async () => {
    const formFields = [
      {
        cip_placement_id: '1',
        name: 'Field',
        type: 'text',
        mandatory: false,
      },
      {
        cip_placement_id: '2',
        name: 'Field 2',
        type: 'number',
        unit_id: '0',
        mandatory: true,
      },
      {
        cip_placement_id: '3',
        name: 'Field',
        type: 'boolean',
        mandatory: false,
      },
    ];
    const catalogueItemPropertiesErrors: CatalogueItemPropertiesErrorsType[] = [
      {
        cip_placement_id: '1',
        errors: {
          fieldName: 'name',
          errorMessage:
            'Duplicate property name. Please change the name or remove the property',
        },
      },
      {
        cip_placement_id: '3',
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
      {
        cip_placement_id: '1',
        name: 'Field',
        type: 'text',
        mandatory: false,
      },
      {
        cip_placement_id: '2',
        name: 'Field 2',
        type: 'number',
        unit_id: '0',
        mandatory: true,
      },
      {
        cip_placement_id: '3',
        name: 'Field',
        type: 'boolean',
        mandatory: false,
      },
    ];
    const catalogueItemPropertiesErrors: CatalogueItemPropertiesErrorsType[] = [
      {
        cip_placement_id: '1',
        errors: {
          fieldName: 'name',
          errorMessage:
            'Duplicate property name. Please change the name or remove the property',
        },
      },
      {
        cip_placement_id: '3',
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
    const formFields: AddCatalogueCategoryPropertyWithPlacementIds[] = [
      {
        cip_placement_id: '1',
        name: 'Field 3',
        type: 'number',
        unit_id: '0',
        allowed_values: {
          type: 'list',
          values: [
            { av_placement_id: '3', value: '1' },
            { av_placement_id: '4', value: '2' },
          ],
        },
        mandatory: true,
      },
      {
        cip_placement_id: '2',
        name: 'Field 4',
        type: 'string',
        allowed_values: {
          type: 'list',
          values: [
            { av_placement_id: '5', value: 'top' },
            { av_placement_id: '6', value: 'bottom' },
          ],
        },
        mandatory: true,
      },
    ];

    props = {
      ...props,
      formFields: formFields,
    };
    createView();

    // Click on the add button
    await user.click(screen.getByTestId('3: Delete list item'));

    await waitFor(() => {
      expect(onChangeFormFields).toHaveBeenCalledWith([
        {
          cip_placement_id: '1',
          allowed_values: {
            type: 'list',
            values: [{ av_placement_id: '4', value: '2' }],
          },
          mandatory: true,
          name: 'Field 3',
          type: 'number',
          unit_id: '0',
        },
        {
          cip_placement_id: '2',
          allowed_values: {
            type: 'list',
            values: [
              { av_placement_id: '5', value: 'top' },
              { av_placement_id: '6', value: 'bottom' },
            ],
          },
          mandatory: true,
          name: 'Field 4',
          type: 'string',
        },
      ]);
    });
  });

  it('should add a list item when the add icon is clicked', async () => {
    const formFields: AddCatalogueCategoryPropertyWithPlacementIds[] = [
      {
        cip_placement_id: '1',
        name: 'Field 3',
        type: 'number',
        unit_id: '0',
        allowed_values: {
          type: 'list',
          values: [
            { av_placement_id: '3', value: '1' },
            { av_placement_id: '4', value: '2' },
          ],
        },
        mandatory: true,
      },
      {
        cip_placement_id: '2',
        name: 'Field 4',
        type: 'string',
        allowed_values: {
          type: 'list',
          values: [
            { av_placement_id: '5', value: 'top' },
            { av_placement_id: '6', value: 'bottom' },
          ],
        },
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
      screen.getAllByRole('button', { name: 'Add list item' })[0]
    );

    await waitFor(() => {
      expect(onChangeFormFields).toHaveBeenCalledWith([
        {
          cip_placement_id: '1',
          allowed_values: {
            type: 'list',
            values: [
              { av_placement_id: '3', value: '1' },
              { av_placement_id: '4', value: '2' },
              { av_placement_id: 'av_placement_id_1', value: '' },
            ],
          },
          mandatory: true,
          name: 'Field 3',
          type: 'number',
          unit_id: '0',
        },
        {
          cip_placement_id: '2',
          allowed_values: {
            type: 'list',
            values: [
              { av_placement_id: '5', value: 'top' },
              { av_placement_id: '6', value: 'bottom' },
            ],
          },
          mandatory: true,
          name: 'Field 4',
          type: 'string',
        },
      ]);
    });
  });

  it('should edit a list item when the add icon is clicked', async () => {
    const formFields: AddCatalogueCategoryPropertyWithPlacementIds[] = [
      {
        cip_placement_id: '1',
        name: 'Field 3',
        type: 'number',
        unit_id: '0',
        allowed_values: {
          type: 'list',
          values: [
            { av_placement_id: '3', value: '1' },
            { av_placement_id: '4', value: '2' },
          ],
        },
        mandatory: true,
      },
      {
        cip_placement_id: '2',
        name: 'Field 4',
        type: 'string',
        allowed_values: {
          type: 'list',
          values: [
            { av_placement_id: '5', value: 'top' },
            { av_placement_id: '6', value: 'bottom' },
          ],
        },
        mandatory: true,
      },
    ];

    props = {
      ...props,
      formFields: formFields,
    };
    createView();

    // Click on the add button
    const listItem1 = screen.getByTestId('4: List Item');

    fireEvent.change(within(listItem1).getByLabelText('List Item'), {
      target: { value: '6' },
    });
    await waitFor(() => {
      expect(onChangeFormFields).toHaveBeenCalledWith([
        {
          cip_placement_id: '1',
          allowed_values: {
            type: 'list',
            values: [
              { av_placement_id: '3', value: '1' },
              { av_placement_id: '4', value: '6' },
            ],
          },
          mandatory: true,
          name: 'Field 3',
          type: 'number',
          unit_id: '0',
        },
        {
          cip_placement_id: '2',
          allowed_values: {
            type: 'list',
            values: [
              { av_placement_id: '5', value: 'top' },
              { av_placement_id: '6', value: 'bottom' },
            ],
          },
          mandatory: true,
          name: 'Field 4',
          type: 'string',
        },
      ]);
    });
  });

  it('should set the allowed values to undefined if switched to any', async () => {
    const formFields: AddCatalogueCategoryPropertyWithPlacementIds[] = [
      {
        cip_placement_id: '1',
        name: 'Field 3',
        type: 'number',
        unit_id: '0',
        allowed_values: {
          type: 'list',
          values: [
            { av_placement_id: '3', value: '1' },
            { av_placement_id: '4', value: '2' },
          ],
        },
        mandatory: true,
      },
      {
        cip_placement_id: '2',
        name: 'Field 4',
        type: 'string',
        allowed_values: {
          type: 'list',
          values: [
            { av_placement_id: '5', value: 'top' },
            { av_placement_id: '6', value: 'bottom' },
          ],
        },
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
          cip_placement_id: '1',
          mandatory: true,
          name: 'Field 3',
          type: 'number',
          unit_id: '0',
        },
        {
          cip_placement_id: '2',
          allowed_values: {
            type: 'list',
            values: [
              { av_placement_id: '5', value: 'top' },
              { av_placement_id: '6', value: 'bottom' },
            ],
          },
          mandatory: true,
          name: 'Field 4',
          type: 'string',
        },
      ]);
    });
  });

  it('should set the allowed values to empty if switched to list from any', async () => {
    const formFields: AddCatalogueCategoryPropertyWithPlacementIds[] = [
      {
        cip_placement_id: '1',
        name: 'Field 3',
        type: 'number',
        unit_id: '0',
        mandatory: true,
      },
      {
        cip_placement_id: '2',
        name: 'Field 4',
        type: 'string',
        allowed_values: {
          type: 'list',
          values: [
            { av_placement_id: '5', value: 'top' },
            { av_placement_id: '6', value: 'bottom' },
          ],
        },
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
          cip_placement_id: '1',
          allowed_values: { type: 'list', values: [] },
          mandatory: true,
          name: 'Field 3',
          type: 'number',
          unit_id: '0',
        },
        {
          cip_placement_id: '2',
          allowed_values: {
            type: 'list',
            values: [
              { av_placement_id: '5', value: 'top' },
              { av_placement_id: '6', value: 'bottom' },
            ],
          },
          mandatory: true,
          name: 'Field 4',
          type: 'string',
        },
      ]);
    });
  });

  it('should display error for duplicate values and incorrect type values and the error should be removed if the catalogue item property is deleted', async () => {
    const formFields: AddCatalogueCategoryPropertyWithPlacementIds[] = [
      {
        cip_placement_id: '1',
        name: 'Field 3',
        type: 'number',
        unit_id: '0',
        mandatory: true,
        allowed_values: {
          type: 'list',
          values: [
            { av_placement_id: '3', value: 'top' },
            { av_placement_id: '4', value: 'bottom' },
          ],
        },
      },
      {
        cip_placement_id: '2',
        name: 'Field 4',
        type: 'string',
        allowed_values: {
          type: 'list',
          values: [
            { av_placement_id: '5', value: 12 },
            { av_placement_id: '6', value: 11 },
            { av_placement_id: '7', value: '13' },
            { av_placement_id: '8', value: '13' },
          ],
        },
        mandatory: true,
      },
    ];

    const allowedValuesListErrors: AllowedValuesListErrorsType[] = [
      {
        cip_placement_id: '1',
        errors: [
          {
            av_placement_id: '3',
            errorMessage: 'Please enter a valid number',
          },
          {
            av_placement_id: '4',
            errorMessage: 'Please enter a valid number',
          },
        ],
      },
      {
        cip_placement_id: '2',
        errors: [
          {
            av_placement_id: '5',
            errorMessage: 'Please enter valid text',
          },
          {
            av_placement_id: '6',
            errorMessage: 'Please enter valid text',
          },
          {
            av_placement_id: '7',
            errorMessage: 'Duplicate value',
          },
          {
            av_placement_id: '8',
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
        name: 'Delete catalogue Item Field entry',
      })[0]
    );

    await waitFor(() => {
      expect(onChangeFormFields).toHaveBeenCalledWith([
        {
          cip_placement_id: '2',
          allowed_values: {
            type: 'list',
            values: [
              { av_placement_id: '5', value: 12 },
              { av_placement_id: '6', value: 11 },
              { av_placement_id: '7', value: '13' },
              { av_placement_id: '8', value: '13' },
            ],
          },
          mandatory: true,
          name: 'Field 4',
          type: 'string',
        },
      ]);
    });

    expect(onChangeAllowedValuesListErrors).toHaveBeenCalledWith([
      {
        cip_placement_id: '2',
        errors: [
          { errorMessage: 'Please enter valid text', av_placement_id: '5' },
          { errorMessage: 'Please enter valid text', av_placement_id: '6' },
          { errorMessage: 'Duplicate value', av_placement_id: '7' },
          { errorMessage: 'Duplicate value', av_placement_id: '8' },
        ],
      },
    ]);
  });

  it('should error for incorrect type values and remove error if a values has been changed for the specific list item', async () => {
    const formFields: AddCatalogueCategoryPropertyWithPlacementIds[] = [
      {
        cip_placement_id: '1',
        name: 'Field 3',
        type: 'number',
        unit_id: '0',
        mandatory: true,
        allowed_values: {
          type: 'list',
          values: [
            { av_placement_id: '5', value: 'top' },
            { av_placement_id: '6', value: 'bottom' },
          ],
        },
      },
    ];

    const allowedValuesListErrors = [
      {
        cip_placement_id: '1',
        errors: [
          {
            av_placement_id: '5',
            errorMessage: 'Please enter a valid number',
          },
          {
            av_placement_id: '6',
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
    const listItem1 = screen.getByTestId('6: List Item');

    fireEvent.change(within(listItem1).getByLabelText('List Item'), {
      target: { value: '6' },
    });

    await waitFor(() => {
      expect(onChangeFormFields).toHaveBeenCalledWith([
        {
          cip_placement_id: '1',
          allowed_values: {
            type: 'list',
            values: [
              { av_placement_id: '5', value: 'top' },
              { av_placement_id: '6', value: '6' },
            ],
          },
          mandatory: true,
          name: 'Field 3',
          type: 'number',
          unit_id: '0',
        },
      ]);
    });

    expect(onChangeAllowedValuesListErrors).toHaveBeenCalledWith([
      {
        cip_placement_id: '1',
        errors: [
          { errorMessage: 'Please enter a valid number', av_placement_id: '5' },
        ],
      },
    ]);
  });

  it('should display error for incorrect type values and remove the error if the value has been deleted', async () => {
    const formFields: AddCatalogueCategoryPropertyWithPlacementIds[] = [
      {
        cip_placement_id: '1',
        name: 'Field 3',
        type: 'number',
        unit_id: '0',
        mandatory: true,
        allowed_values: {
          type: 'list',
          values: [
            { av_placement_id: '5', value: 'top' },
            { av_placement_id: '6', value: 'bottom' },
          ],
        },
      },
    ];

    const allowedValuesListErrors = [
      {
        cip_placement_id: '1',
        errors: [
          {
            av_placement_id: '5',
            errorMessage: 'Please enter a valid number',
          },
          {
            av_placement_id: '6',
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
    const listItemDelete = screen.getByTestId('6: Delete list item');

    await user.click(listItemDelete);

    await waitFor(() => {
      expect(onChangeFormFields).toHaveBeenCalledWith([
        {
          cip_placement_id: '1',
          allowed_values: {
            type: 'list',
            values: [{ av_placement_id: '5', value: 'top' }],
          },
          mandatory: true,
          name: 'Field 3',
          type: 'number',
          unit_id: '0',
        },
      ]);
    });

    expect(onChangeAllowedValuesListErrors).toHaveBeenCalledWith([
      {
        cip_placement_id: '1',
        errors: [
          { errorMessage: 'Please enter a valid number', av_placement_id: '5' },
        ],
      },
    ]);
  });

  it('should display error for duplicate values and incorrect type values and the error should be removed if the type is changed', async () => {
    const formFields: AddCatalogueCategoryPropertyWithPlacementIds[] = [
      {
        cip_placement_id: '1',
        name: 'Field 3',
        type: 'number',
        unit_id: '0',
        mandatory: true,
        allowed_values: {
          type: 'list',
          values: [
            { av_placement_id: '3', value: 'top' },
            { av_placement_id: '4', value: 'bottom' },
          ],
        },
      },
      {
        cip_placement_id: '2',
        name: 'Field 4',
        type: 'string',
        allowed_values: {
          type: 'list',
          values: [
            { av_placement_id: '5', value: 12 },
            { av_placement_id: '6', value: 11 },
            { av_placement_id: '7', value: '13' },
            { av_placement_id: '8', value: '13' },
          ],
        },
        mandatory: true,
      },
    ];

    const allowedValuesListErrors = [
      {
        cip_placement_id: '1',
        errors: [
          {
            av_placement_id: '3',
            errorMessage: 'Please enter a valid number',
          },
          {
            av_placement_id: '4',
            errorMessage: 'Please enter a valid number',
          },
        ],
      },
      {
        cip_placement_id: '2',
        errors: [
          {
            av_placement_id: '5',
            errorMessage: 'Please enter valid text',
          },
          {
            av_placement_id: '6',
            errorMessage: 'Please enter valid text',
          },
          {
            av_placement_id: '7',
            errorMessage: 'Duplicate value',
          },
          {
            av_placement_id: '8',
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
        cip_placement_id: '1',
        allowed_values: {
          type: 'list',
          values: [
            { av_placement_id: '3', value: 'top' },
            { av_placement_id: '4', value: 'bottom' },
          ],
        },
        mandatory: true,
        name: 'Field 3',
        type: 'string',
        unit_id: '0',
      },
      {
        cip_placement_id: '2',
        allowed_values: {
          type: 'list',
          values: [
            { av_placement_id: '5', value: 12 },
            { av_placement_id: '6', value: 11 },
            { av_placement_id: '7', value: '13' },
            { av_placement_id: '8', value: '13' },
          ],
        },
        mandatory: true,
        name: 'Field 4',
        type: 'string',
      },
    ]);

    expect(onChangeAllowedValuesListErrors).toHaveBeenCalledWith([
      {
        cip_placement_id: '2',
        errors: [
          { errorMessage: 'Please enter valid text', av_placement_id: '5' },
          { errorMessage: 'Please enter valid text', av_placement_id: '6' },
          { errorMessage: 'Duplicate value', av_placement_id: '7' },
          { errorMessage: 'Duplicate value', av_placement_id: '8' },
        ],
      },
    ]);
  });
});
