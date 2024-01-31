import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import React from 'react';
import { CatalogueCategory, CatalogueCategoryFormData } from '../../app.types';
import { renderComponentWithBrowserRouter } from '../../setupTests';
import CatalogueCategoryDialog, {
  CatalogueCategoryDialogProps,
} from './catalogueCategoryDialog.component';

describe('Catalogue Category Dialog', () => {
  const onClose = jest.fn();
  const resetSelectedCatalogueCategory = jest.fn();
  let props: CatalogueCategoryDialogProps;
  let user;

  const createView = () => {
    return renderComponentWithBrowserRouter(
      <CatalogueCategoryDialog {...props} />
    );
  };

  // Modifies values when given a value that is not undefined
  const modifyValues = async (values: {
    name?: string;
    // New fields to add (if any)
    newFormFields?: CatalogueCategoryFormData[];
  }) => {
    values.name &&
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
      values.newFormFields.forEach(async (field, index) => {
        await user.click(
          screen.getByRole('button', {
            name: 'Add catalogue category field entry',
          })
        );
      });

      await waitFor(() =>
        expect(screen.getAllByLabelText('Property Name *').length).toBe(
          numberOfCurrentFields + values.newFormFields?.length
        )
      );

      // Modify
      const nameFields = screen.getAllByLabelText('Property Name *');
      const typeSelects = screen.getAllByLabelText('Select Type *');
      const allowedValuesSelects = screen.getAllByLabelText(
        'Select Allowed values *'
      );
      const unitFields = screen.getAllByLabelText('Select Unit');
      const mandatorySelect = screen.getAllByLabelText('Select is mandatory?');

      for (let i = 0; i < values.newFormFields.length; i++) {
        const field = values.newFormFields[i];

        if (field.name)
          await fireEvent.change(nameFields[i + numberOfCurrentFields], {
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

        if (field.unit)
          await fireEvent.change(unitFields[i + numberOfCurrentFields], {
            target: { value: field.unit },
          });

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
            for (let j = 0; j < field.allowed_values.values.length; j++) {
              await user.click(
                screen.getByRole('button', {
                  name: `Add list item ${i + numberOfCurrentFields}`,
                })
              );
            }
          }
        }

        // Modify allowed values if present
        if (field.allowed_values?.type === 'list') {
          for (let j = 0; j < field.allowed_values.values.length; j++) {
            await waitFor(() => {
              screen.getAllByLabelText(`List Item ${j}`);
            });
            const listItems = screen.getAllByLabelText(`List Item ${j}`);

            await fireEvent.change(
              within(
                listItems[
                  i + numberOfCurrentFields - allowedValuesSelects.length + 1
                ]
              ).getByLabelText('List Item'),
              {
                target: { value: field.allowed_values.values[j] },
              }
            );
          }
        }
      }
    }
  };

  describe('Add Catalogue Category Dialog', () => {
    let axiosPostSpy;
    beforeEach(() => {
      props = {
        open: true,
        onClose: onClose,
        parentId: null,
        type: 'add',
        resetSelectedCatalogueCategory: resetSelectedCatalogueCategory,
      };
      user = userEvent.setup();

      axiosPostSpy = jest.spyOn(axios, 'post');
    });

    afterEach(() => {
      jest.clearAllMocks();
      axiosPostSpy.mockRestore();
    });

    it('renders text correctly', async () => {
      createView();
      expect(screen.getByLabelText('Name *')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
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
            'A catalogue category with the same name already exists within the parent catalogue category'
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

      await waitFor(() => {
        expect(
          screen.getByText('Please refresh and try again')
        ).toBeInTheDocument();
      });
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
      user.click(closeButton);

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('changes directory content type when radio is clicked', async () => {
      createView();

      expect(
        screen.queryByText('Catalogue Item Fields')
      ).not.toBeInTheDocument();

      const itemsRadio = screen.getByLabelText('Catalogue Items');
      await user.click(itemsRadio);

      expect(screen.getByText('Catalogue Item Fields')).toBeInTheDocument();
    });

    it('create a catalogue category with content being catalogue items', async () => {
      createView();

      await modifyValues({
        name: 'test',
        newFormFields: [
          { name: 'radius', type: 'number', unit: 'mm', mandatory: true },
        ],
      });

      expect(screen.getByText('Catalogue Item Fields')).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await waitFor(() => user.click(saveButton));

      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/catalogue-categories', {
        catalogue_item_properties: [
          { mandatory: true, name: 'radius', type: 'number', unit: 'mm' },
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
            unit: 'mm',
            allowed_values: { type: 'list', values: [1, 2, 8] },
            mandatory: true,
          },
        ],
      });

      expect(screen.getByText('Catalogue Item Fields')).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await waitFor(() => user.click(saveButton));

      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/catalogue-categories', {
        catalogue_item_properties: [
          {
            allowed_values: { type: 'list', values: [1, 2, 8] },
            mandatory: true,
            name: 'radius',
            type: 'number',
            unit: 'mm',
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
            unit: 'mm',
            allowed_values: { type: 'list', values: ['1', '2', '8'] },
            mandatory: true,
          },
        ],
      });

      expect(screen.getByText('Catalogue Item Fields')).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await waitFor(() => user.click(saveButton));

      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/catalogue-categories', {
        catalogue_item_properties: [
          {
            allowed_values: { type: 'list', values: ['1', '2', '8'] },
            mandatory: true,
            name: 'radius',
            type: 'string',
            unit: 'mm',
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
          { name: '', type: 'number', unit: 'mm', mandatory: true },
          { name: 'radius', type: '', unit: 'mm', mandatory: true },
          { name: '', type: '', unit: 'mm', mandatory: true },
        ],
      });

      expect(screen.getByText('Catalogue Item Fields')).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await waitFor(() => user.click(saveButton));

      const nameHelperTexts = screen.queryAllByText('Please select a type');
      const typeHelperTexts = screen.queryAllByText(
        'Please enter a property name'
      );

      expect(nameHelperTexts.length).toBe(2);
      expect(typeHelperTexts.length).toBe(2);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('display error if duplicate property names are entered', async () => {
      createView();
      await modifyValues({
        name: 'test',
        newFormFields: [
          { name: 'Field 1', type: 'text', unit: '', mandatory: false },
          { name: 'Field 2', type: 'number', unit: 'cm', mandatory: true },
          { name: 'Field 1', type: 'boolean', mandatory: false },
        ],
      });

      expect(screen.getByText('Catalogue Item Fields')).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await waitFor(() => user.click(saveButton));

      const duplicatePropertyNameHelperText = screen.queryAllByText(
        'Duplicate property name. Please change the name or remove the property'
      );
      expect(duplicatePropertyNameHelperText.length).toBe(2);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('clears formFields when catalogue content is catalogue categories', async () => {
      createView();

      await modifyValues({
        newFormFields: [
          { name: 'radius', type: 'number', unit: 'mm', mandatory: true },
        ],
      });

      expect(screen.getByDisplayValue('number')).toBeInTheDocument();
      expect(screen.getByDisplayValue('radius')).toBeInTheDocument();
      expect(screen.getByDisplayValue('mm')).toBeInTheDocument();
      expect(screen.getByText('Yes')).toBeInTheDocument();

      const catagoriesRadio = screen.getByLabelText('Catalogue Categories');
      await user.click(catagoriesRadio);

      expect(screen.queryByDisplayValue('number')).not.toBeInTheDocument();
      expect(screen.queryByDisplayValue('radius')).not.toBeInTheDocument();
      expect(screen.queryByDisplayValue('mm')).not.toBeInTheDocument();
      expect(screen.queryByText('Yes')).not.toBeInTheDocument();
    });

    it('displays duplicate values and incorrect type error (allowed_values list of numbers)', async () => {
      createView();

      await modifyValues({
        name: 'test',
        newFormFields: [
          {
            name: 'radius',
            type: 'number',
            unit: 'mm',
            allowed_values: { type: 'list', values: [1, 1, 'dsa'] },
            mandatory: true,
          },
        ],
      });

      expect(screen.getByText('Catalogue Item Fields')).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await waitFor(() => user.click(saveButton));

      const duplicateHelperTexts = screen.queryAllByText('Duplicate value');
      const incorrectTypeHelperTexts = screen.queryAllByText(
        'Please enter a valid number'
      );

      expect(duplicateHelperTexts.length).toEqual(2);
      expect(incorrectTypeHelperTexts.length).toEqual(1);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('displays error if the allowed values list is empty', async () => {
      createView();

      await modifyValues({
        name: 'test',
        newFormFields: [
          {
            name: 'radius',
            type: 'number',
            unit: 'mm',
            allowed_values: { type: 'list', values: [] },
            mandatory: true,
          },
        ],
      });

      expect(screen.getByText('Catalogue Item Fields')).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await waitFor(() => user.click(saveButton));

      const listHelperTexts = screen.queryAllByText(
        'Please create a valid list item'
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
            type: '',
            unit: 'mm',
            allowed_values: { type: 'list', values: ['', ''] },
            mandatory: true,
          },
        ],
      });

      expect(screen.getByText('Catalogue Item Fields')).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await waitFor(() => user.click(saveButton));

      const listHelperTexts = screen.queryAllByText('Please enter a value');

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
            unit: 'mm',
            allowed_values: {
              type: 'list',
              values: [1, 1, 'dsa', 'sa', '$%^&*()'],
            },
            mandatory: true,
          },
        ],
      });

      expect(screen.getByText('Catalogue Item Fields')).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await waitFor(() => user.click(saveButton));

      const duplicateHelperTexts = screen.queryAllByText('Duplicate value');

      expect(duplicateHelperTexts.length).toEqual(2);

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Edit Catalogue Category Dialog', () => {
    let axiosPatchSpy;
    let mockData: CatalogueCategory = {
      name: 'test',
      parent_id: null,
      id: '1',
      code: 'test',
      is_leaf: false,
    };

    beforeEach(() => {
      props = {
        open: true,
        onClose: onClose,
        parentId: null,
        type: 'edit',
        selectedCatalogueCategory: mockData,
        resetSelectedCatalogueCategory: resetSelectedCatalogueCategory,
      };
      user = userEvent.setup();
      axiosPatchSpy = jest.spyOn(axios, 'patch');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('displays warning message when name field is not defined', async () => {
      props.selectedCatalogueCategory = {
        ...mockData,
        name: '',
      };
      createView();

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);
      const helperTexts = screen.getByText('Please enter a name.');
      expect(helperTexts).toBeInTheDocument();
      expect(onClose).not.toHaveBeenCalled();
    });

    it('displays warning message when name already exists within the parent catalogue category', async () => {
      props.selectedCatalogueCategory = {
        ...mockData,
        name: 'test_dup',
      };
      createView();

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            'A catalogue category with the same name already exists within the parent catalogue category'
          )
        ).toBeInTheDocument();
      });
      expect(onClose).not.toHaveBeenCalled();
    });

    it('displays child elements warning message', async () => {
      props = {
        ...props,
        parentId: '1',
        selectedCatalogueCategory: {
          id: '4',
          name: 'Cameras',
          parent_id: '1',
          code: 'cameras',
          is_leaf: true,
          catalogue_item_properties: [
            {
              name: 'Resolution',
              type: 'number',
              unit: 'megapixels',
              mandatory: true,
            },
          ],
        },
      };
      createView();

      await modifyValues({
        newFormFields: [
          { name: 'radius', type: 'number', unit: 'mm', mandatory: true },
        ],
      });

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);
      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/catalogue-categories/4', {
        catalogue_item_properties: [
          {
            name: 'Resolution',
            type: 'number',
            unit: 'megapixels',
            mandatory: true,
          },
          { mandatory: true, name: 'radius', type: 'number', unit: 'mm' },
        ],
      });
      await waitFor(() => {
        expect(
          screen.getByText(
            'Catalogue category has child elements and cannot be updated'
          )
        ).toBeInTheDocument();
      });
      expect(onClose).not.toHaveBeenCalled();
    });

    it('edits a catalogue category with content being catalogue items (allowed_values list of numbers)', async () => {
      props = {
        ...props,
        parentId: '1',
        selectedCatalogueCategory: {
          id: '4',
          name: 'Cameras',
          parent_id: '1',
          code: 'cameras',
          is_leaf: true,
          catalogue_item_properties: [
            {
              name: 'Resolution',
              type: 'number',
              unit: 'megapixels',
              mandatory: true,
            },
          ],
        },
      };
      createView();

      await modifyValues({
        name: 'test',
        newFormFields: [
          {
            name: 'radius',
            type: 'number',
            unit: 'mm',
            allowed_values: { type: 'list', values: [1, 2, 8] },
            mandatory: true,
          },
        ],
      });

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);
      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/catalogue-categories/4', {
        catalogue_item_properties: [
          {
            mandatory: true,
            name: 'Resolution',
            type: 'number',
            unit: 'megapixels',
          },
          {
            allowed_values: { type: 'list', values: [1, 2, 8] },
            mandatory: true,
            name: 'radius',
            type: 'number',
            unit: 'mm',
          },
        ],
        name: 'test',
      });
    });

    it('edits a catalogue category with content being catalogue items (allowed_values list of strings)', async () => {
      props = {
        ...props,
        parentId: '1',
        selectedCatalogueCategory: {
          id: '4',
          name: 'Cameras',
          parent_id: '1',
          code: 'cameras',
          is_leaf: true,
          catalogue_item_properties: [
            {
              name: 'Resolution',
              type: 'number',
              unit: 'megapixels',
              mandatory: true,
            },
          ],
        },
      };
      createView();

      await modifyValues({
        name: 'test',
        newFormFields: [
          {
            name: 'radius',
            type: 'text',
            unit: 'mm',
            allowed_values: { type: 'list', values: ['1', '2', '8'] },
            mandatory: true,
          },
        ],
      });

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);
      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/catalogue-categories/4', {
        catalogue_item_properties: [
          {
            mandatory: true,
            name: 'Resolution',
            type: 'number',
            unit: 'megapixels',
          },
          {
            allowed_values: { type: 'list', values: ['1', '2', '8'] },
            mandatory: true,
            name: 'radius',
            type: 'string',
            unit: 'mm',
          },
        ],
        name: 'test',
      });
    });

    it('displays warning message when an unknown error occurs', async () => {
      props = {
        ...props,
        selectedCatalogueCategory: {
          ...mockData,
          id: '4',
          name: 'Error 500',
        },
      };
      createView();

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText('Please refresh and try again')
        ).toBeInTheDocument();
      });
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
        catalogue_item_properties: [
          {
            name: 'Measurement Range',
            type: 'number',
            unit: 'volts',
            mandatory: true,
          },
          {
            name: 'Accuracy',
            type: 'string',
            mandatory: true,
          },
        ],
      };

      createView();

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText('Please edit a form entry before clicking save')
        ).toBeInTheDocument();
      });
      expect(onClose).not.toHaveBeenCalled();

      const formName = screen.getAllByLabelText('Property Name *');

      // Modify the name field using userEvent
      fireEvent.change(formName[0], {
        target: { value: 'Updated Field' },
      });

      await waitFor(() => {
        expect(
          screen.queryByText('Please edit a form entry before clicking save')
        ).not.toBeInTheDocument();
      });
    });

    it('edits a new catalogue category at root level ("/catalogue")', async () => {
      props.selectedCatalogueCategory = {
        ...mockData,
        id: '4',
        name: 'test',
      };

      createView();

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/catalogue-categories/4', {
        name: 'test',
        is_leaf: false,
      });

      expect(onClose).toHaveBeenCalled();
    });

    it('edits a new catalogue category at sub level ("/catalogue/*")', async () => {
      createView();

      await modifyValues({ name: 'test' });

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);
      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/catalogue-categories/1', {
        name: 'test',
      });

      expect(onClose).toHaveBeenCalled();
    });

    it('displays an error message when the type or name field are not filled', async () => {
      props.selectedCatalogueCategory = {
        ...mockData,
        is_leaf: true,
        catalogue_item_properties: [
          { name: '', type: 'number', unit: 'mm', mandatory: true },
          { name: 'radius', type: '', unit: 'mm', mandatory: true },
          { name: '', type: '', unit: 'mm', mandatory: true },
        ],
      };
      createView();

      await modifyValues({ name: 'test' });
      expect(screen.getByText('Catalogue Item Fields')).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);

      const nameHelperTexts = screen.queryAllByText('Please select a type');
      const typeHelperTexts = screen.queryAllByText(
        'Please enter a property name'
      );

      expect(nameHelperTexts.length).toBe(2);
      expect(typeHelperTexts.length).toBe(2);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('display error if duplicate property names are entered', async () => {
      props.selectedCatalogueCategory = {
        ...mockData,
        is_leaf: true,
        catalogue_item_properties: [
          { name: 'Field 1', type: 'text', unit: '', mandatory: false },
          { name: 'Field 2', type: 'number', unit: 'cm', mandatory: true },
          { name: 'Field 1', type: 'boolean', mandatory: false },
        ],
      };
      createView();

      await modifyValues({ name: 'test' });
      expect(screen.getByText('Catalogue Item Fields')).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);

      const duplicatePropertyNameHelperText = screen.queryAllByText(
        'Duplicate property name. Please change the name or remove the property'
      );
      expect(duplicatePropertyNameHelperText.length).toBe(2);

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Save as Catalogue Category Dialog', () => {
    //All of actual logic is same as add so is tested above
    //checks that the dialog renders/opens correctly for `save as`

    let axiosPostSpy;
    let mockData: CatalogueCategory = {
      name: 'test',
      parent_id: null,
      id: '1',
      code: 'test',
      is_leaf: false,
    };

    beforeEach(() => {
      props = {
        open: true,
        onClose: onClose,
        parentId: null,
        type: 'save as',
        selectedCatalogueCategory: mockData,
        resetSelectedCatalogueCategory: resetSelectedCatalogueCategory,
      };
      user = userEvent.setup();
      axiosPostSpy = jest.spyOn(axios, 'post');
    });

    it('renders correctly when saving as', async () => {
      createView();

      expect(screen.getByText('Add Catalogue Category')).toBeInTheDocument();
    });

    it('saves as a catalogue category', async () => {
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
  });
});
