import { a11yProps } from './tab.utils';

describe('tab.utils', () => {
  it('should return correct aria props for a given tab label', () => {
    const label = 'Information';
    const props = a11yProps(label);
    expect(props).toEqual({
      id: 'Information-tab',
      'aria-controls': 'Information-tabpanel',
    });
  });
});
