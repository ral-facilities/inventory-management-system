import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { MockInstance } from 'vitest';
import { imsApi } from '../../../api/api';
import { AllowedValues, CatalogueCategory } from '../../../api/api.types';
import {
  AddCatalogueCategoryPropertyWithPlacementIds,
  EditPropertyMigration,
} from '../../../app.types';
import {
  getCatalogueCategoryById,
  renderComponentWithRouterProvider,
} from '../../../testUtils';
import { transformToAddCatalogueCategoryWithPlacementIds } from '../catalogueCategoryDialog.component';
import EditPropertyMigrationDialog, {
  EditPropertyMigrationDialogProps,
} from './editPropertyMigrationDialog.component';

interface TestEditPropertyMigration
  extends Omit<EditPropertyMigration, 'allowed_values'> {
  allowed_values?: AllowedValues;
}

describe('AddPropertyMigrationDialog', () => {
  let props: EditPropertyMigrationDialogProps;
  let axiosPatchSpy: MockInstance;
  let user: UserEvent;

  const onClose = vi.fn();

  const createView = () => {
    return renderComponentWithRouterProvider(
      <EditPropertyMigrationDialog {...props} />
    );
  };

  const formattedProperties = transformToAddCatalogueCategoryWithPlacementIds(
    getCatalogueCategoryById('12') as CatalogueCategory
  ).properties as AddCatalogueCategoryPropertyWithPlacementIds[];

  beforeEach(() => {
    props = {
      open: true,
      onClose: onClose,
      catalogueCategory: getCatalogueCategoryById('12') as CatalogueCategory,
      selectedProperty: formattedProperties[0],
    };
    axiosPatchSpy = vi.spyOn(imsApi, 'patch');
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const modifyValues = async (
    formField: Partial<TestEditPropertyMigration>
  ) => {
    if (formField.name) {
      const name = screen.getByLabelText('Property Name *');
      await user.clear(name);
      await user.type(name, formField.name);
    }

    if (formField.allowed_values) {
      for (let i = 0; i < formField.allowed_values.values.length; i++) {
        await user.click(
          screen.getByRole('button', {
            name: `Add list item`,
          })
        );

        const listItem = screen
          .getAllByLabelText('List item')
          .at(-1) as HTMLElement;

        fireEvent.change(listItem, {
          target: { value: formField.allowed_values.values[i] },
        });
      }
    }
  };

  it('edits an existing property allowed values (type string)', async () => {
    props.selectedProperty = formattedProperties[2];
    createView();
    await modifyValues({
      allowed_values: { type: 'list', values: ['a'] },
    });

    await user.click(
      screen.getByRole('checkbox', {
        name: 'Confirm understanding and proceed checkbox',
      })
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

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
      allowed_values: { type: 'list', values: [600] },
    });

    await user.click(
      screen.getByRole('checkbox', {
        name: 'Confirm understanding and proceed checkbox',
      })
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

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

  it('edits an existing property allowed values and name (type string)', async () => {
    props.selectedProperty = formattedProperties[2];
    createView();
    await modifyValues({
      name: 'test',
      allowed_values: { type: 'list', values: ['a'] },
    });

    await user.click(
      screen.getByRole('checkbox', {
        name: 'Confirm understanding and proceed checkbox',
      })
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(axiosPatchSpy).toHaveBeenCalledWith(
      '/v1/catalogue-categories/12/properties/19',
      {
        name: 'test',
        allowed_values: {
          type: 'list',
          values: ['y', 'x', 'z', 'a'],
        },
      }
    );
  });

  it('edits an existing property allowed values and name (type number) ', async () => {
    createView();
    await modifyValues({
      name: 'test',
      allowed_values: { type: 'list', values: [600] },
    });

    await user.click(
      screen.getByRole('checkbox', {
        name: 'Confirm understanding and proceed checkbox',
      })
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(axiosPatchSpy).toHaveBeenCalledWith(
      '/v1/catalogue-categories/12/properties/17',
      {
        name: 'test',
        allowed_values: {
          type: 'list',
          values: [300, 400, 500, 600],
        },
      }
    );
  });

  it('display error message if the nothing has changed and changes the property name', async () => {
    createView();

    await user.click(
      screen.getByRole('checkbox', {
        name: 'Confirm understanding and proceed checkbox',
      })
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    const formError = screen.getByText(
      'There have been no changes made. Please change the name field value or press Close.'
    );

    expect(formError).toBeInTheDocument();

    await modifyValues({
      name: 'test',
    });

    const formError2 = screen.queryByText(
      'There have been no changes made. Please change the name field value or press Close.'
    );

    expect(formError2).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(axiosPatchSpy).toHaveBeenCalledWith(
      '/v1/catalogue-categories/12/properties/17',
      {
        name: 'test',
      }
    );
  });

  it('display error message duplicate name', async () => {
    createView();
    await modifyValues({ name: 'Axis' });

    await user.click(
      screen.getByRole('checkbox', {
        name: 'Confirm understanding and proceed checkbox',
      })
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    const nameError = screen.getByText(
      'Duplicate property name. Please change the name.'
    );

    expect(nameError).toBeInTheDocument();

    await modifyValues({
      name: 'test',
    });

    const nameError2 = screen.queryByText(
      'Duplicate property name. Please change the name.'
    );

    expect(nameError2).not.toBeInTheDocument();
  });

  it('display duplicate value error message and clears error by deleting new value', async () => {
    props.selectedProperty = formattedProperties[2];
    createView();
    await modifyValues({
      allowed_values: { type: 'list', values: ['y'] },
    });

    await user.click(
      screen.getByRole('checkbox', {
        name: 'Confirm understanding and proceed checkbox',
      })
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect((await screen.findAllByText('Duplicate value.')).length).toEqual(2);

    const deleteButton = screen.getByLabelText('Delete list item');

    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText('Duplicate value.')).not.toBeInTheDocument();
    });
  });

  it('display duplicate value error message and clears error by modifying value', async () => {
    createView();
    await modifyValues({
      allowed_values: { type: 'list', values: [500] },
    });

    await user.click(
      screen.getByRole('checkbox', {
        name: 'Confirm understanding and proceed checkbox',
      })
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect((await screen.findAllByText('Duplicate value.')).length).toEqual(2);

    const listItem = screen
      .getAllByLabelText('List item')
      .at(-1) as HTMLElement;

    await user.clear(listItem);
    await user.type(listItem, '600');

    await waitFor(() => {
      expect(screen.queryByText('Duplicate value.')).not.toBeInTheDocument();
    });
  });
});
