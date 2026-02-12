import { act } from 'react';
import { renderComponentWithRouterProvider } from '../testUtils';
import CriticalityTooltipIcon from './criticalityTooltipIcon.component';

describe('CriticalityTooltipIcon', () => {
  it('renders correctly', async () => {
    let baseElement;
    await act(async () => {
      baseElement = renderComponentWithRouterProvider(
        <CriticalityTooltipIcon label={'test'} />
      ).baseElement;
    });
    expect(baseElement).toMatchSnapshot();
  });
});
