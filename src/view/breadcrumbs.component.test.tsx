import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import Breadcrumbs, { BreadcrumbsProps } from './breadcrumbs.component';
import { renderComponentWithBrowserRouter } from '../setupTests';

describe('Channel Breadcrumbs', () => {
  const onChangeNode = jest.fn();
  const onChangeNavigateHome = jest.fn();
  let props: BreadcrumbsProps;

  const createView = () => {
    return renderComponentWithBrowserRouter(<Breadcrumbs {...props} />);
  };
  beforeEach(() => {
    props = {
      onChangeNode: onChangeNode,
      onChangeNavigateHome: onChangeNavigateHome,
      breadcrumbsInfo: { trail: [], full_trail: true },
    };
  });

  it('should render correctly for path', () => {
    props = {
      ...props,
      breadcrumbsInfo: {
        trail: [
          ['test', '1'],
          ['path', '2'],
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
          ['test', '1'],
          ['path', '2'],
          ['test', '3'],
          ['path', '4'],
          ['test', '5'],
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
          ['test', '1'],
          ['path', '2'],
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
          ['test', '1'],
          ['path', '2'],
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
