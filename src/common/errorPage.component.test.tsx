import { act } from 'react';
import { renderComponentWithRouterProvider } from '../testUtils';
import ErrorPage, { ErrorPageProps } from './errorPage.component';

describe('ErrorPage Component', () => {
  let props: ErrorPageProps;

  const createView = () => {
    return renderComponentWithRouterProvider(<ErrorPage {...props} />);
  };

  beforeEach(() => {
    props = { boldErrorText: 'Error occurred!' };
  });

  it('renders boldErrorText when provided', async () => {
    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });
    expect(baseElement).toMatchSnapshot();
  });

  it('renders errorText when provided', async () => {
    props = { boldErrorText: undefined, errorText: 'Something went wrong.' };
    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });
    expect(baseElement).toMatchSnapshot();
  });

  it('renders both boldErrorText and errorText when both are provided', async () => {
    props = {
      boldErrorText: 'Critical Error!',
      errorText: 'Please contact support.',
    };
    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });
    expect(baseElement).toMatchSnapshot();
  });
});
