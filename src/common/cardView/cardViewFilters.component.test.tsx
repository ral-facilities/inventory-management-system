import { act, screen } from '@testing-library/react';
import { MRT_RowData, useMaterialReactTable } from 'material-react-table';
import { renderComponentWithRouterProvider } from '../../testUtils';
import CardViewFilters from './cardViewFilters.component';

const mockData: MRT_RowData[] = [
  { id: 1, name: 'Item 1', description: 'Description 1' },
  { id: 2, name: 'Item 2', description: 'Description 2' },
];

const TestComponent = () => {
  const tableInstance = useMaterialReactTable({
    data: mockData,
    columns: [
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'description',
        header: 'Description',
      },
    ],
  });
  return <CardViewFilters table={tableInstance} />;
};

describe('CardViewFilters', () => {
  const createView = () => {
    return renderComponentWithRouterProvider(<TestComponent />);
  };

  it('renders dialog correctly', async () => {
    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(baseElement).toMatchSnapshot();
  });
});
