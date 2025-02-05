import { act } from 'react';
import {
  RoutesHomeLocation,
  type RoutesHomeLocationType,
} from '../../app.types';
import { renderComponentWithRouterProvider } from '../../testUtils';
import PageNotFoundComponent, {
  type PageNotFoundComponentProps,
} from './pageNotFound.component';

describe('Page Not Found Component', () => {
  let props: PageNotFoundComponentProps;

  const createView = () => {
    return renderComponentWithRouterProvider(
      <PageNotFoundComponent {...props} />
    );
  };

  it('renders the basic 404 page', async () => {
    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });
    expect(baseElement).toMatchSnapshot();
  });

  Object.keys(RoutesHomeLocation).forEach((route) => {
    it(`renders ${route} 404 page`, async () => {
      props = { homeLocation: route as RoutesHomeLocationType };
      let baseElement;
      await act(async () => {
        baseElement = createView().baseElement;
      });
      expect(baseElement).toMatchSnapshot();
    });
  });
});
