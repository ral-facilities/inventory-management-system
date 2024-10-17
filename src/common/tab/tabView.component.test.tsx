import { screen } from '@testing-library/react';

import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { renderComponentWithRouterProvider } from '../../testUtils';
import TabView, { TabViewProps } from './tabView.component'; // Adjust import based on your directory structure

describe('TabView Component', () => {
  let props: TabViewProps<'tab1' | 'tab2' | 'tab3'>;

  const createView = (path: string) => {
    return renderComponentWithRouterProvider(
      <TabView {...props} />,
      'catalogueItem',
      path
    );
  };

  beforeEach(() => {
    props = {
      defaultTab: 'tab1',
      ariaLabelPrefix: 'test',
      tabData: [
        {
          value: 'tab1',
          icon: <div>icon 1</div>,
          component: <div>Content for Tab 1</div>,
        },
        {
          value: 'tab2',
          icon: <div>icon 2</div>,
          component: <div>Content for Tab 2</div>,
        },
        {
          value: 'tab3',
          icon: <div>icon 3</div>,
          component: <div>Content for Tab 3</div>,
        },
      ],
    };
  });

  it('renders correctly', async () => {
    let baseElement;
    await act(async () => {
      baseElement = createView('/catalogue/item/1').baseElement;
    });
    expect(baseElement).toMatchSnapshot();
  });
  it('renders correctly with default tab', () => {
    createView('/catalogue/item/1');

    expect(screen.getByText('Content for Tab 1')).toBeInTheDocument();
  });

  it('changes tabs', async () => {
    const { router } = createView('/catalogue/item/1');

    // Click on the second tab
    await userEvent.click(screen.getByText('tab2'));

    expect(await screen.findByText('Content for Tab 2')).toBeInTheDocument();
    expect(router.state.location.search).toBe('?tab=tab2');

    await userEvent.click(screen.getByText('tab3'));

    expect(await screen.findByText('Content for Tab 3')).toBeInTheDocument();
    expect(router.state.location.search).toBe('?tab=tab3');

    await userEvent.click(screen.getByText('tab1'));

    expect(await screen.findByText('Content for Tab 1')).toBeInTheDocument();
    expect(router.state.location.search).toBe('');
  });

  it('load tab from url', () => {
    createView('/catalogue/item/1?tab=tab2');

    expect(screen.getByText('Content for Tab 2')).toBeInTheDocument();
  });
});
