import { act } from 'react';
import { renderComponentWithRouterProvider } from '../testUtils';
import AdminCard, { AdminCardProps } from './adminCard.component';

describe('AdminCard Component', () => {
  let props: AdminCardProps;

  const createView = () => {
    return renderComponentWithRouterProvider(<AdminCard {...props} />);
  };

  describe('page', () => {
    beforeEach(() => {
      props = { type: 'page', label: 'Go to Dashboard', link: '/dashboard' };
    });
    it('renders correctly with "page" type ', async () => {
      createView();

      let baseElement;
      await act(async () => {
        baseElement = createView().baseElement;
      });
      expect(baseElement).toMatchSnapshot();
    });
  });
  describe('dialog', () => {
    const onClick = vi.fn();
    beforeEach(() => {
      props = { type: 'dialog', label: 'Go to Dashboard', onClick: onClick };
    });
    it('renders correctly with "dialog" type', async () => {
      createView();

      let baseElement;
      await act(async () => {
        baseElement = createView().baseElement;
      });
      expect(baseElement).toMatchSnapshot();
    });
  });
});
