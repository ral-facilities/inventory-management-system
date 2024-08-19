import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { http } from 'msw';
import { MockInstance } from 'vitest';
import { imsApi } from '../../api/api';
import {
  AddCatalogueCategoryProperty,
  CatalogueCategory,
} from '../../app.types';
import handleIMS_APIError from '../../handleIMS_APIError';
import { server } from '../../mocks/server';
import {
  CREATED_MODIFIED_TIME_VALUES,
  renderComponentWithRouterProvider,
} from '../../testUtils';
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
            for (let j = 0; j < field.allowed_values.values.length; j++) {
              await user.click(
                screen.getAllByRole('button', {
                  name: `Add list item`,
                })[i + numberOfCurrentFields]
              );

              await waitFor(() => {
                screen.getByTestId(
                  `av_placement_id_${i + j + (values.newFormFields ? values.newFormFields.length : 0) + 1}: List Item`
                );
              });
              const listItem = screen.getByTestId(
                `av_placement_id_${i + j + values.newFormFields.length + 1}: List Item`
              );

              fireEvent.change(within(listItem).getByRole('textbox'), {
                target: { value: field.allowed_values.values[j] },
              });
            }
          }
        }
      }
    }
  };

  describe('Edit Catalogue Category Dialog', () => {
    let axiosPatchSpy: MockInstance;
    const mockData: CatalogueCategory = {
      name: 'test',
      parent_id: null,
      id: '1',
      code: 'test',
      is_leaf: false,
      ...CREATED_MODIFIED_TIME_VALUES,
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
            'A catalogue category with the same name already exists within the parent catalogue category'
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
            type: 'number',
            unit: 'volts',
            mandatory: true,
          },
          {
            id: '1',
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
      };

      createView();

      await modifyValues({ name: 'test2' });

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/catalogue-categories/4', {
        name: 'test2',
        properties: undefined,
      });

      expect(onClose).toHaveBeenCalled();
    });

    it('edits a new catalogue category at sub level ("/catalogue/*")', async () => {
      createView();

      await modifyValues({ name: 'test2' });

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);
      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/catalogue-categories/1', {
        name: 'test2',
      });

      expect(onClose).toHaveBeenCalled();
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
      ...CREATED_MODIFIED_TIME_VALUES,
    };

    beforeEach(() => {
      props = {
        open: true,
        onClose: onClose,
        parentId: null,
        type: 'duplicate',
        selectedCatalogueCategory: mockData,
        resetSelectedCatalogueCategory: resetSelectedCatalogueCategory,
      };
      user = userEvent.setup();
      axiosPostSpy = vi.spyOn(imsApi, 'post');
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

    it('saves as a catalogue category (with properties)', async () => {
      props.selectedCatalogueCategory = {
        ...mockData,
        is_leaf: true,
        properties: [
          {
            id: '1',
            name: 'Field 1',
            type: 'text',
            unit: '',
            mandatory: false,
          },
          {
            id: '2',
            name: 'Field 2',
            type: 'number',
            unit: 'millimeters',
            mandatory: true,
          },
          { id: '3', name: 'Field 3', type: 'boolean', mandatory: false },
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
            type: 'text',
            unit: '',
            mandatory: false,
          },
          {
            name: 'Field 2',
            type: 'number',
            unit: 'millimeters',
            mandatory: true,
          },
          { name: 'Field 3', type: 'boolean', mandatory: false },
        ],
      });
      expect(onClose).toHaveBeenCalled();
    });
  });
});
