import { render, screen } from '@testing-library/react';
import TabPanel, { a11yProps } from './tabPanel.component';

describe('TabPanel Component', () => {
  const label = 'tab1';
  const value = 'tab1';

  it('renders correctly when value matches label', async () => {
    render(
      <TabPanel value={value} label={label}>
        <div>Tab Content</div>
      </TabPanel>
    );

    const tabPanel = await screen.findByRole('tabpanel');
    expect(tabPanel).toBeVisible();
    expect(tabPanel).toHaveTextContent('Tab Content');
  });

  it('has correct accessibility attributes', async () => {
    render(<TabPanel value={value} label={label} />);

    const tabPanel = await screen.findByRole('tabpanel');
    expect(tabPanel).toHaveAttribute('id', `${label}-tabpanel`);
    expect(tabPanel).toHaveAttribute('aria-labelledby', `${label}-tab`);
  });

  it('a11yProps function returns correct attributes', () => {
    const props = a11yProps(label);
    expect(props).toEqual({
      id: `${label}-tab`,
      'aria-controls': `${label}-tabpanel`,
    });
  });
});