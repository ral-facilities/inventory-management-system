import { act } from 'react';
import { renderComponentWithRouterProvider } from '../testUtils';
import CriticalityTooltipIcon from './criticalityTooltipIcon.component';

describe('CriticalityTooltipIcon', () => {
  it('renders correctly (showFlagged=true)', async () => {
    let baseElement;
    await act(async () => {
      baseElement = renderComponentWithRouterProvider(
        <CriticalityTooltipIcon showFlagged={true} label={'test'} />
      ).baseElement;
    });
    expect(baseElement).toMatchSnapshot();
  });

  it('renders correctly (showFlagged=false)', async () => {
    let baseElement;
    await act(async () => {
      baseElement = renderComponentWithRouterProvider(
        <CriticalityTooltipIcon showFlagged={false} label={'test'} />
      ).baseElement;
    });
    expect(baseElement).toMatchSnapshot();
  });

  it('renders correctly (showFlagged=null)', async () => {
    let baseElement;
    await act(async () => {
      baseElement = renderComponentWithRouterProvider(
        <CriticalityTooltipIcon showFlagged={null} label={'test'} />
      ).baseElement;
    });
    expect(baseElement).toMatchSnapshot();
  });
});
