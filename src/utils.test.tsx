import { screen, waitFor } from '@testing-library/react';
import {
  generateUniqueName,
  trimStringValues,
  generateUniqueId,
  OverflowTip,
  sortDataList,
} from './utils';
import userEvent from '@testing-library/user-event';
import { renderComponentWithRouterProvider } from './testUtils';
import { Link } from '@mui/material';

describe('Utility functions', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('generateUniqueName', () => {
    it('returns the given name if it is already unique', () => {
      const mockName = 'test';
      const result = generateUniqueName(mockName, []);

      expect(result).toEqual(mockName);
    });

    it('returns the a name appended with _copy_1 when the name already exists', () => {
      const mockName = 'test';
      const result = generateUniqueName(mockName, [mockName]);

      expect(result).toEqual(`${mockName}_copy_1`);
    });

    it('returns the a name appended with _copy_2 when the name and a copy already exist', () => {
      const mockName = 'test';
      const result = generateUniqueName(mockName, [
        mockName,
        `${mockName}_copy_1`,
      ]);

      expect(result).toEqual(`${mockName}_copy_2`);
    });

    it('returns an object with all string values trimmed correctly', () => {
      const object = {
        test_string: 'test_string    ',
        test_array: Array(['test   ', 'test', false]),
        test_object: { test_string: 'test_string   ', test_string2: 'test2' },
        test_bool: true,
        test_list: ['test_string   ', 'test_string2'],
        test_nested_object: {
          test_string: 'test_string   ',
          test_object: { test_string: 'test_string   ', test_string2: 'test2' },
        },
      };

      const result = trimStringValues(object);

      expect(result).toEqual({
        test_string: 'test_string',
        test_array: Array(['test', 'test', false]),
        test_object: { test_string: 'test_string', test_string2: 'test2' },
        test_bool: true,
        test_list: ['test_string', 'test_string2'],
        test_nested_object: {
          test_string: 'test_string',
          test_object: { test_string: 'test_string', test_string2: 'test2' },
        },
      });
    });
  });

  describe('generateUniqueId', () => {
    it('should generate unique IDs with default prefix', () => {
      const id1 = generateUniqueId();
      const id2 = generateUniqueId();
      expect(id1).not.toEqual(id2);
      expect(id1.startsWith('id')).toBe(true);
      expect(id2.startsWith('id')).toBe(true);
    });

    it('should generate unique IDs with custom prefix', () => {
      const prefix = 'user';
      const id1 = generateUniqueId(prefix);
      const id2 = generateUniqueId(prefix);
      expect(id1).not.toEqual(id2);
      expect(id1.startsWith(prefix)).toBe(true);
      expect(id2.startsWith(prefix)).toBe(true);
    });
  });

  describe('OverflowTip', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });
    it('renders children without tooltip when content does not overflow', async () => {
      renderComponentWithRouterProvider(
        <OverflowTip columnSize={200}>
          {"Some text that doesn't overflow"}
        </OverflowTip>
      );

      const overFlowTip = screen.getByText("Some text that doesn't overflow");

      expect(
        screen.getAllByText("Some text that doesn't overflow").length
      ).toBe(1);

      await userEvent.hover(overFlowTip);

      expect(
        screen.getAllByText("Some text that doesn't overflow").length
      ).toBe(1);
    });

    it('renders link without tooltip when content does not overflow', async () => {
      renderComponentWithRouterProvider(
        <OverflowTip columnSize={200}>
          <Link href="#">Some link that doesn&#39;t overflow</Link>
        </OverflowTip>
      );

      const overFlowTip = screen.getByText("Some link that doesn't overflow");

      expect(
        screen.getAllByText("Some link that doesn't overflow").length
      ).toBe(1);

      await userEvent.hover(overFlowTip);

      expect(
        screen.getAllByText("Some link that doesn't overflow").length
      ).toBe(1);
    });

    it('renders children with tooltip when content overflows', async () => {
      // Mocking scrollWidth and clientWidth to make content overflow
      const mockScrollWidth = 300;
      const mockClientWidth = 200;

      vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(
        mockScrollWidth
      );
      vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(
        mockClientWidth
      );

      renderComponentWithRouterProvider(
        <OverflowTip columnSize={200}>
          Some long text that overflows
        </OverflowTip>
      );
      const overFlowTip = screen.getByText('Some long text that overflows');

      await waitFor(() => {
        expect(
          screen.getAllByText('Some long text that overflows').length
        ).toBe(1);
      });

      await userEvent.hover(overFlowTip);

      await waitFor(() => {
        expect(
          screen.getAllByText('Some long text that overflows').length
        ).toBe(2);
      });

      await userEvent.unhover(overFlowTip);

      await waitFor(() => {
        expect(
          screen.getAllByText('Some long text that overflows').length
        ).toBe(1);
      });
    });

    it('renders link with tooltip when content overflows', async () => {
      // Mocking scrollWidth and clientWidth to make content overflow
      const mockScrollWidth = 300;
      const mockClientWidth = 200;

      vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(
        mockScrollWidth
      );
      vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(
        mockClientWidth
      );

      renderComponentWithRouterProvider(
        <OverflowTip columnSize={200}>
          <Link href="#">Some long link text that overflows</Link>
        </OverflowTip>
      );
      const overFlowTip = screen.getByText(
        'Some long link text that overflows'
      );

      await waitFor(() => {
        expect(
          screen.getAllByText('Some long link text that overflows').length
        ).toBe(1);
      });

      await userEvent.hover(overFlowTip);

      await waitFor(() => {
        expect(
          screen.getAllByText('Some long link text that overflows').length
        ).toBe(2);
      });

      await userEvent.unhover(overFlowTip);

      await waitFor(() => {
        expect(
          screen.getAllByText('Some long link text that overflows').length
        ).toBe(1);
      });
    });
  });

  it('should sort data based on given value to be sorted on', () => {
    const testList = [
      { name: 'John' },
      { name: 'Amanda' },
      { name: 'Susan' },
      { name: 'Jack' },
    ];

    const sortedList = sortDataList(testList, 'name');

    expect(sortedList).toEqual([
      { name: 'Amanda' },
      { name: 'Jack' },
      { name: 'John' },
      { name: 'Susan' },
    ]);
  });
});
