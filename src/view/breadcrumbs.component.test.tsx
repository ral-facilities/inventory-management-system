import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderComponentWithRouterProvider } from '../testUtils';
import Breadcrumbs, { BreadcrumbsProps } from './breadcrumbs.component';

describe('Channel Breadcrumbs', () => {
  const onChangeNode = vi.fn();
  const onChangeNavigateHome = vi.fn();
  let props: BreadcrumbsProps;

  const createView = () => {
    return renderComponentWithRouterProvider(
      <Breadcrumbs {...props} />,
      undefined
    );
  };
  beforeEach(() => {
    props = {
      onChangeNode: onChangeNode,
      onChangeNavigateHome: onChangeNavigateHome,
      breadcrumbsInfo: { trail: [], full_trail: true },
      navigateHomeAriaLabel: 'navigate to catalogue home',
    };
  });

  it('should render correctly for path', () => {
    props = {
      ...props,
      breadcrumbsInfo: {
        trail: [
          ['1', 'test'],
          ['2', 'path'],
        ],
        full_trail: true,
      },
    };
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('should render correctly for path when the subtree length is longer than 5', () => {
    props = {
      ...props,
      breadcrumbsInfo: {
        trail: [
          ['1', 'test'],
          ['2', 'path'],
          ['3', 'test'],
          ['4', 'path'],
          ['5', 'test'],
        ],
        full_trail: false,
      },
    };
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('should render correctly for root', () => {
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('should call onChangeNode when link breadcrumb is clicked', async () => {
    const user = userEvent.setup();
    props = {
      ...props,
      breadcrumbsInfo: {
        trail: [
          ['1', 'test'],
          ['2', 'path'],
        ],
        full_trail: true,
      },
    };
    createView();

    await user.click(screen.getByRole('link', { name: 'test' }));
    expect(onChangeNode).toHaveBeenCalledWith('1');
  });

  it('should call onChangeNavigateHome when Home button is clicked', async () => {
    const user = userEvent.setup();
    props = {
      ...props,
      breadcrumbsInfo: {
        trail: [
          ['1', 'test'],
          ['2', 'path'],
        ],
        full_trail: true,
      },
    };
    createView();

    const homeButton = screen.getByRole('button', {
      name: 'navigate to catalogue home',
    });
    await user.click(homeButton);
    expect(onChangeNavigateHome).toHaveBeenCalled();
  });
});
