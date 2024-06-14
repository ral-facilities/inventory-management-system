import { fireEvent, screen, within } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { MockInstance } from 'vitest';
import { imsApi } from '../../api/api';
import {
  CatalogueCategory,
  CatalogueCategoryPropertyMigration,
} from '../../app.types';
import {
  getCatalogueCategoryById,
  renderComponentWithRouterProvider,
} from '../../testUtils';
import CatalogueItemPropertiesMigrationDialog, {
  CatalogueItemPropertiesMigrationDialogProps,
} from './catalogueItemPropertiesMigrationDialog.component';

describe('CatalogueCategoryDirectoryDialog', () => {
  let props: CatalogueItemPropertiesMigrationDialogProps;
  let user: UserEvent;

  const onClose = vi.fn();
  const resetSelectedCatalogueCategory = vi.fn();

  interface TestCatalogueCategoryPropertyMigration
    extends CatalogueCategoryPropertyMigration {
    unit?: string;
  }

  const createView = () => {
    return renderComponentWithRouterProvider(
      <CatalogueItemPropertiesMigrationDialog {...props} />
    );
  };

  beforeEach(() => {
    props = {
      open: true,
      selectedCatalogueCategory: getCatalogueCategoryById(
        '12'
      ) as CatalogueCategory,
      onClose: onClose,
      resetSelectedCatalogueCategory: resetSelectedCatalogueCategory,
    };

    user = userEvent.setup();
  });

  const modifyValues = async (values: {
    type: 'Edit' | 'Add';
    editRadio?: string;
    formField: Partial<TestCatalogueCategoryPropertyMigration>;
    justModifyPropertyForm: boolean;
  }) => {
    if (!values.justModifyPropertyForm) {
      await user.click(
        screen.getByLabelText(
          'Select Edit to edit an existing property or select Add to add a new property'
        )
      );

      const dropdown = screen.getByRole('listbox', {
        name: 'Select Edit to edit an existing property or select Add to add a new property',
      });
      await user.click(
        within(dropdown).getByRole('option', {
          name: values.type,
        })
      );

      await user.click(screen.getByRole('button', { name: 'Next' }));

      if (values.type === 'Edit' && values.editRadio) {
        const selectedRadioButton = screen.getByLabelText(
          `${values.editRadio} radio button`
        );

        await user.click(selectedRadioButton);
      }

      await user.click(screen.getByRole('button', { name: 'Next' }));
    }

    if (values.formField.name) {
      const name = screen.getByLabelText('Property Name *');
      await user.clear(name);
      await user.type(name, values.formField.name);
    }

    if (values.formField.type && values.type !== 'Edit') {
      const type = screen.getByLabelText('Select Type *');
      await user.click(type);
      const typeDropdown = screen.getByRole('listbox', {
        name: 'Select Type',
      });
      await user.click(
        within(typeDropdown).getByRole('option', {
          name: values.formField.type,
        })
      );
    }

    if (values.formField.unit && values.type !== 'Edit') {
      const unit = screen.getByLabelText('Select Unit');
      await user.click(unit);
      const unitDropdown = screen.getByRole('listbox', {
        name: 'Select Unit',
      });
      await user.click(
        within(unitDropdown).getByRole('option', {
          name: values.formField.unit,
        })
      );
    }

    if (
      typeof values.formField.mandatory == 'boolean' &&
      values.type !== 'Edit'
    ) {
      const mandatory = screen.getByLabelText('Select is mandatory?');
      await user.click(mandatory);
      const mandatoryDropdown = screen.getByRole('listbox', {
        name: 'Select is mandatory?',
      });
      await user.click(
        within(mandatoryDropdown).getByRole('option', {
          name: values.formField.mandatory ? 'Yes' : 'No',
        })
      );
    }

    if (values.formField.allowed_values) {
      const allowedValues = screen.getByLabelText('Select Allowed values *');
      if (values.type === 'Add') {
        await user.click(allowedValues);
        const allowedValuesDropdown = screen.getByRole('listbox', {
          name: 'Select Allowed values',
        });
        await user.click(
          within(allowedValuesDropdown).getByRole('option', {
            name: 'List',
          })
        );

        for (
          let i = 0;
          i < values.formField.allowed_values.values.length;
          i++
        ) {
          await user.click(
            screen.getByRole('button', {
              name: `Add list item`,
            })
          );

          const listItem = screen.getAllByLabelText('List Item')[i];

          fireEvent.change(listItem, {
            target: { value: values.formField.allowed_values.values[i] },
          });
        }
      } else {
        for (
          let i = 0;
          i < values.formField.allowed_values.values.length;
          i++
        ) {
          await user.click(
            screen.getByRole('button', {
              name: `Add list item`,
            })
          );

          const listItemLength = screen.getAllByLabelText('List Item').length;

          const listItem =
            screen.getAllByLabelText('List Item')[listItemLength - 1];

          fireEvent.change(within(listItem).getByLabelText('List Item'), {
            target: { value: values.formField.allowed_values.values[i] },
          });
        }
      }
    }

    if (values.formField.default_value && values.type !== 'Edit') {
      const defaultValue = screen.getByLabelText(
        `${values.formField.allowed_values || values.formField.type === 'Boolean' ? 'Select Default value' : 'Default value'}${values.formField.mandatory ? ' *' : ''}`
      );

      if (
        values.formField.allowed_values ||
        values.formField.type === 'Boolean'
      ) {
        await user.click(defaultValue);

        const defaultValueDropdown = screen.getByRole('listbox', {
          name: `Select Default value`,
        });
        await user.click(
          within(defaultValueDropdown).getByRole('option', {
            name: values.formField.default_value as string,
          })
        );
      } else {
        await user.type(defaultValue, String(values.formField.default_value));
      }
    }
  };

  describe('Add', () => {
    let axiosPostSpy: MockInstance;

    beforeEach(() => {
      axiosPostSpy = vi.spyOn(imsApi, 'post');
    });
    it('adds a new property with allowed values (type number)', async () => {
      createView();
      await modifyValues({
        type: 'Add',
        formField: {
          name: 'test',
          type: 'Number',
          unit: 'millimeters',
          default_value: '2',
          mandatory: false,
          allowed_values: { type: 'list', values: ['1', '2', '3'] },
        },
        justModifyPropertyForm: false,
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      expect(axiosPostSpy).toHaveBeenCalledWith(
        '/v1/catalogue-categories/12/properties',
        {
          allowed_values: {
            type: 'list',
            values: [1, 2, 3],
          },
          default_value: 2,
          id: undefined,
          mandatory: false,
          name: 'test',
          type: 'number',
          unit_id: '5',
        }
      );
    });

    it('adds a new property with allowed values (type string)', async () => {
      createView();
      await modifyValues({
        type: 'Add',
        formField: {
          name: 'test',
          type: 'Text',
          unit: 'millimeters',
          default_value: '2',
          mandatory: false,
          allowed_values: { type: 'list', values: ['1', '2', '3'] },
        },
        justModifyPropertyForm: false,
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      expect(axiosPostSpy).toHaveBeenCalledWith(
        '/v1/catalogue-categories/12/properties',
        {
          allowed_values: {
            type: 'list',
            values: ['1', '2', '3'],
          },
          default_value: '2',
          id: undefined,
          mandatory: false,
          name: 'test',
          type: 'string',
          unit_id: '5',
        }
      );
    });

    it('adds a new property (type number)', async () => {
      createView();
      await modifyValues({
        type: 'Add',
        formField: {
          name: 'test',
          type: 'Number',
          unit: 'millimeters',
          default_value: '2',
          mandatory: false,
        },
        justModifyPropertyForm: false,
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

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
        type: 'Add',
        formField: {
          name: 'test',
          type: 'Text',
          unit: 'millimeters',
          default_value: '2',
          mandatory: false,
        },
        justModifyPropertyForm: false,
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

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
        type: 'Add',
        formField: {
          name: 'test',
          type: 'Text',
          unit: 'millimeters',
          mandatory: false,
        },
        justModifyPropertyForm: false,
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

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
        type: 'Add',
        formField: {
          name: 'test',
          type: 'Boolean',
          default_value: 'false',
          mandatory: true,
        },
        justModifyPropertyForm: false,
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

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

    it('uses labels to navigate through the stepper', async () => {
      createView();
      await user.click(
        screen.getByLabelText(
          'Select Edit to edit an existing property or select Add to add a new property'
        )
      );

      const dropdown = screen.getByRole('listbox', {
        name: 'Select Edit to edit an existing property or select Add to add a new property',
      });
      await user.click(
        within(dropdown).getByRole('option', {
          name: 'Add',
        })
      );

      await user.click(screen.getByText('Add catalogue item property'));

      expect(screen.getAllByLabelText('Property Name *').length).toEqual(1);
      await user.click(screen.getByRole('button', { name: 'Back' }));
      expect(screen.getAllByLabelText('Property Name *').length).toEqual(3);
      await user.click(screen.getByText('Add catalogue item property'));

      expect(screen.getAllByLabelText('Property Name *').length).toEqual(1);
    });

    it('displays errors when mandatory fields are not filled in and clears when text is updated', async () => {
      createView();
      await modifyValues({
        type: 'Add',
        formField: {
          mandatory: true,
          allowed_values: {
            type: 'list',
            values: [''],
          },
        },
        justModifyPropertyForm: false,
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      const nameHelperText = screen.getByText('Please enter a property name');
      const typeHelperText = screen.getByText('Please select a type');
      const defaultValueHelperText = screen.getByText(
        'Please enter a default value'
      );
      const allowedValues = screen.getByText('Please enter a value');

      expect(nameHelperText).toBeInTheDocument();
      expect(typeHelperText).toBeInTheDocument();
      expect(defaultValueHelperText).toBeInTheDocument();
      expect(allowedValues).toBeInTheDocument();

      await modifyValues({
        type: 'Add',
        formField: {
          name: 'test',
          type: 'Text',
          unit: 'millimeters',
          default_value: '2',
          mandatory: false,
          allowed_values: {
            type: 'list',
            values: ['1', '2'],
          },
        },
        justModifyPropertyForm: true,
      });

      const nameHelperText2 = screen.queryByText(
        'Please enter a property name'
      );
      const typeHelperText2 = screen.queryByText('Please select a type');
      const defaultValueHelperText2 = screen.queryByText(
        'Please enter a default value'
      );
      const allowedValues2 = screen.queryByText('Please enter a value');

      expect(nameHelperText2).not.toBeInTheDocument();
      expect(typeHelperText2).not.toBeInTheDocument();
      expect(defaultValueHelperText2).not.toBeInTheDocument();
      expect(allowedValues2).not.toBeInTheDocument();
    });

    it('displays errors when there is an invalid number value', async () => {
      createView();
      await modifyValues({
        type: 'Add',
        formField: {
          name: 'test',
          type: 'Number',
          unit: 'millimeters',
          default_value: 'test 1',
          mandatory: false,
          allowed_values: { type: 'list', values: ['test 1', 'test 2'] },
        },
        justModifyPropertyForm: false,
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      const invalidNumberHelperText = screen.getAllByText(
        'Please enter a valid number'
      );

      expect(invalidNumberHelperText.length).toEqual(3);

      const deleteIcons = screen.getAllByLabelText('Delete list item');

      for (let j = 0; j < deleteIcons.length; j++) {
        await user.click(screen.getAllByTestId('DeleteIcon')[0]);
      }

      const invalidNumberHelperText2 = screen.queryByText(
        'Please enter a valid number'
      );

      expect(invalidNumberHelperText2).not.toBeInTheDocument();
    });

    it('display error when there is a duplicate name', async () => {
      createView();
      await modifyValues({
        type: 'Add',
        formField: {
          name: 'Axis',
          type: 'Text',
          unit: 'millimeters',
          default_value: '2',
          mandatory: false,
        },
        justModifyPropertyForm: false,
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      const duplicateName = screen.getByText(
        'Duplicate property name. Please change the name'
      );

      expect(duplicateName).toBeInTheDocument();

      await modifyValues({
        type: 'Add',
        formField: {
          name: 'Axis2',
        },
        justModifyPropertyForm: true,
      });

      const duplicateName2 = screen.queryByText(
        'Duplicate property name. Please change the name'
      );

      expect(duplicateName2).not.toBeInTheDocument();
    });

    it('display error when the allowed values list is empty and clears when a new list value is added', async () => {
      createView();
      await modifyValues({
        type: 'Add',
        formField: {
          name: 'Axis',
          type: 'Text',
          unit: 'millimeters',
          mandatory: false,
          allowed_values: {
            type: 'list',
            values: [],
          },
        },
        justModifyPropertyForm: false,
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      const allowedValuesError = screen.getByText(
        'Please create a valid list item'
      );

      expect(allowedValuesError).toBeInTheDocument();

      await modifyValues({
        type: 'Add',
        formField: {
          allowed_values: {
            type: 'list',
            values: [''],
          },
        },
        justModifyPropertyForm: true,
      });

      const allowedValuesError2 = screen.queryByText(
        'Please create a valid list item'
      );

      expect(allowedValuesError2).not.toBeInTheDocument();
    });

    it('display error when the allowed values list is empty and clears when allowed values is changed to any', async () => {
      createView();
      await modifyValues({
        type: 'Add',
        formField: {
          name: 'Axis',
          type: 'Text',
          unit: 'millimeters',
          mandatory: false,
          allowed_values: {
            type: 'list',
            values: [],
          },
        },
        justModifyPropertyForm: false,
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      const allowedValuesError = screen.getByText(
        'Please create a valid list item'
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
        'Please create a valid list item'
      );

      expect(allowedValuesError2).not.toBeInTheDocument();
    });

    it('displays error for duplicate allowed values and clears when list value is deleted (type number)', async () => {
      createView();
      await modifyValues({
        type: 'Add',
        formField: {
          name: 'test',
          type: 'Number',
          unit: 'millimeters',
          mandatory: false,
          allowed_values: { type: 'list', values: ['1', '1'] },
        },
        justModifyPropertyForm: false,
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      const duplicateError = screen.getAllByText('Duplicate value');
      expect(duplicateError.length).toEqual(2);

      await user.click(screen.getAllByLabelText('Delete list item')[0]);

      const duplicateError2 = screen.queryByText('Duplicate value');
      expect(duplicateError2).not.toBeInTheDocument();
    });

    it('removes the error for default value if the allowed value deleted', async () => {
      createView();
      await modifyValues({
        type: 'Add',
        formField: {
          name: 'test',
          type: 'Number',
          unit: 'millimeters',
          mandatory: false,
          default_value: 'test1',
          allowed_values: { type: 'list', values: ['test1', 'test2'] },
        },
        justModifyPropertyForm: false,
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      const invalidTypeError = screen.getAllByText(
        'Please enter a valid number'
      );
      expect(invalidTypeError.length).toEqual(3);

      await user.click(screen.getAllByLabelText('Delete list item')[0]);

      const invalidTypeError2 = screen.getAllByText(
        'Please enter a valid number'
      );
      expect(invalidTypeError2.length).toEqual(1);
    });

    it('removes the error for default value if the allowed value is changed', async () => {
      createView();
      await modifyValues({
        type: 'Add',
        formField: {
          name: 'test',
          type: 'Number',
          unit: 'millimeters',
          mandatory: false,
          default_value: 'test1',
          allowed_values: { type: 'list', values: ['test1', 'test2'] },
        },
        justModifyPropertyForm: false,
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      const invalidTypeError = screen.getAllByText(
        'Please enter a valid number'
      );
      expect(invalidTypeError.length).toEqual(3);

      await user.clear(screen.getAllByLabelText('List Item')[0]);

      await user.type(screen.getAllByLabelText('List Item')[0], '1');

      const invalidTypeError2 = screen.getAllByText(
        'Please enter a valid number'
      );
      expect(invalidTypeError2.length).toEqual(1);
    });

    it('displays default value error for type boolean', async () => {
      createView();
      await modifyValues({
        type: 'Add',
        formField: {
          name: 'test',
          type: 'Boolean',
          mandatory: true,
        },
        justModifyPropertyForm: false,
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      const defaultValueHelperText = screen.getByText(
        'Please enter a default value'
      );
      expect(defaultValueHelperText).toBeInTheDocument();

      await modifyValues({
        type: 'Add',
        formField: {
          type: 'Boolean',
          default_value: 'true',
          mandatory: true,
        },
        justModifyPropertyForm: true,
      });

      const defaultValueHelperText2 = screen.queryByText(
        'Please enter a default value'
      );
      expect(defaultValueHelperText2).not.toBeInTheDocument();
    });

    it('displays default value error for type string without allowed values', async () => {
      createView();
      await modifyValues({
        type: 'Add',
        formField: {
          name: 'test',
          type: 'Text',
          mandatory: true,
        },
        justModifyPropertyForm: false,
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      const defaultValueHelperText = screen.getByText(
        'Please enter a default value'
      );
      expect(defaultValueHelperText).toBeInTheDocument();

      await modifyValues({
        type: 'Add',
        formField: {
          type: 'Text',
          default_value: 'true',
          mandatory: true,
        },
        justModifyPropertyForm: true,
      });

      const defaultValueHelperText2 = screen.queryByText(
        'Please enter a default value'
      );
      expect(defaultValueHelperText2).not.toBeInTheDocument();
    });
  });

  describe('Edit', () => {
    let axiosPatchSpy: MockInstance;

    beforeEach(() => {
      axiosPatchSpy = vi.spyOn(imsApi, 'patch');
    });
    it('edits an existing property name', async () => {
      createView();
      await modifyValues({
        type: 'Edit',
        editRadio: 'Ultimate Pressure',
        formField: {
          name: 'test',
        },
        justModifyPropertyForm: false,
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      expect(axiosPatchSpy).toHaveBeenCalledWith(
        '/v1/catalogue-categories/12/properties/18',
        {
          name: 'test',
        }
      );
    });

    it('edits an existing property allowed values (type string)', async () => {
      createView();
      await modifyValues({
        type: 'Edit',
        editRadio: 'Axis',
        formField: {
          allowed_values: { type: 'list', values: ['a'] },
        },
        justModifyPropertyForm: false,
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      expect(axiosPatchSpy).toHaveBeenCalledWith(
        '/v1/catalogue-categories/12/properties/19',
        {
          allowed_values: {
            type: 'list',
            values: ['y', 'x', 'z', 'a'],
          },
        }
      );
    });

    it('edits an existing property allowed values (type number) ', async () => {
      createView();
      await modifyValues({
        type: 'Edit',
        editRadio: 'Pumping Speed',
        formField: {
          allowed_values: { type: 'list', values: [600] },
        },
        justModifyPropertyForm: false,
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      expect(axiosPatchSpy).toHaveBeenCalledWith(
        '/v1/catalogue-categories/12/properties/17',
        {
          allowed_values: {
            type: 'list',
            values: [300, 400, 500, 600],
          },
        }
      );
    });

    it('display error message if the nothing has changed', async () => {
      createView();
      await modifyValues({
        type: 'Edit',
        editRadio: 'Pumping Speed',
        formField: {},
        justModifyPropertyForm: false,
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      const formError = screen.getByText(
        'Please edit a form entry before clicking save'
      );

      expect(formError).toBeInTheDocument();

      await modifyValues({
        type: 'Add',
        formField: {
          name: 'test',
        },
        justModifyPropertyForm: true,
      });

      const formError2 = screen.queryByText(
        'Please edit a form entry before clicking save'
      );

      expect(formError2).not.toBeInTheDocument();
    });

    it('display error message duplicate name', async () => {
      createView();
      await modifyValues({
        type: 'Edit',
        editRadio: 'Pumping Speed',
        formField: { name: 'Axis' },
        justModifyPropertyForm: false,
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      const nameError = screen.getByText(
        'Duplicate property name. Please change the name'
      );

      expect(nameError).toBeInTheDocument();

      await modifyValues({
        type: 'Add',
        formField: {
          name: 'test',
        },
        justModifyPropertyForm: true,
      });

      const nameError2 = screen.queryByText(
        'Duplicate property name. Please change the name'
      );

      expect(nameError2).not.toBeInTheDocument();
    });
  });
});
