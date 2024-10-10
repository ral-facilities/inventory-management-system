import { render } from '@testing-library/react';
import PlaceholderImage from './placeholderImage.component'; // Adjust the import path as necessary

describe('PlaceholderImage Component', () => {
  it('matches the snapshot', () => {
    const { asFragment } = render(<PlaceholderImage />);
    // Take a snapshot of the rendered component
    expect(asFragment()).toMatchSnapshot();
  });
});
