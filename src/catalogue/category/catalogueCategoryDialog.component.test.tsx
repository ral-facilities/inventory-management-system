import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CatalogueCategoryDialog, {
  CatalogueCategoryDialogProps,
} from './catalogueCategoryDialog.component';
import { renderComponentWithBrowserRouter } from '../../setupTests';
import { CatalogueCategory } from '../../app.types';

describe('Catalogue Category Dialog', () => {
  const onClose = jest.fn();
  const onChangeLeaf = jest.fn();
  const onChangeCatalogueCategoryName = jest.fn();
  const onChangeFormFields = jest.fn();
  const resetSelectedCatalogueCategory = jest.fn();
  let props: CatalogueCategoryDialogProps;
  let user;
  const createView = () => {
    return renderComponentWithBrowserRouter(
      <CatalogueCategoryDialog {...props} />
    );
  };
  describe('Add Catalogue Category Dialog', () => {
    beforeEach(() => {
      props = {
        open: true,
        onClose: onClose,
        parentId: null,
        onChangeCatalogueCategoryName: onChangeCatalogueCategoryName,
        catalogueCategoryName: undefined,
        onChangeLeaf: onChangeLeaf,
        isLeaf: false,
        type: 'add',
        onChangeFormFields: onChangeFormFields,
        formFields: null,
        resetSelectedCatalogueCategory: resetSelectedCatalogueCategory,
      };
      user = userEvent.setup();
    });

    afterEach(() => {
      jest.clearAllMocks();
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
      props = {
        ...props,
        catalogueCategoryName: 'test_dup',
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

    it('displays warning message when an unknown error occurs', async () => {
      props = {
        ...props,
        catalogueCategoryName: 'Error 500',
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

    it('Adds a new catalogue category at root level ("/catalogue")', async () => {
      props = {
        ...props,
        catalogueCategoryName: 'test',
      };

      createView();

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('Adds a new catalogue category at sub level ("/catalogue/*")', async () => {
      props = {
        ...props,
        parentId: '1',
        catalogueCategoryName: 'test',
      };

      createView();

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

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

      const itemsRadio = screen.getByLabelText('Catalogue Items');
      await user.click(itemsRadio);

      expect(onChangeLeaf).toHaveBeenCalledWith(true);
    });

    it('create a catalogue category with content being catalogue items', async () => {
      props = {
        ...props,
        isLeaf: true,
        catalogueCategoryName: 'test',
        formFields: [
          { name: 'radius', type: 'number', unit: 'mm', mandatory: true },
        ],
      };
      createView();

      expect(screen.getByText('Catalogue Item Fields')).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('displays an error message when the type or name field are not filled', async () => {
      props = {
        ...props,
        isLeaf: true,
        catalogueCategoryName: 'test',
        formFields: [
          { name: '', type: 'number', unit: 'mm', mandatory: true },
          { name: 'radius', type: '', unit: 'mm', mandatory: true },
          { name: '', type: '', unit: 'mm', mandatory: true },
        ],
      };
      createView();

      const nameInput = screen.getByLabelText('Name *');
      user.type(nameInput, 'test');
      await waitFor(() => {
        expect(screen.getByDisplayValue('test')).toBeInTheDocument();
      });
      expect(screen.getByText('Catalogue Item Fields')).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);

      const nameHelperTexts = screen.queryAllByText('Select Type is required');
      const typeHelperTexts = screen.queryAllByText(
        'Property Name is required'
      );

      expect(nameHelperTexts.length).toBe(2);
      expect(typeHelperTexts.length).toBe(2);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('clears formFields when catalogue content is catalogue categories', async () => {
      props = {
        ...props,
        isLeaf: true,
        formFields: [
          { name: 'radius', type: 'number', unit: 'mm', mandatory: true },
        ],
      };
      createView();

      const catagoriesRadio = screen.getByLabelText('Catalogue Categories');

      await user.click(catagoriesRadio);

      expect(onChangeFormFields).toHaveBeenCalledWith(null);
    });
  });

  describe('Edit Catalogue Category Dialog', () => {
    let mockData: CatalogueCategory = {
      name: 'test',
      parent_id: null,
      id: '1',
      code: 'test',
      path: '/test',
      parent_path: '/',
      is_leaf: false,
    };

    beforeEach(() => {
      props = {
        open: true,
        onClose: onClose,
        parentId: null,
        onChangeCatalogueCategoryName: onChangeCatalogueCategoryName,
        catalogueCategoryName: undefined,
        onChangeLeaf: onChangeLeaf,
        isLeaf: false,
        type: 'edit',
        selectedCatalogueCategory: mockData,
        onChangeFormFields: onChangeFormFields,
        formFields: null,
        resetSelectedCatalogueCategory: resetSelectedCatalogueCategory,
      };
      user = userEvent.setup();
    });

    afterEach(() => {
      jest.clearAllMocks();
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
      props = {
        ...props,
        catalogueCategoryName: 'test_dup',
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

    it('displays children elements warning message', async () => {
      props = {
        ...props,
        catalogueCategoryName: 'test',
      };
      createView();

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            'Catalogue category has children elements and cannot be updated'
          )
        ).toBeInTheDocument();
      });
      expect(onClose).not.toHaveBeenCalled();
    });

    it('displays warning message when an unknown error occurs', async () => {
      mockData = {
        ...mockData,
        id: '4',
      };

      props = {
        ...props,
        catalogueCategoryName: 'Error 500',
        selectedCatalogueCategory: mockData,
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
      mockData = {
        id: '15',
        name: 'Voltage Meters',
        parent_id: '1',
        code: 'voltage-meters',
        is_leaf: true,
        parent_path: '/beam-characterization',
        path: '/beam-characterization/voltage-meters',
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

      props = {
        ...props,
        catalogueCategoryName: mockData.name,
        isLeaf: true,
        formFields: mockData.catalogue_item_properties ?? null,
        selectedCatalogueCategory: mockData,
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
      mockData = {
        ...mockData,
        id: '4',
      };

      props = {
        ...props,
        catalogueCategoryName: 'test',
        selectedCatalogueCategory: mockData,
      };
      createView();

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('updates the of a catalogue category', async () => {
      createView();

      const nameInput = screen.getByLabelText('Name *') as HTMLInputElement;
      user.type(nameInput, 'test_2');
      await waitFor(() => {
        expect(screen.getByDisplayValue('test_2')).toBeInTheDocument();
      });

      expect(onChangeCatalogueCategoryName).toHaveBeenCalledWith('test_2');
    });

    it('edits a new catalogue category at sub level ("/catalogue/*")', async () => {
      props = {
        ...props,
        parentId: '1',
        catalogueCategoryName: 'test',
      };

      createView();

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('displays an error message when the type or name field are not filled', async () => {
      props = {
        ...props,
        isLeaf: true,
        catalogueCategoryName: 'test',
        formFields: [
          { name: '', type: 'number', unit: 'mm', mandatory: true },
          { name: 'radius', type: '', unit: 'mm', mandatory: true },
          { name: '', type: '', unit: 'mm', mandatory: true },
        ],
      };
      createView();

      const nameInput = screen.getByLabelText('Name *');
      user.type(nameInput, 'test');
      await waitFor(() => {
        expect(screen.getByDisplayValue('test')).toBeInTheDocument();
      });
      expect(screen.getByText('Catalogue Item Fields')).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);

      const nameHelperTexts = screen.queryAllByText('Select Type is required');
      const typeHelperTexts = screen.queryAllByText(
        'Property Name is required'
      );

      expect(nameHelperTexts.length).toBe(2);
      expect(typeHelperTexts.length).toBe(2);

      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
