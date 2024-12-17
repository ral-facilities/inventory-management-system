import { Link } from '@mui/material';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MRT_ColumnDef, MRT_RowData } from 'material-react-table';
import { UsageStatus } from './api/api.types';
import { renderComponentWithRouterProvider } from './testUtils';
import {
  OverflowTip,
  areListsEqual,
  checkForDuplicates,
  customFilterFunctions,
  generateUniqueId,
  generateUniqueName,
  generateUniqueNameUsingCode,
  getInitialColumnFilterFnState,
  getNonEmptyTrimmedString,
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
      const existingCodes: string[] = [];

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
    afterEach(() => {
      vi.clearAllMocks();
    });
    it('renders children without tooltip when content does not overflow', async () => {
      renderComponentWithRouterProvider(
        <OverflowTip>{"Some text that doesn't overflow"}</OverflowTip>
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
        <OverflowTip>
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

    it('renders link with tooltip when content overflows', async () => {
      // Mocking scrollWidth and clientWidth to make content overflow
      const observeMock = vi.fn((callback) => {
        // Simulate the ResizeObserver callback with overflow
        callback([
          {
            target: {
              scrollWidth: 300,
              clientWidth: 200,
            },
            borderBoxSize: [{ inlineSize: 200 }],
          },
        ]);
      });

      // Mocking the ResizeObserver
      window.ResizeObserver = vi.fn().mockImplementation((callback) => ({
        observe: () => observeMock(callback),
        disconnect: vi.fn(),
        unobserve: vi.fn(),
      }));

      renderComponentWithRouterProvider(
        <OverflowTip>
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

    it('renders children with tooltip when content overflows', async () => {
      // Mocking scrollWidth and clientWidth to make content overflow
      const observeMock = vi.fn((callback) => {
        // Simulate the ResizeObserver callback with overflow
        callback([
          {
            target: {
              scrollWidth: 300,
              clientWidth: 200,
            },
            borderBoxSize: [{ inlineSize: 200 }],
          },
        ]);
      });

      // Mocking the ResizeObserver
      window.ResizeObserver = vi.fn().mockImplementation((callback) => ({
        observe: () => observeMock(callback),
        disconnect: vi.fn(),
        unobserve: vi.fn(),
      }));

      renderComponentWithRouterProvider(
        <OverflowTip>Some long text that overflows</OverflowTip>
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

  it('getInitialColumnFilterFnState correctly creates filterFns initial state', () => {
    const expectedResult = { created_time: 'between', value: 'fuzzy' };

    const columns: MRT_ColumnDef<UsageStatus>[] = [
      {
        header: 'Value',
        filterVariant: 'text',
        filterFn: 'fuzzy',
        enableColumnFilterModes: false,
        id: 'value',
      },
      {
        header: 'Created',
        filterVariant: 'datetime-range',
        filterFn: 'between',
        id: 'created_time',
      },
    ];

    const actualResult = getInitialColumnFilterFnState(columns);
    expect(actualResult).toEqual(expectedResult);
  });
});

describe('customFilterFunctions', () => {
  describe('arrIncludesNone', () => {
    const person: MRT_RowData = {
      name: 'Dan',
      age: 4,
      status: 'unemployed',
      getValue: (id: string) => {
        return person[id as keyof MRT_RowData]; // Return the corresponding field from the object
      },
    };
    const filterExclude: (
      row: MRT_RowData,
      id: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filterValue: any
    ) => boolean = customFilterFunctions['arrIncludesNone'];
    it('should correctly exclude record', () => {
      const result = filterExclude(person, 'status', ['unemployed']);
      expect(result).toBe(false);
    });
    it('should correctly include record', () => {
      const result = filterExclude(person, 'age', [8, 29]);
      expect(result).toBe(true);
    });
    it('should correctly exclude record, when filter value is not a list', () => {
      const result = filterExclude(person, 'status', 'unemployed');
      expect(result).toBe(false);
    });
    it('should correctly include record, when filter value is not a list', () => {
      const result = filterExclude(person, 'age', 3);
      expect(result).toBe(true);
    });
  });
});

describe('checkForDuplicates', () => {
  it('should return an empty array when there are no duplicates', () => {
    const data = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
      { id: '3', name: 'Charlie' },
    ];

    const result = checkForDuplicates({ data, idName: 'id', field: 'name' });
    expect(result).toEqual([]);
  });

  it('should return duplicate ids when there are duplicates', () => {
    const data = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
      { id: '3', name: 'Alice' },
    ];

    const result = checkForDuplicates({ data, idName: 'id', field: 'name' });
    expect(result).toEqual(['3', '1']);
  });

  it('should handle data with missing field values', () => {
    const data = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
      { id: '3' }, // Missing 'name' field
    ];

    const result = checkForDuplicates({ data, idName: 'id', field: 'name' });
    expect(result).toEqual([]);
  });

  it('should return duplicate ids correctly when multiple duplicates exist', () => {
    const data = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
      { id: '3', name: 'Alice' },
      { id: '4', name: 'Bob' },
    ];

    const result = checkForDuplicates({ data, idName: 'id', field: 'name' });
    expect(result).toEqual(['3', '1', '4', '2']);
  });
});

describe('getNonEmptyTrimmedString', () => {
  it('should return the string for non-empty strings', () => {
    expect(getNonEmptyTrimmedString('Hello')).toBe('Hello');
    expect(getNonEmptyTrimmedString('   Hello   ')).toBe('Hello');
  });

  it('should return undefined for empty strings', () => {
    expect(getNonEmptyTrimmedString('')).toBeUndefined();
    expect(getNonEmptyTrimmedString('   ')).toBeUndefined();
  });

  it('should return undefined for non-string values', () => {
    expect(getNonEmptyTrimmedString(123)).toBeUndefined();
    expect(getNonEmptyTrimmedString(null)).toBeUndefined();
    expect(getNonEmptyTrimmedString(undefined)).toBeUndefined();
    expect(getNonEmptyTrimmedString({})).toBeUndefined();
    expect(getNonEmptyTrimmedString([])).toBeUndefined();
  });
});

describe('areListsEqual', () => {
  it('returns true for identical lists', () => {
    const list1 = ['a', 'b', 'c'];
    const list2 = ['a', 'b', 'c'];
    expect(areListsEqual(list1, list2)).toBe(true);
  });

  it('returns true for identical lists with different order', () => {
    const list1 = ['c', 'b', 'a'];
    const list2 = ['a', 'b', 'c'];
    expect(areListsEqual(list1, list2)).toBe(true);
  });

  it('returns false for lists with different lengths', () => {
    const list1 = ['a', 'b'];
    const list2 = ['a', 'b', 'c'];
    expect(areListsEqual(list1, list2)).toBe(false);
  });

  it('returns false for lists with different values', () => {
    const list1 = ['a', 'b', 'c'];
    const list2 = ['a', 'b', 'd'];
    expect(areListsEqual(list1, list2)).toBe(false);
  });

  it('returns true for empty lists', () => {
    const list1: string[] = [];
    const list2: string[] = [];
    expect(areListsEqual(list1, list2)).toBe(true);
  });

  it('returns false for lists with duplicate elements in one list', () => {
    const list1 = ['a', 'b', 'b'];
    const list2 = ['a', 'b'];
    expect(areListsEqual(list1, list2)).toBe(false);
  });

  it('returns true for lists with duplicate elements in the same quantity', () => {
    const list1 = ['a', 'b', 'b'];
    const list2 = ['b', 'a', 'b'];
    expect(areListsEqual(list1, list2)).toBe(true);
  });
});
