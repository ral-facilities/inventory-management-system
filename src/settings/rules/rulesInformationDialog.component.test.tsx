import { act } from 'react';
import { renderComponentWithRouterProvider } from '../../testUtils';
import RulesInformationDialog, {
  RulesInformationDialogProps,
} from './rulesInformationDialog.component';

describe('Rules Information dialog Component', () => {
  let props: RulesInformationDialogProps;
  const onClose = vi.fn();

  const createView = () => {
    return renderComponentWithRouterProvider(
      <RulesInformationDialog {...props} />
    );
  };
  beforeEach(() => {
    props = {
      open: true,
      onClose: onClose,
    };
  });

  it('renders dialog correctly', async () => {
    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });

    expect(baseElement).toMatchSnapshot();
  });
});
