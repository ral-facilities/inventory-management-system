import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { http } from 'msw';
import { MockInstance } from 'vitest';
import { imsApi } from '../../api/api';
import {
  CatalogueCategory,
  CatalogueCategoryPropertyType,
} from '../../api/api.types';
import { AddCatalogueCategoryProperty } from '../../app.types';
import handleIMS_APIError from '../../handleIMS_APIError';
import { server } from '../../mocks/server';
import {
  CREATED_MODIFIED_TIME_VALUES,
  renderComponentWithRouterProvider,
} from '../../testUtils';
import { resetUniqueIdCounter } from '../../utils';
import CatalogueCategoryDialog, {
  CatalogueCategoryDialogProps,
} from './catalogueCategoryDialog.component';

vi.mock('../../handleIMS_APIError');

describe('Catalogue Category Dialog', () => {
  const onClose = vi.fn();
  const resetSelectedCatalogueCategory = vi.fn();
  let props: CatalogueCategoryDialogProps;
  let user: UserEvent;

  interface TestAddCatalogueCategoryProperty
    extends AddCatalogueCategoryProperty {
    unit?: string;
  }
  const createView = () => {
    return renderComponentWithRouterProvider(
      <CatalogueCategoryDialog {...props} />
    );
  };

  // Modifies values when given a value that is not undefined
  const modifyValues = async (values: {
    name?: string;
    // New fields to add (if any)
    newFormFields?: TestAddCatalogueCategoryProperty[];
  }) => {
    if (values.name !== undefined)
      fireEvent.change(screen.getByLabelText('Name *'), {
        target: { value: values.name },
      });

    if (values.newFormFields) {
      // Check how many there are now
      const currentNameFields = screen.queryAllByLabelText('Property Name *');
      const numberOfCurrentFields = currentNameFields
        ? currentNameFields.length
        : 0;

      // Assume want a leaf now
      await user.click(screen.getByLabelText('Catalogue Items'));

      // Add any required fields
      values.newFormFields.forEach(async () => {
        await user.click(
          screen.getByRole('button', {
            name: 'Add catalogue category field entry',
          })
        );
      });

      await waitFor(async () =>
        expect(
          (await screen.findAllByLabelText('Property Name *')).length
        ).toBe(
          numberOfCurrentFields +
            (values.newFormFields ? values.newFormFields.length : 0)
        )
      );

      // Modify
      const nameFields = await screen.findAllByLabelText('Property Name *');
      const typeSelects = await screen.findAllByLabelText('Select Type *');
      const allowedValuesSelects = await screen.findAllByLabelText(
        'Select Allowed values *'
      );
      const unitSelect = await screen.findAllByLabelText('Select Unit');
      const mandatorySelect = await screen.findAllByLabelText(
        'Select is mandatory?'
      );

      for (let i = 0; i < values.newFormFields.length; i++) {
        const field = values.newFormFields[i];

        if (field.name)
          fireEvent.change(nameFields[i + numberOfCurrentFields], {
            target: { value: field.name },
          });

        if (field.type) {
          await user.click(typeSelects[i + numberOfCurrentFields]);
          const typeDropdown = screen.getByRole('listbox', {
            name: 'Select Type',
          });
          await user.click(
            within(typeDropdown).getByRole('option', {
              // number -> Number
              name: field.type.charAt(0).toUpperCase() + field.type.slice(1),
            })
          );
        }

        if (field.unit) {
          await user.click(unitSelect[i + numberOfCurrentFields]);
          const unitDropdown = screen.getByRole('listbox', {
            name: 'Select Unit',
          });
          await user.click(
            within(unitDropdown).getByRole('option', {
              name: field.unit,
            })
          );
        }

        await user.click(mandatorySelect[i + numberOfCurrentFields]);
        const mandatoryDropdown = screen.getByRole('listbox', {
          name: 'Select is mandatory?',
        });
        await user.click(
          within(mandatoryDropdown).getByRole('option', {
            name: field.mandatory ? 'Yes' : 'No',
          })
        );

        if (field.allowed_values) {
          await user.click(allowedValuesSelects[i + numberOfCurrentFields]);
          const allowedValuesDropdown = screen.getByRole('listbox', {
            name: 'Select Allowed values',
          });
          await user.click(
            within(allowedValuesDropdown).getByRole('option', {
              name: field.allowed_values.type === 'list' ? 'List' : 'Any',
            })
          );

          if (field.allowed_values.type === 'list') {
            // Add list items if allowed_values is of type 'list'
            for (
              let j = 0;
              j < field.allowed_values.values.values.length;
              j++
            ) {
              await user.click(
                screen.getAllByRole('button', {
                  name: `Add list item`,
                })[i + numberOfCurrentFields]
              );

              await waitFor(() => {
                expect(screen.getAllByLabelText('List item').length).toEqual(
                  i +
                    j +
                    (values.newFormFields ? values.newFormFields.length : 0)
                );
              });

              const listItem =
                screen.getAllByLabelText('List item')[
                  i + j + values.newFormFields.length - 1
                ];

              fireEvent.change(listItem, {
                target: { value: field.allowed_values.values.values[j].value },
              });
            }
          }
        }
      }
    }
  };

  describe('Add Catalogue Category Dialog', () => {
    let axiosPostSpy: MockInstance;
    beforeEach(() => {
      props = {
        open: true,
        onClose: onClose,
        parentId: null,
        requestType: 'post',
        resetSelectedCatalogueCategory: resetSelectedCatalogueCategory,
      };
      user = userEvent.setup();

      axiosPostSpy = vi.spyOn(imsApi, 'post');
    });

    afterEach(() => {
      vi.clearAllMocks();
      axiosPostSpy.mockRestore();
      resetUniqueIdCounter();
    });

    it('renders text correctly', async () => {
      createView();
      expect(screen.getByLabelText('Name *')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('disables save button and shows circular progress indicator when request is pending', async () => {
      server.use(
        http.post('/v1/catalogue-categories', () => {
          return new Promise(() => {});
        })
      );

      createView();

      await modifyValues({ name: 'test' });

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      expect(saveButton).toBeDisabled();
      expect(await screen.findByRole('progressbar')).toBeInTheDocument();
    });

    it('displays warning message when name field is not defined', async () => {
      createView();

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      const helperTexts = screen.getByText('Please enter a name.');
      expect(helperTexts).toBeInTheDocument();
      expect(onClose).not.toHaveBeenCalled();
    });

    it('displays warning message when name already exists within the parent catalogue category', async () => {
      createView();

      await modifyValues({ name: 'test_dup' });

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            'A catalogue category with the same name already exists within the same parent catalogue category. Please enter a different name.'
          )
        ).toBeInTheDocument();
      });
      expect(onClose).not.toHaveBeenCalled();
    });

    it('displays warning message when an unknown error occurs', async () => {
      createView();

      await modifyValues({ name: 'Error 500' });

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);
      expect(handleIMS_APIError).toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });

    it('adds a new catalogue category at root level ("/catalogue")', async () => {
      createView();

      await modifyValues({ name: 'test' });

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/catalogue-categories', {
        is_leaf: false,
        name: 'test',
      });

      expect(onClose).toHaveBeenCalled();
    });

    it('adds a new catalogue category at sub level ("/catalogue/*")', async () => {
      props = {
        ...props,
        parentId: '1',
      };

      createView();

      await modifyValues({ name: 'test' });

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/catalogue-categories', {
        is_leaf: false,
        name: 'test',
        parent_id: '1',
      });

      expect(onClose).toHaveBeenCalled();
    });

    it('calls onClose when Close button is clicked', async () => {
      createView();
      const closeButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(closeButton);

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('changes directory content type when radio is clicked', async () => {
      createView();

      expect(
        screen.queryByText('Catalogue Item Properties')
      ).not.toBeInTheDocument();

      const itemsRadio = screen.getByLabelText('Catalogue Items');
      await user.click(itemsRadio);

      expect(screen.getByText('Catalogue Item Properties')).toBeInTheDocument();
    });

    it('create a catalogue category with content being catalogue items', async () => {
      createView();

      await modifyValues({
        name: 'test',
        newFormFields: [
          {
            name: 'radius',
            type: 'number',
            unit: 'millimeters',
            mandatory: 'true',
          },
        ],
      });

      expect(screen.getByText('Catalogue Item Properties')).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await waitFor(() => user.click(saveButton));

      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/catalogue-categories', {
        properties: [
          {
            mandatory: true,
            name: 'radius',
            type: 'number',
            unit_id: '5',
          },
        ],
        is_leaf: true,
        name: 'test',
      });

      expect(onClose).toHaveBeenCalled();
    });

    it('create a catalogue category with content being catalogue items (allowed_values list of numbers)', async () => {
      createView();

      await modifyValues({
        name: 'test',
        newFormFields: [
          {
            name: 'radius',
            type: 'number',
            unit: 'millimeters',
            allowed_values: {
              type: 'list',
              values: {
                valueType: 'number',
                values: [
                  { av_placement_id: '1', value: 1 },
                  { av_placement_id: '2', value: 2 },
                  { av_placement_id: '3', value: 8 },
                ],
              },
            },
            mandatory: 'true',
          },
        ],
      });

      expect(screen.getByText('Catalogue Item Properties')).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await waitFor(() => user.click(saveButton));

      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/catalogue-categories', {
        properties: [
          {
            allowed_values: { type: 'list', values: [1, 2, 8] },
            mandatory: true,
            name: 'radius',
            type: 'number',
            unit_id: '5',
          },
        ],
        is_leaf: true,
        name: 'test',
      });

      expect(onClose).toHaveBeenCalled();
    });

    it('create a catalogue category with content being catalogue items, changes the type of the allowed values to text before submission', async () => {
      createView();

      await modifyValues({
        name: 'test',
        newFormFields: [
          {
            name: 'radius',
            type: 'number',
            unit: 'millimeters',
            allowed_values: {
              type: 'list',
              values: {
                valueType: 'number',
                values: [
                  { av_placement_id: '1', value: 1 },
                  { av_placement_id: '2', value: 2 },
                  { av_placement_id: '3', value: 8 },
                ],
              },
            },
            mandatory: 'true',
          },
        ],
      });

      const typeAutoComplete = await screen.findAllByLabelText('Select Type *');
      await user.click(typeAutoComplete[0]);

      const typeDropdown = screen.getByRole('listbox', {
        name: 'Select Type',
      });
      await user.click(
        within(typeDropdown).getByRole('option', {
          name: 'Text',
        })
      );

      expect(screen.getByText('Catalogue Item Properties')).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await waitFor(() => user.click(saveButton));

      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/catalogue-categories', {
        properties: [
          {
            allowed_values: { type: 'list', values: ['1', '2', '8'] },
            mandatory: true,
            name: 'radius',
            type: 'string',
            unit_id: '5',
          },
        ],
        is_leaf: true,
        name: 'test',
      });

      expect(onClose).toHaveBeenCalled();
    });

    it('create a catalogue category with content being catalogue items, changes the type of the allowed values to boolean before submission', async () => {
      createView();

      await modifyValues({
        name: 'test',
        newFormFields: [
          {
            name: 'radius',
            type: 'number',
            unit: 'millimeters',
            allowed_values: {
              type: 'list',
              values: {
                valueType: 'number',
                values: [
                  { av_placement_id: '1', value: 1 },
                  { av_placement_id: '2', value: 2 },
                  { av_placement_id: '3', value: 8 },
                ],
              },
            },
            mandatory: 'true',
          },
        ],
      });

      const typeAutoComplete = await screen.findAllByLabelText('Select Type *');
      await user.click(typeAutoComplete[0]);

      const typeDropdown = screen.getByRole('listbox', {
        name: 'Select Type',
      });
      await user.click(
        within(typeDropdown).getByRole('option', {
          name: 'Boolean',
        })
      );

      expect(screen.getByText('Catalogue Item Properties')).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await waitFor(() => user.click(saveButton));

      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/catalogue-categories', {
        properties: [
          {
            mandatory: true,
            name: 'radius',
            type: 'boolean',
          },
        ],
        is_leaf: true,
        name: 'test',
      });

      expect(onClose).toHaveBeenCalled();
    });

    it('create a catalogue category with content being catalogue items, changes from have allowed values list to any', async () => {
      createView();

      await modifyValues({
        name: 'test',
        newFormFields: [
          {
            name: 'radius',
            type: 'number',
            unit: 'millimeters',
            allowed_values: {
              type: 'list',
              values: {
                valueType: 'number',
                values: [
                  { av_placement_id: '1', value: 1 },
                  { av_placement_id: '2', value: 2 },
                  { av_placement_id: '3', value: 8 },
                ],
              },
            },
            mandatory: 'true',
          },
        ],
      });

      const allowedValuesAutoCompletes = await screen.findAllByLabelText(
        'Select Allowed values *'
      );
      await user.click(allowedValuesAutoCompletes[0]);

      const allowedValuesDropdown = screen.getByRole('listbox', {
        name: 'Select Allowed values',
      });
      await user.click(
        within(allowedValuesDropdown).getByRole('option', {
          name: 'Any',
        })
      );

      expect(screen.getByText('Catalogue Item Properties')).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await waitFor(() => user.click(saveButton));

      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/catalogue-categories', {
        properties: [
          {
            mandatory: true,
            name: 'radius',
            type: 'number',
            unit_id: '5',
          },
        ],
        is_leaf: true,
        name: 'test',
      });

      expect(onClose).toHaveBeenCalled();
    });

    it('create a catalogue category with content being catalogue items (allowed_values list of strings)', async () => {
      createView();

      await modifyValues({
        name: 'test',
        newFormFields: [
          {
            name: 'radius',
            type: 'text',
            unit: 'millimeters',
            allowed_values: {
              type: 'list',
              values: {
                valueType: 'number',
                values: [
                  { av_placement_id: '1', value: 1 },
                  { av_placement_id: '2', value: 2 },
                  { av_placement_id: '3', value: 8 },
                ],
              },
            },
            mandatory: 'true',
          },
        ],
      });

      expect(screen.getByText('Catalogue Item Properties')).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await waitFor(() => user.click(saveButton));

      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/catalogue-categories', {
        properties: [
          {
            allowed_values: { type: 'list', values: ['1', '2', '8'] },
            mandatory: true,
            name: 'radius',
            type: 'string',
            unit_id: '5',
          },
        ],
        is_leaf: true,
        name: 'test',
      });

      expect(onClose).toHaveBeenCalled();
    });

    it('displays an error message when the type or name field are not filled', async () => {
      createView();

      await modifyValues({
        name: 'test',
        newFormFields: [
          { name: '', type: 'number', unit: 'millimeters', mandatory: 'true' },
          {
            name: 'radius',
            type: 'text',
            unit: 'millimeters',
            mandatory: 'true',
          },
          { name: '', type: 'text', unit: 'millimeters', mandatory: 'true' },
        ],
      });

      expect(screen.getByText('Catalogue Item Properties')).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await waitFor(() => user.click(saveButton));

      const nameHelperTexts = await screen.findAllByText(
        'Please enter a property name.'
      );

      expect(nameHelperTexts.length).toBe(2);

      expect(onClose).not.toHaveBeenCalled();
    }, 10000);

    it('display error if duplicate property names are entered', async () => {
      createView();
      await modifyValues({
        name: 'test',
        newFormFields: [
          { name: 'Field 1', type: 'text', mandatory: 'false' },
          {
            name: 'Field 2',
            type: 'number',
            unit: 'millimeters',
            mandatory: 'true',
          },
          { name: 'Field 1', type: 'boolean', mandatory: 'false' },
        ],
      });

      expect(screen.getByText('Catalogue Item Properties')).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await waitFor(() => user.click(saveButton));

      const duplicatePropertyNameHelperText = screen.queryAllByText(
        'Duplicate property name. Please change the name or remove the property.'
      );
      expect(duplicatePropertyNameHelperText.length).toBe(2);

      expect(onClose).not.toHaveBeenCalled();
    }, 10000);

    it('display error if duplicate property names are entered and clears errors when one duplicate has been deleted', async () => {
      createView();
      await modifyValues({
        name: 'test',
        newFormFields: [
          { name: 'Field 1', type: 'text', mandatory: 'false' },
          {
            name: 'Field 2',
            type: 'number',
            unit: 'millimeters',
            mandatory: 'true',
          },
          { name: 'Field 1', type: 'boolean', mandatory: 'false' },
        ],
      });

      expect(screen.getByText('Catalogue Item Properties')).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await waitFor(() => user.click(saveButton));

      const duplicatePropertyNameHelperText = await screen.findAllByText(
        'Duplicate property name. Please change the name or remove the property.'
      );
      expect(duplicatePropertyNameHelperText.length).toBe(2);

      const deletePropertyButtons = await screen.findAllByLabelText(
        'Delete catalogue category property entry'
      );

      await user.click(deletePropertyButtons[0]);

      expect(
        screen.queryByText(
          'Duplicate property name. Please change the name or remove the property.'
        )
      ).not.toBeInTheDocument();

      expect(onClose).not.toHaveBeenCalled();
    }, 10000);

    it('clears formFields when catalogue content is catalogue categories', async () => {
      createView();

      await modifyValues({
        newFormFields: [
          {
            name: 'radius',
            type: 'number',
            unit: 'millimeters',
            mandatory: 'true',
          },
        ],
      });

      expect(screen.getByDisplayValue('Number')).toBeInTheDocument();
      expect(screen.getByDisplayValue('radius')).toBeInTheDocument();
      expect(screen.getByDisplayValue('millimeters')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Yes')).toBeInTheDocument();

      const categoriesRadio = screen.getByLabelText('Catalogue Categories');
      await user.click(categoriesRadio);

      expect(screen.queryByDisplayValue('Number')).not.toBeInTheDocument();
      expect(screen.queryByDisplayValue('radius')).not.toBeInTheDocument();
      expect(screen.queryByDisplayValue('millimeters')).not.toBeInTheDocument();
      expect(screen.queryByDisplayValue('Yes')).not.toBeInTheDocument();
    }, 10000);

    it('displays duplicate values and invalid type errors (allowed_values list of numbers)', async () => {
      createView();

      await modifyValues({
        name: 'test',
        newFormFields: [
          {
            name: 'radius',
            type: 'number',
            unit: 'millimeters',
            allowed_values: {
              type: 'list',
              values: {
                valueType: 'number',
                values: [
                  { av_placement_id: '1', value: 1 },
                  { av_placement_id: '2', value: 1 },
                  { av_placement_id: '3', value: 'dsa' },
                ],
              },
            },
            mandatory: 'true',
          },
        ],
      });

      expect(screen.getByText('Catalogue Item Properties')).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await waitFor(() => user.click(saveButton));

      const duplicateHelperTexts =
        await screen.findAllByText('Duplicate value.');
      const incorrectTypeHelperTexts = await screen.findAllByText(
        'Please enter a valid number.'
      );

      expect(duplicateHelperTexts.length).toEqual(2);
      expect(incorrectTypeHelperTexts.length).toEqual(1);

      expect(onClose).not.toHaveBeenCalled();
    }, 10000);

    it('displays duplicate values and incorrect type error and deletes an allowed value to check if errors states are in correct location (allowed_values list of numbers)', async () => {
      createView();

      await modifyValues({
        name: 'test',
        newFormFields: [
          {
            name: 'radius',
            type: 'number',
            unit: 'millimeters',
            allowed_values: {
              type: 'list',
              values: {
                valueType: 'number',
                values: [
                  { av_placement_id: '1', value: 1 },
                  { av_placement_id: '2', value: 1 },
                  { av_placement_id: '3', value: 'dsad' },
                  { av_placement_id: '2', value: 2 },
                ],
              },
            },
            mandatory: 'true',
          },
        ],
      });

      expect(screen.getByText('Catalogue Item Properties')).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await waitFor(() => user.click(saveButton));

      const duplicateHelperTexts = screen.queryAllByText('Duplicate value.');
      const incorrectTypeHelperTexts = screen.queryAllByText(
        'Please enter a valid number.'
      );

      expect(duplicateHelperTexts.length).toEqual(2);
      expect(incorrectTypeHelperTexts.length).toEqual(1);

      expect(onClose).not.toHaveBeenCalled();

      await user.click(screen.getAllByLabelText('Delete list item')[0]);

      const duplicateHelperTexts2 = screen.queryByText('Duplicate value.');

      expect(duplicateHelperTexts2).not.toBeInTheDocument();
    }, 10000);

    it('displays invalid type errors (allowed_values list of numbers)', async () => {
      createView();

      await modifyValues({
        name: 'test',
        newFormFields: [
          {
            name: 'radius',
            type: 'number',
            unit: 'millimeters',
            allowed_values: {
              type: 'list',
              values: {
                valueType: 'number',
                values: [{ av_placement_id: '3', value: 'dsa' }],
              },
            },
            mandatory: 'true',
          },
        ],
      });

      expect(screen.getByText('Catalogue Item Properties')).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await waitFor(() => user.click(saveButton));

      const incorrectTypeHelperTexts = screen.queryAllByText(
        'Please enter a valid number.'
      );

      expect(incorrectTypeHelperTexts.length).toEqual(1);

      expect(onClose).not.toHaveBeenCalled();
    }, 10000);

    it('displays duplicate values values with different significant figures (allowed_values list of numbers)', async () => {
      createView();

      await modifyValues({
        name: 'test',
        newFormFields: [
          {
            name: 'radius',
            type: 'number',
            unit: 'millimeters',
            allowed_values: {
              type: 'list',
              values: {
                valueType: 'number',
                values: [
                  { av_placement_id: '1', value: '1.0' },
                  { av_placement_id: '2', value: '1' },
                ],
              },
            },
            mandatory: 'true',
          },
        ],
      });

      expect(screen.getByText('Catalogue Item Properties')).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await waitFor(() => user.click(saveButton));

      const duplicateHelperTexts = screen.queryAllByText('Duplicate value.');

      expect(duplicateHelperTexts.length).toEqual(2);

      expect(onClose).not.toHaveBeenCalled();
    }, 10000);

    it('displays error if the allowed values list is empty', async () => {
      createView();

      await modifyValues({
        name: 'test',
        newFormFields: [
          {
            name: 'radius',
            type: 'number',
            unit: 'millimeters',
            allowed_values: {
              type: 'list',
              values: {
                valueType: 'number',
                values: [],
              },
            },
            mandatory: 'true',
          },
        ],
      });

      expect(screen.getByText('Catalogue Item Properties')).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await waitFor(() => user.click(saveButton));

      const listHelperTexts = screen.queryAllByText(
        'Please create a valid list item.'
      );

      expect(listHelperTexts.length).toEqual(1);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('displays error type is undefined and a list item is undefined', async () => {
      createView();

      await modifyValues({
        name: 'test',
        newFormFields: [
          {
            name: 'radius',
            type: 'text',
            unit: 'millimeters',
            allowed_values: {
              type: 'list',
              values: {
                valueType: 'number',
                values: [
                  { av_placement_id: '1', value: '' },
                  { av_placement_id: '2', value: '' },
                ],
              },
            },
            mandatory: 'true',
          },
        ],
      });

      expect(screen.getByText('Catalogue Item Properties')).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await waitFor(() => user.click(saveButton));

      const listHelperTexts = screen.queryAllByText('Please enter a value.');

      expect(listHelperTexts.length).toEqual(2);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('displays duplicate values error (allowed_values list of string)', async () => {
      createView();

      await modifyValues({
        name: 'test',
        newFormFields: [
          {
            name: 'radius',
            type: 'text',
            unit: 'millimeters',
            allowed_values: {
              type: 'list',
              values: {
                valueType: 'number',
                values: [
                  { av_placement_id: '1', value: 1 },
                  { av_placement_id: '2', value: 1 },
                  { av_placement_id: '3', value: 'dsa' },
                  { av_placement_id: '4', value: 'sa' },
                  { av_placement_id: '5', value: '$%^&*()' },
                ],
              },
            },
            mandatory: 'true',
          },
        ],
      });

      expect(screen.getByText('Catalogue Item Properties')).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await waitFor(() => user.click(saveButton));

      const duplicateHelperTexts = screen.queryAllByText('Duplicate value.');

      expect(duplicateHelperTexts.length).toEqual(2);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('does not close dialog on background click, or on escape key press', async () => {
      createView();

      await userEvent.click(document.body);

      expect(onClose).not.toHaveBeenCalled();

      fireEvent.keyDown(screen.getByRole('dialog'), {
        key: 'Escape',
        code: 'Escape',
        keyCode: 27,
        charCode: 27,
      });

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Edit Catalogue Category Dialog', () => {
    let axiosPatchSpy: MockInstance;
    const mockData: CatalogueCategory = {
      name: 'test',
      parent_id: null,
      id: '1',
      code: 'test',
      is_leaf: false,
      ...CREATED_MODIFIED_TIME_VALUES,
      properties: [],
    };

    beforeEach(() => {
      props = {
        open: true,
        onClose: onClose,
        parentId: null,
        requestType: 'patch',
        selectedCatalogueCategory: mockData,
        resetSelectedCatalogueCategory: resetSelectedCatalogueCategory,
      };
      user = userEvent.setup();
      axiosPatchSpy = vi.spyOn(imsApi, 'patch');
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('disables save button and shows circular progress indicator when request is pending', async () => {
      server.use(
        http.patch('/v1/catalogue-categories/:id', () => {
          return new Promise(() => {});
        })
      );

      props.selectedCatalogueCategory = {
        ...mockData,
        id: '4',
      };

      createView();

      await modifyValues({ name: 'update' });

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      expect(saveButton).toBeDisabled();
      expect(await screen.findByRole('progressbar')).toBeInTheDocument();
    });

    it('displays warning message when name field is not defined', async () => {
      createView();

      modifyValues({ name: '' });

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      const helperTexts = screen.getByText('Please enter a name.');
      expect(helperTexts).toBeInTheDocument();
      expect(onClose).not.toHaveBeenCalled();
    });

    it('displays warning message when name already exists within the parent catalogue category', async () => {
      createView();

      modifyValues({ name: 'test_dup' });

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            'A catalogue category with the same name already exists within the same parent catalogue category. Please enter a different name.'
          )
        ).toBeInTheDocument();
      });
      expect(onClose).not.toHaveBeenCalled();
    });

    it('displays warning message when an unknown error occurs', async () => {
      props = {
        ...props,
        selectedCatalogueCategory: {
          ...mockData,
          id: '4',
        },
      };
      createView();

      await modifyValues({ name: 'Error 500' });

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      expect(handleIMS_APIError).toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });

    it('displays error message if no form fields have been edited', async () => {
      props.selectedCatalogueCategory = {
        ...mockData,
        id: '18',
        name: 'Voltage Meters',
        parent_id: '1',
        code: 'voltage-meters',
        is_leaf: true,
        properties: [
          {
            id: '1',
            name: 'Measurement Range',
            type: CatalogueCategoryPropertyType.Number,
            unit: 'volts',
            mandatory: true,
            unit_id: '9',
            allowed_values: null,
          },
          {
            id: '1',
            name: 'Accuracy',
            type: CatalogueCategoryPropertyType.Text,
            mandatory: true,
            unit_id: null,
            unit: null,
            allowed_values: null,
          },
        ],
      };

      createView();

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            'There have been no changes made. Please change the name field value or press Close.'
          )
        ).toBeInTheDocument();
      });
      expect(onClose).not.toHaveBeenCalled();

      const formName = screen.getAllByLabelText('Name *');

      // Modify the name field using userEvent
      fireEvent.change(formName[0], {
        target: { value: 'Updated Field' },
      });

      await waitFor(() => {
        expect(
          screen.queryByText(
            'There have been no changes made. Please change the name field value or press Close.'
          )
        ).not.toBeInTheDocument();
      });
    });

    it('edits a new catalogue category at root level ("/catalogue")', async () => {
      props.selectedCatalogueCategory = {
        ...mockData,
        id: '4',
      };

      createView();

      await modifyValues({ name: 'test2' });

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/catalogue-categories/4', {
        name: 'test2',
        properties: undefined,
      });
    });

    it('edits a new catalogue category at sub level ("/catalogue/*")', async () => {
      createView();

      await modifyValues({ name: 'test2' });

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);
      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/catalogue-categories/1', {
        name: 'test2',
      });
    });
  });

  describe('Duplicate Catalogue Category Dialog', () => {
    //All of actual logic is same as add so is tested above
    //checks that the dialog renders/opens correctly for `duplicate`

    let axiosPostSpy: MockInstance;
    const mockData: CatalogueCategory = {
      name: 'test',
      parent_id: null,
      id: '1',
      code: 'test',
      is_leaf: false,
      properties: [],
      ...CREATED_MODIFIED_TIME_VALUES,
    };

    beforeEach(() => {
      props = {
        open: true,
        onClose: onClose,
        parentId: null,
        requestType: 'post',
        duplicate: true,
        selectedCatalogueCategory: mockData,
        resetSelectedCatalogueCategory: resetSelectedCatalogueCategory,
      };
      user = userEvent.setup();
      axiosPostSpy = vi.spyOn(imsApi, 'post');
    });

    it('renders correctly when duplicating', async () => {
      createView();

      expect(screen.getByText('Add Catalogue Category')).toBeInTheDocument();
    });

    it('duplicates a catalogue category', async () => {
      createView();

      const values = {
        name: 'Catalogue Category name',
      };
      await modifyValues(values);

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/catalogue-categories', {
        ...values,
        is_leaf: false,
      });
      expect(onClose).toHaveBeenCalled();
    });

    it('duplicate a catalogue category (with properties)', async () => {
      props.selectedCatalogueCategory = {
        ...mockData,
        is_leaf: true,
        properties: [
          {
            id: '1',
            name: 'Field 1',
            type: CatalogueCategoryPropertyType.Text,
            unit: null,

            mandatory: false,
            unit_id: null,
            allowed_values: null,
          },
          {
            id: '2',
            name: 'Field 2',
            type: CatalogueCategoryPropertyType.Number,
            unit: 'millimeters',
            mandatory: true,
            unit_id: '5',
            allowed_values: null,
          },
          {
            id: '3',
            name: 'Field 3',
            type: CatalogueCategoryPropertyType.Boolean,
            mandatory: false,
            unit_id: null,
            unit: null,
            allowed_values: null,
          },
        ],
      };
      createView();

      const values = {
        name: 'Catalogue Category name',
      };
      await modifyValues(values);

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/catalogue-categories', {
        ...values,
        is_leaf: true,
        properties: [
          {
            name: 'Field 1',
            type: 'string',
            mandatory: false,
          },
          {
            name: 'Field 2',
            type: 'number',
            unit_id: '5',
            mandatory: true,
          },
          { name: 'Field 3', type: 'boolean', mandatory: false },
        ],
      });
      expect(onClose).toHaveBeenCalled();
    });

    it('duplicate a catalogue category (with properties and allowed values)', async () => {
      props.selectedCatalogueCategory = {
        ...mockData,
        is_leaf: true,
        properties: [
          {
            id: '1',
            name: 'Field 1',
            type: CatalogueCategoryPropertyType.Text,
            unit: null,

            mandatory: false,
            unit_id: null,
            allowed_values: { type: 'list', values: ['test'] },
          },
          {
            id: '2',
            name: 'Field 2',
            type: CatalogueCategoryPropertyType.Number,
            unit: 'millimeters',
            mandatory: true,
            unit_id: '5',
            allowed_values: { type: 'list', values: [1] },
          },
        ],
      };
      createView();

      const values = {
        name: 'Catalogue Category name',
      };
      await modifyValues(values);

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/catalogue-categories', {
        ...values,
        is_leaf: true,
        properties: [
          {
            name: 'Field 1',
            type: 'string',
            mandatory: false,
            allowed_values: {
              type: 'list',
              values: ['test'],
            },
          },
          {
            name: 'Field 2',
            type: 'number',
            allowed_values: {
              type: 'list',
              values: [1],
            },
            unit_id: '5',
            mandatory: true,
          },
        ],
      });
      expect(onClose).toHaveBeenCalled();
    });
  });
});
