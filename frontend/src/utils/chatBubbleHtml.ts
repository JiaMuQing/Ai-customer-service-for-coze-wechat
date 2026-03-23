/**
 * Render assistant/user chat text as safe HTML: Markdown images and image-only links become <img>.
 * Other text is escaped; newlines become <br>.
 */

const PLACEHOLDER = '\uE000';
const PLACEHOLDER_END = '\uE001';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, '&#39;');
}

function safeHttpsUrl(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== 'https:') return null;
    return u.href;
  } catch {
    return null;
  }
}

/** Link text is empty [](url) or URL looks like an image (Coze / RAG often uses querystrings). */
function isLikelyImageUrl(url: string): boolean {
  const u = url.toLowerCase();
  if (/\.(png|jpe?g|gif|webp|bmp|svg)(\?|#|$)/i.test(u)) return true;
  if (u.includes('oceancloudapi.com') || u.includes('ocean-cloud-tos')) return true;
  if (u.includes('byte_rag') || u.includes('filebiztype')) return true;
  return false;
}

const RE_IMG = /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g;
const RE_LINK = /\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g;

/**
 * Convert plain text with Markdown image/link fragments to safe HTML for bubble display.
 */
export function formatChatBubbleHtml(raw: string): string {
  if (!raw) return '';

  const chunks: string[] = [];
  let s = raw;

  s = s.replace(RE_IMG, (_full, alt: string, srcRaw: string) => {
    const src = safeHttpsUrl(srcRaw);
    if (!src) {
      return escapeHtml(_full);
    }
    const idx = chunks.length;
    chunks.push(
      `<img class="chat-img" src="${escapeAttr(src)}" alt="${escapeHtml(alt)}" loading="lazy" referrerpolicy="no-referrer" />`,
    );
    return `${PLACEHOLDER}${idx}${PLACEHOLDER_END}`;
  });

  s = s.replace(RE_LINK, (full, linkText: string, srcRaw: string) => {
    const src = safeHttpsUrl(srcRaw);
    if (!src || !isLikelyImageUrl(srcRaw)) {
      return escapeHtml(full);
    }
    const idx = chunks.length;
    chunks.push(
      `<img class="chat-img" src="${escapeAttr(src)}" alt="${escapeHtml(linkText)}" loading="lazy" referrerpolicy="no-referrer" />`,
    );
    return `${PLACEHOLDER}${idx}${PLACEHOLDER_END}`;
  });

  s = escapeHtml(s);
  s = s.replace(/\r\n/g, '\n').replace(/\n/g, '<br>');
  s = s.replace(
    new RegExp(`${PLACEHOLDER}(\\d+)${PLACEHOLDER_END}`, 'g'),
    (_, i) => chunks[Number(i)] ?? '',
  );
  return s;
}
