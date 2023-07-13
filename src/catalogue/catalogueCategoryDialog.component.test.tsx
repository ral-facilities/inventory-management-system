import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CatalogueCategoryDialog, {
  CatalogueCategoryDialogProps,
} from './catalogueCategoryDialog.component';
import { renderComponentWithBrowserRouter } from '../setupTests';

describe('Catalogue Category Dialog', () => {
  const onClose = jest.fn();
  const onChangeLeaf = jest.fn();
  const onChangeCatalogueCategoryName = jest.fn();
  const refetchData = jest.fn();
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
        refetchData: refetchData,
        type: 'add',
      };
      user = userEvent.setup();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
    it('renders text correctly', async () => {
      createView();
      expect(screen.getByLabelText('Name*')).toBeInTheDocument();
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
            'A catalogue category with the same name already exists within the parent catalogue category.'
          )
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
      expect(refetchData).toHaveBeenCalled();
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
      expect(refetchData).toHaveBeenCalled();
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
      const addFieldsButton = screen.getByTestId('add-fields-button');
      expect(addFieldsButton).toBeDisabled();

      const itemsRadio = screen.getByLabelText('Catalogue Items');
      await user.click(itemsRadio);

      expect(onChangeLeaf).toHaveBeenCalledWith(true);
    });

    it('disabled define list field button when it not a leaf directory', async () => {
      props = { ...props, isLeaf: true };
      createView();
      const addFieldsButton = screen.getByTestId('add-fields-button');
      expect(addFieldsButton).not.toBeDisabled();
    });
  });

  describe('Edit Catalogue Category Dialog', () => {
    const mockData = {
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
        refetchData: refetchData,
        type: 'edit',
        selectedCatalogueCategory: mockData,
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
            'A catalogue category with the same name already exists within the parent catalogue category.'
          )
        ).toBeInTheDocument();
      });
      expect(onClose).not.toHaveBeenCalled();
    });

    it('edits a new catalogue category at root level ("/catalogue")', async () => {
      props = {
        ...props,
        catalogueCategoryName: 'test',
      };
      createView();

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      expect(onClose).toHaveBeenCalled();
      expect(refetchData).toHaveBeenCalled();
    });

    it('updates the of a catalogue category', async () => {
      createView();

      const nameInput = screen.getByLabelText('Name*') as HTMLInputElement;
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
      expect(refetchData).toHaveBeenCalled();
    });
  });
});
