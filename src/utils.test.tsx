import { Link } from '@mui/material';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderComponentWithRouterProvider } from './testUtils';
import {
  ColumnFilterEntries,
  OverflowTip,
  checkForDuplicates,
  customFilterFunctionInterface,
  customFilterFunctions,
  getFilterMenu,
  filterVariantType,
  generateUniqueId,
  generateUniqueName,
  generateUniqueNameUsingCode,
  getCustomFilterFunctions,
  getFilterVariant,
  removeSecondsFromDate,
  showSeconds,
  sortDataList,
  trimStringValues,
} from './utils';
import { MRT_FilterOption, MRT_RowData } from 'material-react-table';

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
});

describe('Custom Filter Functions', () => {
  describe('filterExclude', () => {
    let person: MRT_RowData;
    let filterExclude: // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((row: MRT_RowData, id: string, filterValue: any) => any) | undefined;
    beforeAll(() => {
      person = {
        name: 'Dan',
        age: 4,
        status: 'unemployed',
        getValue: (id: string) => {
          return person[id as keyof MRT_RowData]; // Return the corresponding field from the object
        },
      };
      filterExclude = customFilterFunctions.find(
        (filter) => filter.Name == 'filterExclude'
      )?.FilterFunction;
    });
    it('should correctly exclude record', () => {
      const result = filterExclude
        ? filterExclude(person, 'status', ['unemployed'])
        : undefined;
      expect(result).toBe(false);
    });
    it('should correctly include record', () => {
      const result = filterExclude
        ? filterExclude(person, 'age', [8, 29])
        : undefined;
      expect(result).toBe(true);
    });
  });

  describe('filterInclude', () => {
    let person: MRT_RowData;
    let filterInclude: // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((row: MRT_RowData, id: string, filterValue: any) => any) | undefined;
    beforeAll(() => {
      person = {
        name: 'Dan',
        age: 4,
        status: 'unemployed',
        getValue: (id: string) => {
          return person[id as keyof MRT_RowData]; // Return the corresponding field from the object
        },
      };
      filterInclude = customFilterFunctions.find(
        (filter) => filter.Name == 'filterInclude'
      )?.FilterFunction;
    });
    it('should correctly exclude record', () => {
      const result = filterInclude
        ? filterInclude(person, 'name', ['Sam'])
        : undefined;
      expect(result).toBe(false);
    });
    it('should correctly include record', () => {
      const result = filterInclude
        ? filterInclude(person, 'status', ['unemployed', 'retired'])
        : undefined;
      expect(result).toBe(true);
    });
  });

  describe('equalsDate', () => {
    let person: MRT_RowData;
    let equalsDate: // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((row: MRT_RowData, id: string, filterValue: any) => any) | undefined;
    let dateOfBirth: Date;
    beforeAll(() => {
      dateOfBirth = new Date('2024-01-02T00:00:00.000Z');
      person = {
        name: 'Dan',
        age: 4,
        status: 'unemployed',
        date_of_birth: dateOfBirth,
        getValue: (id: string) => {
          return person[id as keyof MRT_RowData]; // Return the corresponding field from the object
        },
      };
      equalsDate = customFilterFunctions.find(
        (filter) => filter.Name == 'equalsDate'
      )?.FilterFunction;
    });
    it('should correctly exclude record', () => {
      const wrong_date = new Date('2024-03-02T00:00:00.000Z');
      const result = equalsDate
        ? equalsDate(person, 'date_of_birth', wrong_date)
        : undefined;
      expect(result).toBe(false);
    });
    it('should correctly include record', () => {
      const result = equalsDate
        ? equalsDate(person, 'date_of_birth', dateOfBirth)
        : undefined;
      expect(result).toBe(true);
    });
  });

  describe('betweenInclusiveDateTime', () => {
    let person: MRT_RowData;
    let betweenInclusiveDateTime: // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((row: MRT_RowData, id: string, filterValue: any) => any) | undefined;
    let dateOfBirth: Date;
    beforeAll(() => {
      dateOfBirth = new Date('2024-01-02T00:00:00.000Z');
      person = {
        name: 'Dan',
        age: 4,
        status: 'unemployed',
        date_of_birth: dateOfBirth,
        getValue: (id: string) => {
          return person[id as keyof MRT_RowData]; // Return the corresponding field from the object
        },
      };
      betweenInclusiveDateTime = customFilterFunctions.find(
        (filter) => filter.Name == 'betweenInclusiveDateTime'
      )?.FilterFunction;
    });
    it('should correctly include record with an in range upper and lower bound', () => {
      const filterValue = [new Date('2024-01-01T00:00:00.000Z'), dateOfBirth];
      const result = betweenInclusiveDateTime
        ? betweenInclusiveDateTime(person, 'date_of_birth', filterValue)
        : undefined;
      expect(result).toBe(true);
    });
    it('should correctly include record with just an upper bound', () => {
      const filterValue = ['', dateOfBirth];
      const result = betweenInclusiveDateTime
        ? betweenInclusiveDateTime(person, 'date_of_birth', filterValue)
        : undefined;
      expect(result).toBe(true);
    });
    it('should correctly include record with just a lower bound', () => {
      const filterValue = [dateOfBirth, ''];
      const result = betweenInclusiveDateTime
        ? betweenInclusiveDateTime(person, 'date_of_birth', filterValue)
        : undefined;
      expect(result).toBe(true);
    });
    it('should correctly exclude record with an out of range upper and lower bound', () => {
      const filterValue = [
        new Date('2024-01-05T00:00:00.000Z'),
        new Date('2024-01-20T00:00:00.000Z'),
      ];
      const result = betweenInclusiveDateTime
        ? betweenInclusiveDateTime(person, 'date_of_birth', filterValue)
        : undefined;
      expect(result).toBe(false);
    });
    it('should correctly exclude record with just a lower bound', () => {
      const filterValue = [new Date('2024-03-01T00:00:00.000Z'), ''];
      const result = betweenInclusiveDateTime
        ? betweenInclusiveDateTime(person, 'date_of_birth', filterValue)
        : undefined;
      expect(result).toBe(false);
    });
    it('should correctly include record with just a higher bound', () => {
      const filterValue = ['', new Date('2024-01-01T00:00:00.000Z')];
      const result = betweenInclusiveDateTime
        ? betweenInclusiveDateTime(person, 'date_of_birth', filterValue)
        : undefined;
      expect(result).toBe(false);
    });
  });

  describe('beforeInclusiveDateTime', () => {
    let person: MRT_RowData;
    let beforeInclusiveDateTime: // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((row: MRT_RowData, id: string, filterValue: any) => any) | undefined;
    let dateOfBirth: Date;
    beforeAll(() => {
      dateOfBirth = new Date('2024-01-02T00:00:00.000Z');
      person = {
        name: 'Dan',
        age: 4,
        status: 'unemployed',
        date_of_birth: dateOfBirth,
        getValue: (id: string) => {
          return person[id as keyof MRT_RowData]; // Return the corresponding field from the object
        },
      };
      beforeInclusiveDateTime = customFilterFunctions.find(
        (filter) => filter.Name == 'beforeInclusiveDateTime'
      )?.FilterFunction;
    });
    it('should correctly exclude record', () => {
      const olderDate = new Date('2024-01-01T00:00:00.000Z');
      const result = beforeInclusiveDateTime
        ? beforeInclusiveDateTime(person, 'date_of_birth', olderDate)
        : undefined;
      expect(result).toBe(false);
    });
    it('should correctly include record', () => {
      const result = beforeInclusiveDateTime
        ? beforeInclusiveDateTime(person, 'date_of_birth', dateOfBirth)
        : undefined;
      expect(result).toBe(true);
    });
  });

  describe('afterInclusiveDateTime', () => {
    let person: MRT_RowData;
    let afterInclusiveDateTime: // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((row: MRT_RowData, id: string, filterValue: any) => any) | undefined;
    let dateOfBirth: Date;
    beforeAll(() => {
      dateOfBirth = new Date('2024-01-02T00:00:00.000Z');
      person = {
        name: 'Dan',
        age: 4,
        status: 'unemployed',
        date_of_birth: dateOfBirth,
        getValue: (id: string) => {
          return person[id as keyof MRT_RowData]; // Return the corresponding field from the object
        },
      };
      afterInclusiveDateTime = customFilterFunctions.find(
        (filter) => filter.Name == 'afterInclusiveDateTime'
      )?.FilterFunction;
    });
    it('should correctly exclude record', () => {
      const recentDate = new Date('2024-05-01T00:00:00.000Z');
      const result = afterInclusiveDateTime
        ? afterInclusiveDateTime(person, 'date_of_birth', recentDate)
        : undefined;
      expect(result).toBe(false);
    });
    it('should correctly include record', () => {
      const result = afterInclusiveDateTime
        ? afterInclusiveDateTime(person, 'date_of_birth', dateOfBirth)
        : undefined;
      expect(result).toBe(true);
    });
  });
  it('should correctly format filter functions', () => {
    const testFilterFunctions: customFilterFunctionInterface[] = [
      {
        Name: 'filterExclude',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        FilterFunction(row: MRT_RowData, id: string, filterValue: any): any {
          return !filterValue.includes(row.getValue(id));
        },
        Label: 'Exclude',
        FilterVariant: 'multi-select',
      },
      {
        Name: 'filterInclude',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        FilterFunction(row: MRT_RowData, id: string, filterValue: any): any {
          return filterValue.includes(row.getValue(id));
        },
        Label: 'Include',
        FilterVariant: 'multi-select',
      },
    ];
    const expectedResult: Record<
      string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { (row: MRT_RowData, id: string, filterValue: any): any }
    > = {
      filterExclude: testFilterFunctions[0]['FilterFunction'],
      filterInclude: testFilterFunctions[1]['FilterFunction'],
    };
    expect(getCustomFilterFunctions(testFilterFunctions)).toEqual(
      expectedResult
    );
  });
  it('renders custom filters dropdown correctly', () => {
    const table = {
      setFilterValue: (value: string | undefined) => {
        return value;
      },
    };

    function onSelectFilterMode(_filterMode: MRT_FilterOption): void {}

    const selectedFilters: ColumnFilterEntries[] = [
      {
        filterName: 'between',
        filterVariant: 'date-range',
        filterLabel: 'Between',
      },
      {
        filterName: 'equals',
        filterVariant: 'datetime',
        filterLabel: 'Equals',
      },
    ];

    render(getFilterMenu({ onSelectFilterMode, selectedFilters, table }));

    const expectedLabels = selectedFilters.map((filter) => filter.filterLabel);
    const renderedLabels = expectedLabels.map((label) =>
      screen.getByText(label)
    );

    renderedLabels.forEach((label, index) => {
      expect(label.textContent).toBe(expectedLabels[index]);
    });
  });

  it('gets filter variant correctly', () => {
    const testFilterFunctions: customFilterFunctionInterface[] = [
      {
        Name: 'filterExclude',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        FilterFunction(row: MRT_RowData, id: string, filterValue: any): any {
          return !filterValue.includes(row.getValue(id));
        },
        Label: 'Exclude',
        FilterVariant: 'text',
      },
      {
        Name: 'filterInclude',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        FilterFunction(row: MRT_RowData, id: string, filterValue: any): any {
          return filterValue.includes(row.getValue(id));
        },
        Label: 'Include',
        FilterVariant: 'multi-select',
      },
    ];
    const expectedResult = 'multi-select';
    const actualResult = getFilterVariant('filterInclude', testFilterFunctions);
    expect(actualResult).toEqual(expectedResult);
  });

  it('gets filter label correctly', () => {
    const testFilterFunctions: customFilterFunctionInterface[] = [
      {
        Name: 'filterExclude',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        FilterFunction(row: MRT_RowData, id: string, filterValue: any): any {
          return !filterValue.includes(row.getValue(id));
        },
        Label: 'Exclude',
        FilterVariant: 'text',
      },
      {
        Name: 'filterInclude',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        FilterFunction(row: MRT_RowData, id: string, filterValue: any): any {
          return filterValue.includes(row.getValue(id));
        },
        Label: 'Include',
        FilterVariant: 'multi-select',
      },
    ];
    const expectedResult = 'multi-select';
    const actualResult = getFilterVariant('filterInclude', testFilterFunctions);
    expect(actualResult).toEqual(expectedResult);
  });

  it('correctly removes seconds from date', () => {
    const inputDate: string = '2024-01-02T13:10:10.000+00:00';
    const expectedResult: Date = new Date('2024-01-02T13:10:00.000+00:00');
    const actualResult: Date = removeSecondsFromDate(inputDate);
    expect(actualResult).toEqual(expectedResult);
  });

  describe('renders seconds?', () => {
    it('correctly returns true to render seconds', () => {
      const filterVariant: filterVariantType = 'datetime-range';
      const actualResult = showSeconds(filterVariant);
      const expectedResult = true;
      expect(actualResult).toEqual(expectedResult);
    });

    it('correctly returns false to render seconds', () => {
      const filterVariant: filterVariantType = 'date';
      const actualResult = showSeconds(filterVariant);
      const expectedResult = false;
      expect(actualResult).toEqual(expectedResult);
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
