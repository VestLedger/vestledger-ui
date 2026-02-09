import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { AsyncStateRenderer } from './AsyncStateRenderer';

describe('AsyncStateRenderer', () => {
  it('renders empty action button and calls handler', () => {
    const onClick = vi.fn();

    render(
      <AsyncStateRenderer
        data={null}
        isLoading={false}
        error={undefined}
        emptyTitle="Empty"
        emptyAction={{ label: 'Create', onClick }}
      >
        {() => null}
      </AsyncStateRenderer>
    );

    fireEvent.click(screen.getByText('Create'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
