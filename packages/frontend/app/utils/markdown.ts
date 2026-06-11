import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

marked.setOptions({ breaks: true, gfm: true });

/** Render a Markdown string to sanitized HTML, safe for v-html. */
export function renderMarkdown(text: string): string {
    if (!text) return '';
    const html = marked.parse(text, { async: false }) as string;
    return DOMPurify.sanitize(html);
}
