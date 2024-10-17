import { render } from '@testing-library/react';
import PlaceholderImage from './placeholderImage.component'; // Adjust the import path as necessary

describe('PlaceholderImage Component', () => {
  it('matches the snapshot', () => {
    const { asFragment } = render(<PlaceholderImage />);
    expect(asFragment()).toMatchSnapshot();
  });
});
