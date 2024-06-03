import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderComponentWithRouterProvider } from './testUtils';
import {
  OverflowTip,
  generateUniqueId,
  generateUniqueName,
  generateUniqueNameUsingCode,
  getTableRowCountText,
  sortDataList,
  trimStringValues,
} from './utils';

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

  describe('generateUniqueNameUsingCode', () => {
    it('should return the original name if the code is unique', () => {
      const name = 'TestName';
      const code = 'TestCode';
      const existingCodes = ['ExistingCode1', 'ExistingCode2'];

      const result = generateUniqueNameUsingCode(name, code, existingCodes);

      expect(result).toBe(name);
    });

    it('should generate unique name and code if the code already exists', () => {
      const name = 'TestName';
      const code = 'ExistingCode';
      const existingCodes = [
        'ExistingCode',
        'ExistingCode_copy_1',
        'ExistingCode_copy_2',
      ];

      const result = generateUniqueNameUsingCode(name, code, existingCodes);

      expect(result).toBe('TestName_copy_3'); // Expected result for this scenario
    });

    it('should handle empty existingCodes array', () => {
      const name = 'TestName';
      const code = 'TestCode';
      const existingCodes = [];

      const result = generateUniqueNameUsingCode(name, code, existingCodes);

      expect(result).toBe(name);
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
  });

  describe('getTotalRowCountText', () => {
    it('returns total rows when there are no filters applied to table', () => {
      const result = getTableRowCountText(10, 10, 'Tests');

      expect(result).toEqual('Total Tests: 10');
    });

    it('returns correct text for when there are filtered rows', () => {
      const result = getTableRowCountText(5, 10, 'Tests');

      expect(result).toEqual('Returned 5 out of 10 Tests');
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
