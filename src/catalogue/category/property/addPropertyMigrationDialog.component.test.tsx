import { fireEvent, screen, within } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { MockInstance } from 'vitest';
import { imsApi } from '../../../api/api';
import { AllowedValues, CatalogueCategory } from '../../../api/api.types';
import { AddPropertyMigration } from '../../../app.types';
import {
  getCatalogueCategoryById,
  renderComponentWithRouterProvider,
} from '../../../testUtils';
import AddPropertyMigrationDialog, {
  AddPropertyMigrationDialogProps,
} from './addPropertyMigrationDialog.component';

interface TestAddPropertyMigration
  extends Omit<AddPropertyMigration, 'default_value' | 'allowed_values'> {
  unit?: string;
  default_value?: string;
  allowed_values?: AllowedValues;
}

describe('AddPropertyMigrationDialog', () => {
  let props: AddPropertyMigrationDialogProps;
  let axiosPostSpy: MockInstance;
  let user: UserEvent;

  const onClose = vi.fn();

  const createView = () => {
    return renderComponentWithRouterProvider(
      <AddPropertyMigrationDialog {...props} />
    );
  };
  beforeEach(() => {
    props = {
      open: true,
      onClose: onClose,
      catalogueCategory: getCatalogueCategoryById('12') as CatalogueCategory,
    };
    axiosPostSpy = vi.spyOn(imsApi, 'post');
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const modifyValues = async (formField: Partial<TestAddPropertyMigration>) => {
    if (formField.name) {
      const name = screen.getByLabelText('Property Name *');
      await user.clear(name);
      await user.type(name, formField.name);
    }
    if (formField.type) {
      const type = screen.getByLabelText('Select Type *');
      await user.click(type);
      const typeDropdown = screen.getByRole('listbox', {
        name: 'Select Type',
      });
      await user.click(
        within(typeDropdown).getByRole('option', {
          name: formField.type,
        })
      );
    }

    if (formField.unit) {
      const unit = screen.getByLabelText('Select Unit');
      await user.click(unit);
      const unitDropdown = screen.getByRole('listbox', {
        name: 'Select Unit',
      });
      await user.click(
        within(unitDropdown).getByRole('option', {
          name: formField.unit,
        })
      );
    }
    if (formField.mandatory) {
      const mandatory = screen.getByLabelText('Select is mandatory?');
      await user.click(mandatory);
      const mandatoryDropdown = screen.getByRole('listbox', {
        name: 'Select is mandatory?',
      });
      await user.click(
        within(mandatoryDropdown).getByRole('option', {
          name: formField.mandatory === 'true' ? 'Yes' : 'No',
        })
      );
    }

    if (formField.allowed_values) {
      const allowedValues = screen.getByLabelText('Select Allowed values *');

      await user.click(allowedValues);
      const allowedValuesDropdown = screen.getByRole('listbox', {
        name: 'Select Allowed values',
      });
      await user.click(
        within(allowedValuesDropdown).getByRole('option', {
          name: 'List',
        })
      );

      for (let i = 0; i < formField.allowed_values.values.length; i++) {
        await user.click(
          screen.getByRole('button', {
            name: `Add list item`,
          })
        );

        const listItem = screen.getAllByLabelText('List item')[i];

        fireEvent.change(listItem, {
          target: { value: formField.allowed_values.values[i] },
        });
      }
    }

    if (formField.default_value) {
      const defaultValue = screen.getByLabelText(
        `${formField.allowed_values || formField.type === 'Boolean' ? 'Select Default value' : 'Default value'}${formField.mandatory === 'true' ? ' *' : ''}`
      );

      if (formField.allowed_values || formField.type === 'Boolean') {
        await user.click(defaultValue);

        const defaultValueDropdown = screen.getByRole('listbox', {
          name: `Select Default value`,
        });
        await user.click(
          within(defaultValueDropdown).getByRole('option', {
            name: formField.default_value as string,
          })
        );
      } else {
        await user.type(defaultValue, String(formField.default_value));
      }
    }
  };

  it('adds a new property with allowed values (type string)', async () => {
    createView();
    await modifyValues({
      name: 'test',
      type: 'Text',
      unit: 'millimeters',
      default_value: '2',
      mandatory: 'false',
      allowed_values: { type: 'list', values: ['1', '2', '3'] },
    });

    await user.click(
      screen.getByRole('checkbox', {
        name: 'Confirm understanding and proceed checkbox',
      })
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(axiosPostSpy).toHaveBeenCalledWith(
      '/v1/catalogue-categories/12/properties',
      {
        allowed_values: {
          type: 'list',
          values: ['1', '2', '3'],
        },
        default_value: '2',
        mandatory: false,
        name: 'test',
        type: 'string',
        unit_id: '5',
      }
    );
  });

  it('adds a new property with allowed values (type string to type number)', async () => {
    createView();
    await modifyValues({
      name: 'test',
      type: 'Text',
      unit: 'millimeters',
      default_value: '2',
      mandatory: 'false',
      allowed_values: { type: 'list', values: ['1', '2', '3'] },
    });

    await modifyValues({
      type: 'Number',
    });

    await user.click(
      screen.getByRole('checkbox', {
        name: 'Confirm understanding and proceed checkbox',
      })
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(axiosPostSpy).toHaveBeenCalledWith(
      '/v1/catalogue-categories/12/properties',
      {
        allowed_values: {
          type: 'list',
          values: [1, 2, 3],
        },
        mandatory: false,
        name: 'test',
        type: 'number',
        unit_id: '5',
      }
    );
  });

  it('adds a new property (type number)', async () => {
    createView();
    await modifyValues({
      name: 'test',
      type: 'Number',
      unit: 'millimeters',
      default_value: '2',
      mandatory: 'false',
    });

    await user.click(
      screen.getByRole('checkbox', {
        name: 'Confirm understanding and proceed checkbox',
      })
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(axiosPostSpy).toHaveBeenCalledWith(
      '/v1/catalogue-categories/12/properties',
      {
        default_value: 2,
        mandatory: false,
        name: 'test',
        type: 'number',
        unit_id: '5',
      }
    );
  });

  it('adds a new property (type string)', async () => {
    createView();
    await modifyValues({
      name: 'test',
      type: 'Text',
      unit: 'millimeters',
      default_value: '2',
      mandatory: 'false',
    });

    await user.click(
      screen.getByRole('checkbox', {
        name: 'Confirm understanding and proceed checkbox',
      })
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(axiosPostSpy).toHaveBeenCalledWith(
      '/v1/catalogue-categories/12/properties',
      {
        default_value: '2',
        mandatory: false,
        name: 'test',
        type: 'string',
        unit_id: '5',
      }
    );
  });

  it('adds a new property (type string and without default value)', async () => {
    createView();
    await modifyValues({
      name: 'test',
      type: 'Text',
      unit: 'millimeters',
      mandatory: 'false',
    });

    await user.click(
      screen.getByRole('checkbox', {
        name: 'Confirm understanding and proceed checkbox',
      })
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(axiosPostSpy).toHaveBeenCalledWith(
      '/v1/catalogue-categories/12/properties',
      {
        mandatory: false,
        name: 'test',
        type: 'string',
        unit_id: '5',
      }
    );
  });

  it('adds a new property (type boolean)', async () => {
    createView();
    await modifyValues({
      name: 'test',
      type: 'Boolean',
      default_value: 'False',
      mandatory: 'true',
    });

    await user.click(
      screen.getByRole('checkbox', {
        name: 'Confirm understanding and proceed checkbox',
      })
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(axiosPostSpy).toHaveBeenCalledWith(
      '/v1/catalogue-categories/12/properties',
      {
        default_value: false,
        mandatory: true,
        name: 'test',
        type: 'boolean',
      }
    );
  });

  it('displays errors when mandatory fields are not filled in and clears when text is updated', async () => {
    createView();
    await modifyValues({
      mandatory: 'true',
      allowed_values: {
        type: 'list',
        values: [''],
      },
    });

    await user.click(
      screen.getByRole('checkbox', {
        name: 'Confirm understanding and proceed checkbox',
      })
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    const nameHelperText = screen.getByText('Please enter a property name.');
    const defaultValueHelperText = screen.getByText(
      'Please enter a valid value as this field is mandatory.'
    );
    const allowedValues = screen.getByText('Please enter a value.');

    expect(nameHelperText).toBeInTheDocument();
    expect(defaultValueHelperText).toBeInTheDocument();
    expect(allowedValues).toBeInTheDocument();

    await modifyValues({
      name: 'test',
      unit: 'millimeters',
      default_value: '2',
      mandatory: 'false',
      allowed_values: {
        type: 'list',
        values: ['1', '2'],
      },
    });

    const nameHelperText2 = screen.queryByText('Please enter a property name.');

    const defaultValueHelperText2 = screen.queryByText(
      'Please enter a valid value as this field is mandatory.'
    );
    const allowedValues2 = screen.queryByText('Please enter a value.');

    expect(nameHelperText2).not.toBeInTheDocument();
    expect(defaultValueHelperText2).not.toBeInTheDocument();
    expect(allowedValues2).not.toBeInTheDocument();
  });

  it('displays errors when there is an invalid number value', async () => {
    createView();
    await modifyValues({
      name: 'test',
      type: 'Number',
      unit: 'millimeters',
      default_value: 'test 1',
      mandatory: 'false',
      allowed_values: { type: 'list', values: ['test 1', 'test 2'] },
    });

    await user.click(
      screen.getByRole('checkbox', {
        name: 'Confirm understanding and proceed checkbox',
      })
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    const invalidNumberHelperText = screen.getAllByText(
      'Please enter a valid number.'
    );

    expect(invalidNumberHelperText.length).toEqual(3);

    const deleteIcons = screen.getAllByLabelText('Delete list item');

    for (let j = 0; j < deleteIcons.length; j++) {
      await user.click(screen.getAllByTestId('DeleteIcon')[0]);
    }

    const invalidNumberHelperText2 = screen.queryByText(
      'Please enter a valid number.'
    );

    expect(invalidNumberHelperText2).not.toBeInTheDocument();
  });

  it('display error when there is a duplicate name', async () => {
    createView();
    await modifyValues({
      name: 'Axis',
      type: 'Text',
      unit: 'millimeters',
      default_value: '2',
      mandatory: 'false',
    });

    await user.click(
      screen.getByRole('checkbox', {
        name: 'Confirm understanding and proceed checkbox',
      })
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    const duplicateName = screen.getByText(
      'Duplicate property name. Please change the name.'
    );

    expect(duplicateName).toBeInTheDocument();

    await modifyValues({
      name: 'Axis2',
    });

    const duplicateName2 = screen.queryByText(
      'Duplicate property name. Please change the name.'
    );

    expect(duplicateName2).not.toBeInTheDocument();
  });

  it('display error when the allowed values list is empty and clears when a new list value is added', async () => {
    createView();
    await modifyValues({
      name: 'Axis',
      type: 'Text',
      unit: 'millimeters',
      mandatory: 'false',
      allowed_values: {
        type: 'list',
        values: [],
      },
    });

    await user.click(
      screen.getByRole('checkbox', {
        name: 'Confirm understanding and proceed checkbox',
      })
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    const allowedValuesError = screen.getByText(
      'Please create a valid list item.'
    );

    expect(allowedValuesError).toBeInTheDocument();

    await modifyValues({
      allowed_values: {
        type: 'list',
        values: [''],
      },
    });

    const allowedValuesError2 = screen.queryByText(
      'Please create a valid list item.'
    );

    expect(allowedValuesError2).not.toBeInTheDocument();
  });

  it('display error when the allowed values list is empty and clears when allowed values is changed to any', async () => {
    createView();
    await modifyValues({
      name: 'Axis',
      type: 'Text',
      unit: 'millimeters',
      mandatory: 'false',
      allowed_values: {
        type: 'list',
        values: [],
      },
    });

    await user.click(
      screen.getByRole('checkbox', {
        name: 'Confirm understanding and proceed checkbox',
      })
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    const allowedValuesError = screen.getByText(
      'Please create a valid list item.'
    );

    expect(allowedValuesError).toBeInTheDocument();

    const allowedValues = screen.getByLabelText('Select Allowed values *');

    await user.click(allowedValues);
    const allowedValuesDropdown = screen.getByRole('listbox', {
      name: 'Select Allowed values',
    });
    await user.click(
      within(allowedValuesDropdown).getByRole('option', {
        name: 'Any',
      })
    );
    const allowedValuesError2 = screen.queryByText(
      'Please create a valid list item.'
    );

    expect(allowedValuesError2).not.toBeInTheDocument();
  });

  it('displays error for duplicate allowed values and clears when list value is deleted (type number)', async () => {
    createView();
    await modifyValues({
      name: 'test',
      type: 'Number',
      unit: 'millimeters',
      mandatory: 'false',
      allowed_values: { type: 'list', values: ['1', '1'] },
    });

    await user.click(
      screen.getByRole('checkbox', {
        name: 'Confirm understanding and proceed checkbox',
      })
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    const duplicateError = screen.getAllByText('Duplicate value.');
    expect(duplicateError.length).toEqual(2);

    await user.click(screen.getAllByLabelText('Delete list item')[0]);

    const duplicateError2 = screen.queryByText('Duplicate value.');
    expect(duplicateError2).not.toBeInTheDocument();
  });

  it('removes the error for default value if the allowed value deleted', async () => {
    createView();
    await modifyValues({
      name: 'test',
      type: 'Number',
      unit: 'millimeters',
      mandatory: 'false',
      default_value: 'test1',
      allowed_values: { type: 'list', values: ['test1', 'test2'] },
    });

    await user.click(
      screen.getByRole('checkbox', {
        name: 'Confirm understanding and proceed checkbox',
      })
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    const invalidTypeError = screen.getAllByText(
      'Please enter a valid number.'
    );
    expect(invalidTypeError.length).toEqual(3);

    await user.click(screen.getAllByLabelText('Delete list item')[0]);

    const invalidTypeError2 = screen.getAllByText(
      'Please enter a valid number.'
    );
    expect(invalidTypeError2.length).toEqual(1);
  });

  it('removes the error for default value if the allowed value is changed', async () => {
    createView();
    await modifyValues({
      name: 'test',
      type: 'Number',
      unit: 'millimeters',
      mandatory: 'false',
      default_value: 'test1',
      allowed_values: { type: 'list', values: ['test1', 'test2'] },
    });

    await user.click(
      screen.getByRole('checkbox', {
        name: 'Confirm understanding and proceed checkbox',
      })
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    const invalidTypeError = screen.getAllByText(
      'Please enter a valid number.'
    );
    expect(invalidTypeError.length).toEqual(3);

    await user.clear(screen.getAllByLabelText('List item')[0]);

    await user.type(screen.getAllByLabelText('List item')[0], '1');

    const invalidTypeError2 = screen.getAllByText(
      'Please enter a valid number.'
    );
    expect(invalidTypeError2.length).toEqual(1);
  });

  it('displays default value error for type boolean', async () => {
    createView();
    await modifyValues({
      name: 'test',
      type: 'Boolean',
      mandatory: 'true',
    });

    await user.click(
      screen.getByRole('checkbox', {
        name: 'Confirm understanding and proceed checkbox',
      })
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    const defaultValueHelperText = screen.getByText(
      'Please select either True or False.'
    );
    expect(defaultValueHelperText).toBeInTheDocument();

    await modifyValues({
      type: 'Boolean',
      default_value: 'True',
      mandatory: 'true',
    });

    const defaultValueHelperText2 = screen.queryByText(
      'Please select either True or False.'
    );
    expect(defaultValueHelperText2).not.toBeInTheDocument();
  });

  it('displays default value error for type string without allowed values', async () => {
    createView();
    await modifyValues({
      name: 'test',
      type: 'Text',
      mandatory: 'true',
    });

    await user.click(
      screen.getByRole('checkbox', {
        name: 'Confirm understanding and proceed checkbox',
      })
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    const defaultValueHelperText = screen.getByText(
      'Please enter a valid value as this field is mandatory.'
    );
    expect(defaultValueHelperText).toBeInTheDocument();

    await modifyValues({
      type: 'Text',
      default_value: 'True',
      mandatory: 'true',
    });

    const defaultValueHelperText2 = screen.queryByText(
      'Please enter a valid value as this field is mandatory.'
    );
    expect(defaultValueHelperText2).not.toBeInTheDocument();
  });
});
