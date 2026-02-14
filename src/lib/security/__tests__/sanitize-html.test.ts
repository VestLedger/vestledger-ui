import { describe, expect, it } from 'vitest';
import { sanitizeHtml } from '../sanitize-html';

describe('sanitizeHtml', () => {
  it('removes script tags and event handlers', () => {
    const input = '<div onclick="alert(1)">hello<script>alert(1)</script></div>';
    const sanitized = sanitizeHtml(input);

    expect(sanitized).toContain('<div>hello</div>');
    expect(sanitized).not.toContain('onclick=');
    expect(sanitized).not.toContain('<script');
  });

  it('removes javascript urls', () => {
    const input = '<a href="javascript:alert(1)">Click</a>';
    const sanitized = sanitizeHtml(input);

    expect(sanitized).toContain('<a>Click</a>');
    expect(sanitized).not.toContain('javascript:');
  });

  it('preserves safe markup', () => {
    const input = '<p><strong>Safe</strong> content</p>';
    const sanitized = sanitizeHtml(input);

    expect(sanitized).toBe('<p><strong>Safe</strong> content</p>');
  });
});
