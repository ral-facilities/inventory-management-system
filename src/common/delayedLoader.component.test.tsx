import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DelayedLoader from './delayedLoader.component';

vi.useFakeTimers();

describe('DelayedLoader', () => {
  it('should render the loader after the specified delay', () => {
    const timeMS = 2000;

    render(
      <DelayedLoader
        timeMS={timeMS}
        isLoading={true}
        sx={{ color: 'primary' }}
      />
    );
    expect(screen.queryByRole('progressbar')).toBeNull();

    act(() => {
      vi.advanceTimersByTime(timeMS);
    });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should not render the loader if isLoading is false', () => {
    render(
      <DelayedLoader
        timeMS={2000}
        isLoading={false}
        sx={{ color: 'primary' }}
      />
    );
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('should remove the loader if isLoading changes to false before the delay', () => {
    const timeMS = 2000;
    const { rerender } = render(
      <DelayedLoader
        timeMS={timeMS}
        isLoading={true}
        sx={{ color: 'primary' }}
      />
    );
    expect(screen.queryByRole('progressbar')).toBeNull();

    rerender(
      <DelayedLoader
        timeMS={timeMS}
        isLoading={false}
        sx={{ color: 'primary' }}
      />
    );
    act(() => {
      vi.advanceTimersByTime(timeMS);
    });

    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('should remove the loader when isLoading changes to false after being displayed', () => {
    const timeMS = 2000;
    const { rerender } = render(
      <DelayedLoader
        timeMS={timeMS}
        isLoading={true}
        sx={{ color: 'primary' }}
      />
    );

    act(() => {
      vi.advanceTimersByTime(timeMS);
    });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    rerender(
      <DelayedLoader
        timeMS={timeMS}
        isLoading={false}
        sx={{ color: 'primary' }}
      />
    );
    expect(screen.queryByRole('progressbar')).toBeNull();
  });
});
