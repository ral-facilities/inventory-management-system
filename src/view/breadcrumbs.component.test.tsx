import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import Breadcrumbs, { BreadcrumbsProps } from './breadcrumbs.component';
import { renderComponentWithBrowserRouter } from '../setupTests';

describe('Channel Breadcrumbs', () => {
  const onChangeNode = jest.fn();
  let props: BreadcrumbsProps;

  const createView = () => {
    return renderComponentWithBrowserRouter(<Breadcrumbs {...props} />);
  };
  beforeEach(() => {
    props = {
      currNode: '',
      onChangeNode: onChangeNode,
    };
  });

  it('should render correctly for path', () => {
    props = { ...props, currNode: '/test/path' };
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('should render correctly for root', () => {
    props = { ...props, currNode: '/' };
    const view = createView();

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('should call setCurrNode when link breadcrumb is clicked', async () => {
    const user = userEvent.setup();
    props = { ...props, currNode: '/test/path' };
    createView();

    await user.click(screen.getByRole('link', { name: 'test' }));
    expect(onChangeNode).toHaveBeenCalledWith('/test');
  });
});
