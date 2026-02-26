import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SafeHtml } from './SafeHtml';

describe('SafeHtml', () => {
  it('sanitizes unsafe html content', () => {
    render(<SafeHtml html={'<p onclick="alert(1)">Hello<script>alert(1)</script></p>'} />);

    const paragraph = screen.getByText('Hello');
    expect(paragraph).toBeInTheDocument();
    expect(paragraph.getAttribute('onclick')).toBeNull();
    expect(document.querySelector('script')).toBeNull();
  });
});
