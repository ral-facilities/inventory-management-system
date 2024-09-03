import {
  getCatalogueCategoryById,
  getCatalogueItemById,
  renderComponentWithRouterProvider,
} from '../../testUtils';

import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { http } from 'msw';
import { MockInstance } from 'vitest';
import { imsApi } from '../../api/api';
import { CatalogueCategory } from '../../app.types';
import handleIMS_APIError from '../../handleIMS_APIError';
import { server } from '../../mocks/server';
import ObsoleteCatalogueItemDialog, {
  ObsoleteCatalogueItemDialogProps,
} from './obsoleteCatalogueItemDialog.component';

vi.mock('../../handleIMS_APIError');

describe('Obsolete Catalogue Item Dialog', () => {
  // Quite a few of these take more than 10 seconds on CI
  vi.setConfig({ testTimeout: 30000 });

  let props: ObsoleteCatalogueItemDialogProps;
  let user: UserEvent;
  let axiosPatchSpy: MockInstance;
  const mockOnClose = vi.fn();

  const createView = () => {
    return renderComponentWithRouterProvider(
      <ObsoleteCatalogueItemDialog {...props} />
    );
  };

  const modifyForm = async (
    alreadyObsolete: boolean,
    values: {
      is_obsolete?: boolean;
      obsolete_reason?: string;
      // Should be a list of catalogue category names followed by the name of the
      // item to select (starting from root) - when there is only one will stay in same
      // category
      replacement_item_navigation?: string[];
      // Should not click on last item? (will error if disabled)
      ignore_replacement_item?: boolean;
      // Should select items by clicking on the row itself and not checkbox
      selectUsingRow?: boolean;
    }
  ) => {
    // Ensure form is loaded
    await waitFor(() => {
      expect(
        screen.getByDisplayValue(alreadyObsolete ? 'Yes' : 'No')
      ).toBeInTheDocument();
    });

    // Yes/No drop down
    if (values.is_obsolete !== undefined) {
      await user.click(screen.getByLabelText('Is Obsolete'));
      const dropdown = screen.getByRole('listbox', {
        name: 'Is Obsolete',
      });
      await user.click(
        within(dropdown).getByRole('option', {
          name: values.is_obsolete ? 'Yes' : 'No',
        })
      );
    }

    // More steps to fill out?
    if (
      values.is_obsolete === undefined ? alreadyObsolete : values.is_obsolete
    ) {
      await user.click(screen.getByRole('button', { name: 'Next' }));

      // Obsolete reason
      if (values.obsolete_reason !== undefined) {
        fireEvent.change(screen.getByRole('textbox'), {
          target: { value: values.obsolete_reason },
        });
      }

      await user.click(screen.getByRole('button', { name: 'Next' }));

      // Item selection
      if (values.replacement_item_navigation !== undefined) {
        // Select categories
        if (values.replacement_item_navigation.length > 0) {
          if (values.replacement_item_navigation.length > 1) {
            // When there is more than one value start from root
            await user.click(
              screen.getByRole('button', {
                name: 'Navigate back to Catalogue home',
              })
            );

            for (
              let i = 0;
              i < values.replacement_item_navigation.length - 1;
              i++
            )
              await user.click(
                screen.getByRole('row', {
                  name: `${values.replacement_item_navigation[i]} row`,
                })
              );
          }
        }

        // Ensure loaded
        const replacementItemNavigation = values.replacement_item_navigation;

        if (replacementItemNavigation && replacementItemNavigation.length > 0) {
          await waitFor(
            () => {
              expect(
                screen.getAllByRole('row', {
                  name: `${
                    replacementItemNavigation[
                      replacementItemNavigation.length - 1
                    ]
                  } row`,
                }).length
              ).toBeGreaterThan(1);
            },
            { timeout: 3000 }
          );
        }
        // Select item if requested
        if (
          values.ignore_replacement_item === undefined ||
          !values.ignore_replacement_item
        ) {
          let elementToClick;
          if (values.selectUsingRow === undefined || !values.selectUsingRow) {
            elementToClick = screen.getAllByRole('row', {
              name: `${
                values.replacement_item_navigation[
                  values.replacement_item_navigation.length - 1
                ]
              } row`,
            })[0];
          } else {
            elementToClick = within(
              screen.getAllByRole('row', {
                name: `${
                  values.replacement_item_navigation[
                    values.replacement_item_navigation.length - 1
                  ]
                } row`,
              })[0]
            ).getByRole('radio');
          }
          await user.click(elementToClick);
        }
      }
    }
  };

  beforeEach(() => {
    props = {
      open: true,
      onClose: mockOnClose,
      // Should have obsolete data to test
      catalogueItem: getCatalogueItemById('89'),
      parentInfo: getCatalogueCategoryById('4') as CatalogueCategory,
    };
    user = userEvent.setup();
    axiosPatchSpy = vi.spyOn(imsApi, 'patch');

    window.Element.prototype.getBoundingClientRect = vi
      .fn()
      .mockReturnValue({ height: 100, width: 2000 });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('calls onClose when cancel is clicked', async () => {
    createView();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not close dialog on background click, or on escape key press', async () => {
    createView();

    await userEvent.click(document.body);

    expect(mockOnClose).not.toHaveBeenCalled();

    fireEvent.keyDown(screen.getByRole('dialog'), {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      charCode: 27,
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('disables finish button and shows circular progress indicator when request is pending', async () => {
    server.use(
      http.patch('/v1/catalogue-items/:id', () => {
        return new Promise(() => {});
      })
    );

    props.catalogueItem = getCatalogueItemById('1');

    createView();

    await modifyForm(false, {
      is_obsolete: true,
    });

    const finishButton = screen.getByRole('button', { name: 'Finish' });
    await user.click(finishButton);

    expect(finishButton).toBeDisabled();
    expect(await screen.findByRole('progressbar')).toBeInTheDocument();
  });

  it('renders existing data correctly (not obsolete)', async () => {
    props.catalogueItem = getCatalogueItemById('1');

    createView();

    // Steps
    await waitFor(() => {
      expect(screen.queryAllByText('Is Obsolete').length).toBe(3);
    });
    expect(screen.queryByText('Obsolete Reason')).not.toBeInTheDocument();
    expect(screen.queryByText('Obsolete Replacement')).not.toBeInTheDocument();
  });

  it('renders existing data correctly (already obsolete)', async () => {
    createView();

    await waitFor(() => {
      expect(screen.queryAllByText('Is Obsolete').length).toBe(3);
    });
    expect(screen.getByText('Obsolete Reason')).toBeInTheDocument();
    expect(screen.getByText('Obsolete Replacement')).toBeInTheDocument();

    // First step
    expect(screen.getByDisplayValue('Yes')).toBeInTheDocument();

    // Second step
    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(
      screen.getByText(props.catalogueItem?.obsolete_reason ?? '')
    ).toBeInTheDocument();

    // Third step
    await user.click(screen.getByRole('button', { name: 'Next' }));

    // Last breadcrumb
    await waitFor(() => {
      expect(screen.getByText('Energy Meters')).toBeInTheDocument();
    });

    // Expected replacement catalogue item name
    const replacementItemName = getCatalogueItemById(
      props.catalogueItem?.obsolete_replacement_catalogue_item_id ?? ''
    )?.name;

    // Wait for table to load
    await waitFor(() => {
      expect(
        screen.getAllByRole('row', {
          name: `${replacementItemName} row`,
        }).length
      ).toBeGreaterThan(1);
    });
    // Ensure item selected
    expect(
      screen
        .queryAllByRole('row', {
          name: `${replacementItemName} row`,
        })[0]
        .getAttribute('data-selected')
    ).toBe('true');
  });

  it('can navigate between steps in a non-linear order', async () => {
    createView();

    // First step
    await waitFor(() => {
      expect(screen.queryAllByText('Is Obsolete').length).toBe(3);
    });

    expect(
      screen.queryByRole('button', { name: 'Finish' })
    ).not.toBeInTheDocument();

    // Skip to third step
    await user.click(screen.getByText('Obsolete Replacement'));

    expect(screen.getByRole('button', { name: 'Finish' })).toBeInTheDocument();
  });

  it('can make an item obsolete (no details)', async () => {
    props.catalogueItem = getCatalogueItemById('1');

    createView();

    await modifyForm(false, {
      is_obsolete: true,
    });

    await user.click(screen.getByRole('button', { name: 'Finish' }));

    expect(axiosPatchSpy).toHaveBeenCalledWith(
      `/v1/catalogue-items/${props.catalogueItem?.id}`,
      { is_obsolete: true }
    );
  });

  it('can make an item obsolete (all details)', async () => {
    props.catalogueItem = getCatalogueItemById('1');

    createView();

    await modifyForm(false, {
      is_obsolete: true,
      obsolete_reason: 'Some reason',
      replacement_item_navigation: [
        'Motion',
        'Actuators',
        'Motorized Actuators',
        'Motorized Actuators 33',
      ],
    });

    await user.click(screen.getByRole('button', { name: 'Finish' }));

    expect(axiosPatchSpy).toHaveBeenCalledWith(
      `/v1/catalogue-items/${props.catalogueItem?.id}`,
      {
        is_obsolete: true,
        obsolete_reason: 'Some reason',
        obsolete_replacement_catalogue_item_id: '12',
      }
    );
  });

  it('can make an item obsolete (only using row itself to select)', async () => {
    props.catalogueItem = getCatalogueItemById('1');

    createView();

    await modifyForm(false, {
      is_obsolete: true,
      replacement_item_navigation: [
        'Motion',
        'Actuators',
        'Motorized Actuators',
        'Motorized Actuators 33',
      ],
      selectUsingRow: true,
    });

    await user.click(screen.getByRole('button', { name: 'Finish' }));

    expect(axiosPatchSpy).toHaveBeenCalledWith(
      `/v1/catalogue-items/${props.catalogueItem?.id}`,
      {
        is_obsolete: true,
        obsolete_replacement_catalogue_item_id: '12',
      }
    );
  });

  it('cannot select self as obsolete item', async () => {
    props.catalogueItem = getCatalogueItemById('6');

    createView();

    await modifyForm(false, {
      is_obsolete: true,
      replacement_item_navigation: ['Energy Meters 27'],
      ignore_replacement_item: true,
    });

    expect(
      within(
        screen.getAllByRole('row', {
          name: 'Energy Meters 27 row',
        })[0]
      ).getByRole('radio')
    ).toBeDisabled();
  });

  it('cannot select another obsolete item as obsolete item', async () => {
    props.catalogueItem = getCatalogueItemById('6');

    createView();

    await modifyForm(false, {
      is_obsolete: true,
      replacement_item_navigation: ['Energy Meters 26'],
      ignore_replacement_item: true,
    });

    expect(
      within(
        screen.getAllByRole('row', {
          name: 'Energy Meters 26 row',
        })[0]
      ).getByRole('radio')
    ).toBeDisabled();
  });

  it('can make an obsolete item not obsolete', async () => {
    createView();

    await modifyForm(true, { is_obsolete: false });

    await user.click(screen.getByRole('button', { name: 'Finish' }));

    expect(axiosPatchSpy).toHaveBeenCalledWith(
      `/v1/catalogue-items/${props.catalogueItem?.id}`,
      {
        is_obsolete: false,
        obsolete_reason: null,
        obsolete_replacement_catalogue_item_id: null,
      }
    );
  });

  it('can remove an obsolete replacement item', async () => {
    createView();

    await modifyForm(true, {
      replacement_item_navigation: ['Energy Meters 27'],
    });

    await user.click(screen.getByRole('button', { name: 'Finish' }));

    expect(axiosPatchSpy).toHaveBeenCalledWith(
      `/v1/catalogue-items/${props.catalogueItem?.id}`,
      {
        obsolete_replacement_catalogue_item_id: null,
      }
    );
  });

  it('displays error if nothing changed that disappears when the reason modified', async () => {
    createView();

    await modifyForm(true, {});

    await user.click(screen.getByRole('button', { name: 'Finish' }));

    expect(axiosPatchSpy).not.toHaveBeenCalled();

    const errorMessage =
      'Nothing changed, please edit an entry before clicking finish';
    expect(screen.getByText(errorMessage)).toBeInTheDocument();

    // Go back to the reason and modify it
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByText(errorMessage)).toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Some reason' },
    });
    expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
  });

  it('displays error if an unknown error occurs', async () => {
    createView();

    await modifyForm(true, { obsolete_reason: 'Error 500' });

    await user.click(screen.getByRole('button', { name: 'Finish' }));

    expect(handleIMS_APIError).toHaveBeenCalled();
  });

  it('can edit an obsolete replacement item having navigated using the breadcrumbs', async () => {
    props.catalogueItem = getCatalogueItemById('20');

    createView();

    // Get to end of form
    await modifyForm(true, {});

    // Navigate up a category
    await user.click(screen.getByRole('link', { name: 'Vacuum Pumps' }));

    // Select new item
    await user.click(
      screen.getByRole('row', {
        name: `Cryo Pumps row`,
      })
    );
    await waitFor(
      () => {
        expect(
          screen.getAllByRole('row', {
            name: `Cryo Pumps 36 row`,
          }).length
        ).toBeGreaterThan(1);
      },
      { timeout: 3000 }
    );
    await user.click(
      within(
        screen.getAllByRole('row', {
          name: `Cryo Pumps 36 row`,
        })[0]
      ).getByRole('radio')
    );

    await user.click(screen.getByRole('button', { name: 'Finish' }));

    expect(axiosPatchSpy).toHaveBeenCalledWith(
      `/v1/catalogue-items/${props.catalogueItem?.id}`,
      {
        obsolete_replacement_catalogue_item_id: '15',
      }
    );
  });

  it('can navigate back to root when selecting an item, but resets on close', async () => {
    createView();

    // Get to end of form
    await modifyForm(true, {});

    await waitFor(
      () => {
        expect(
          screen.getAllByRole('row', {
            name: `Energy Meters 26 row`,
          }).length
        ).toBeGreaterThan(1);
      },
      { timeout: 2000 }
    );

    // Navigate to root directory
    await user.click(
      screen.getByRole('button', {
        name: 'Navigate back to Catalogue home',
      })
    );

    await waitFor(() => {
      expect(
        screen.getByRole('row', {
          name: `Beam Characterization row`,
        })
      ).toBeInTheDocument();
    });

    // Ensure reset in close
    await user.click(
      screen.getByRole('button', {
        name: 'Cancel',
      })
    );

    // Get to end of form
    await modifyForm(true, {});

    await waitFor(() => {
      expect(
        screen.getAllByRole('row', {
          name: `Energy Meters 26 row`,
        }).length
      ).toBe(2);
    });
  });

  it('renders add button on table and can open and close dialog', async () => {
    createView();

    // Get to end of form
    await modifyForm(true, {});

    await waitFor(
      () => {
        expect(
          screen.getAllByRole('row', {
            name: `Energy Meters 26 row`,
          }).length
        ).toBeGreaterThan(1);
      },
      { timeout: 5000 }
    );

    const addButton = screen.getByRole('button', {
      name: 'Add Catalogue Item',
    });

    await user.click(addButton);

    expect(screen.getByText('Name *')).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', {
      name: 'Cancel',
    });
    await user.click(cancelButton);

    await waitFor(
      () => {
        expect(
          screen.getAllByRole('row', {
            name: `Energy Meters 26 row`,
          }).length
        ).toBeGreaterThan(1);
      },
      { timeout: 5000 }
    );
  });
});
