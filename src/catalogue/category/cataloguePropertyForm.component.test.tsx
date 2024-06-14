import { renderComponentWithRouterProvider } from '../../testUtils';
import { screen } from '@testing-library/react';
import CataloguePropertyForm, {
  CataloguePropertyFormProps,
} from './cataloguePropertyForm.component';

describe('Catalogue Property Form', () => {
  let props: CataloguePropertyFormProps;

  const mockHandleChange = vi.fn();
  const mockHandleDeleteField = vi.fn();
  const mockHandleChangeListValues = vi.fn();
  const mockHandleAddListValue = vi.fn();
  const mockHandleDeleteListValue = vi.fn();
  const mockCatalogueItemPropertyMessage = vi.fn();
  const mockAllowedValuesListErrorMessage = vi.fn();
  const mockHasAllowedValuesList = vi.fn();

  const createView = () => {
    return renderComponentWithRouterProvider(
      <CataloguePropertyForm {...props} />
    );
  };

  beforeEach(() => {
    props = {
      type: 'normal',
      isList: false,
      catalogueItemField: {
        name: '',
        type: 'string',
        mandatory: false,
      },
      handleChange: mockHandleChange,
      handleDeleteField: mockHandleDeleteField,
      handleChangeListValues: mockHandleChangeListValues,
      handleAddListValue: mockHandleAddListValue,
      handleDeleteListValue: mockHandleDeleteListValue,
      catalogueItemPropertyMessage: mockCatalogueItemPropertyMessage,
      allowedValuesListErrorMessage: mockAllowedValuesListErrorMessage,
      hasAllowedValuesList: mockHasAllowedValuesList,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', async () => {
    props.catalogueItemField = {
      name: 'Field 5',
      type: 'string',
      unit_id: '1',
      allowed_values: {
        type: 'list',
        values: [{ av_placement_id: '1', value: 'test' }],
      },
      mandatory: true,
    };
    const { asFragment } = createView();

    expect(await screen.findByDisplayValue('megapixels')).toBeInTheDocument();

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly for list view', async () => {
    props.catalogueItemField = {
      name: 'Field 5',
      type: 'string',
      unit_id: '2',
      allowed_values: {
        type: 'list',
        values: [{ av_placement_id: '2', value: 'test' }],
      },
      mandatory: true,
    };
    props.isList = true;
    props.cip_placement_id = '1';
    const { asFragment } = createView();

    expect(await screen.findByDisplayValue('fps')).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly when disabled', async () => {
    props.catalogueItemField = {
      name: 'Field 5',
      type: 'string',
      unit_id: '3',
      allowed_values: {
        type: 'list',
        values: [{ av_placement_id: '1', value: 'test' }],
      },
      mandatory: true,
    };
    props.type = 'disabled';
    const { asFragment } = createView();
    expect(await screen.findByDisplayValue('test')).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly for list view when disabled', async () => {
    props.catalogueItemField = {
      name: 'Field 5',
      type: 'string',
      allowed_values: {
        type: 'list',
        values: [{ av_placement_id: '2', value: 'test' }],
      },
      mandatory: true,
    };
    props.isList = true;
    props.cip_placement_id = '1';
    props.type = 'disabled';
    const { asFragment } = createView();
    expect(await screen.findByDisplayValue('test')).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly for add migration', async () => {
    props.catalogueItemField = {
      name: 'Field 5',
      type: 'string',
      allowed_values: {
        type: 'list',
        values: [{ av_placement_id: '2', value: 'test' }],
      },
      mandatory: true,
    };
    props.isList = true;
    props.cip_placement_id = '1';
    props.type = 'add migration';
    const { asFragment } = createView();
    expect(await screen.findByDisplayValue('test')).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly for edit migration', async () => {
    props.catalogueItemField = {
      name: 'Field 5',
      type: 'string',
      allowed_values: {
        type: 'list',
        values: [{ av_placement_id: '2', value: 'test' }],
      },
      mandatory: true,
    };
    props.isList = true;
    props.cip_placement_id = '1';
    props.type = 'edit migration';
    const { asFragment } = createView();
    expect(await screen.findByDisplayValue('test')).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });
});
