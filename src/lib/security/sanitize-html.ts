const DISALLOWED_TAGS = new Set(['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta']);
const URL_ATTRIBUTES = new Set(['href', 'src', 'xlink:href', 'formaction']);

function stripDangerousMarkup(html: string): string {
  return html
    .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
    .replace(/<\s*(iframe|object|embed|link|meta|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/\son[a-z-]+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\s(href|src|xlink:href|formaction)\s*=\s*(['"])\s*javascript:[^'"]*\2/gi, '');
}

function sanitizeElement(element: Element): void {
  const children = Array.from(element.children);
  for (const child of children) {
    const tagName = child.tagName.toLowerCase();
    if (DISALLOWED_TAGS.has(tagName)) {
      child.remove();
      continue;
    }

    const attributes = Array.from(child.attributes);
    for (const attribute of attributes) {
      const attrName = attribute.name.toLowerCase();
      const attrValue = attribute.value.trim();
      const normalizedValue = attrValue.toLowerCase();

      if (attrName.startsWith('on')) {
        child.removeAttribute(attribute.name);
        continue;
      }

      if (attrName === 'srcdoc') {
        child.removeAttribute(attribute.name);
        continue;
      }

      if (URL_ATTRIBUTES.has(attrName) && normalizedValue.startsWith('javascript:')) {
        child.removeAttribute(attribute.name);
      }
    }

    sanitizeElement(child);
  }
}

export function sanitizeHtml(html: string): string {
  if (!html) return '';

  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return stripDangerousMarkup(html);
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(html, 'text/html');
  sanitizeElement(document.body);
  return document.body.innerHTML;
}
