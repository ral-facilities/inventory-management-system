import { render } from '@testing-library/react';
import PlaceholderImage from './placeholderImage.component'; // Adjust the import path as necessary

describe('PlaceholderImage Component', () => {
  it('matches the snapshot', () => {
    const { asFragment } = render(
      <PlaceholderImage maxWidth="300px" maxHeight="200px" />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
