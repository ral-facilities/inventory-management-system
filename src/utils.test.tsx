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

  it('should render text which overflows and is a tooltip', async () => {
    const testText =
      'This is a very very long piece of text which will overflow';

    renderComponentWithRouterProvider(
      <OverflowTip columnSize={250}>{testText}</OverflowTip>
    );

    const overFlowTip = screen.getByText(testText);

    //checks if text is overflowed
    expect(overFlowTip).toHaveStyle('overflow: hidden');

    await userEvent.hover(overFlowTip);

    await waitFor(() => {
      expect(screen.getByText(testText)).toBeInTheDocument();
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
