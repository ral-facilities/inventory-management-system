import { RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import handleTransferState from '../handleTransferState';
import {
  getCatalogueItemById,
  getItemById,
  getSystemById,
  getSystemTypeByValue,
  renderComponentWithRouterProvider,
} from '../testUtils'
import {
  ItemCodeGenerateDialog,
  SystemCodeGenerateDialog,
} from './codeGenerateDialog.component';

vi.mock('../handleTransferState');

/** jsdom never decodes images or draws to canvases, so downloading the label is faked */
const mockRasterise = (blob: Blob | null): void => {
  vi.stubGlobal(
    'Image',
    class {
      onload: (() => void) | null = null;
      set src(_src: string) {
        this.onload?.();
      }
    }
  );
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    drawImage: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(
    (callback) => callback(blob)
  );
};

describe('Code generate dialog component', () => {
  const item = getItemById('KvT2Ox7n');
  const catalogueItem = getCatalogueItemById(item.catalogue_item_id)!;
  const system = getSystemById('65328f34a40ff5301575a4e3')!;
  const mockClose = vi.fn();

  const createItemView = (): RenderResult =>
    renderComponentWithRouterProvider(
      <ItemCodeGenerateDialog
        open={true}
        onClose={mockClose}
        item={item}
        catalogueItem={catalogueItem}
      />
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('shows the options which are enabled by default', () => {
    createItemView();

    expect(screen.getByRole('checkbox', { name: 'Show Icon' })).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: 'Show Serial Number' })
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: 'Show Asset Number' })
    ).not.toBeChecked();
    expect(
      screen.getByRole('heading', { name: 'Options' })
    ).toBeInTheDocument();
  });

  it('renders the QR code with the label lines that are switched on', () => {
    createItemView();

    expect(screen.getByRole('img', { name: 'QR code' })).toHaveTextContent(
      `Serial Number: ${item.serial_number}`
    );
    expect(screen.getByRole('img', { name: 'QR code' })).not.toHaveTextContent('Name:');
  });

  it('updates the label as lines are switched on and off', async () => {
    const user = userEvent.setup();
    createItemView();

    await user.click(screen.getByRole('checkbox', { name: 'Show Name' }));

    expect(screen.getByRole('img', { name: 'QR code' })).toHaveTextContent(`Name: ${catalogueItem.name}`);

    await user.click(
      screen.getByRole('checkbox', { name: 'Show Serial Number' })
    );

    expect(screen.getByRole('img', { name: 'QR code' })).not.toHaveTextContent('Serial Number:');
  });

  it('shows the icon in the middle of the QR code while it is switched on', async () => {
    const user = userEvent.setup();
    createItemView();

    expect(screen.getByRole('img', { name: 'QR code' }).querySelector('image')).toHaveAttribute(
      'href',
      expect.stringMatching(/^data:image\/png/)
    );

    await user.click(screen.getByRole('checkbox', { name: 'Show Icon' }));

    expect(screen.getByRole('img', { name: 'QR code' }).querySelector('image')).not.toBeInTheDocument();
  });

  it('truncates a label line too long to fit on a vertical label', () => {
    renderComponentWithRouterProvider(
      <SystemCodeGenerateDialog
        open={true}
        onClose={mockClose}
        system={{
          ...system,
          name: 'The very long name of a system which will not fit on a printed label',
        }}
      />
    );

    expect(screen.getByRole('img', { name: 'QR code' })).toHaveTextContent(/^Name: The very long name.*…$/);
    expect(screen.getByRole('img', { name: 'QR code' }).textContent!.length).toBeLessThanOrEqual(38);
  });

  it('does not truncate a long label line on a horizontal label', async () => {
    const user = userEvent.setup();
    renderComponentWithRouterProvider(
      <SystemCodeGenerateDialog
        open={true}
        onClose={mockClose}
        system={{
          ...system,
          name: 'The very long name of a system will fit on a horizontal printed label',
        }}
      />
    );

    await user.click(screen.getByRole('radio', { name: 'horizontal' }));

    expect(screen.getByRole('img', { name: 'QR code' })).toHaveTextContent(
      'The very long name of a system will fit on a horizontal printed label'
    );
  });

  it('downloads the label as an image named after the entity', async () => {
    const user = userEvent.setup();
    mockRasterise(new Blob(['image'], { type: 'image/png' }));
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});
    createItemView();

    await user.click(screen.getByRole('button', { name: 'Download' }));

    await waitFor(() => expect(clickSpy).toHaveBeenCalledTimes(1));
    const link = clickSpy.mock.contexts[0] as HTMLAnchorElement;
    expect(link.download).toBe(`qr-code-item-${item.id}.png`);
  });

  it('reports an error when the label cannot be encoded as an image', async () => {
    const user = userEvent.setup();
    mockRasterise(null);
    createItemView();

    await user.click(screen.getByRole('button', { name: 'Download' }));

    await waitFor(() =>
      expect(handleTransferState).toHaveBeenCalledWith([
        {
          name: 'QR code',
          message: expect.any(String),
          state: 'error',
        },
      ])
    );
  });

  it('closes the dialog without downloading the label', async () => {
    const user = userEvent.setup();
    createItemView();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockClose).toHaveBeenCalled();
  });

  it('generates a label for a system', async () => {
    const user = userEvent.setup();
    renderComponentWithRouterProvider(
      <SystemCodeGenerateDialog
        open={true}
        onClose={mockClose}
        system={system}
        type={getSystemTypeByValue('Storage')}
      />
    );

    await user.click(screen.getByRole('checkbox', { name: 'Show Type' }));
    await user.click(screen.getByRole('checkbox', { name: 'Show Owner' }));

    expect(screen.getByRole('img', { name: 'QR code' })).toHaveTextContent(
      `Name: ${system.name}Type: StorageOwner: ${system.owner}`
    );
  });
});
