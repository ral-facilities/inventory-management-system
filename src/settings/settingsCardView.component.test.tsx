import { screen, waitFor } from '@testing-library/react';
import { renderComponentWithRouterProvider } from '../testUtils';
import SettingsCardView from './settingsCardView.component';

describe('SettingsCardView', () => {
  const createView = () => {
    return renderComponentWithRouterProvider(<SettingsCardView />);
  };
  it('renders settings card view correctly', async () => {
    const view = createView();

    await waitFor(() => {
      expect(screen.getByText('Units')).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });
});
