/**
 * Real Gmail Service
 * Connects directly to Google Gmail REST API v1 using client OAuth Bearer token.
 * CRITICAL: NEVER returns mock emails. Real errors are surfaced directly.
 */

export interface GmailAttachmentMeta {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface GmailEmail {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  bodyText: string;
  attachments: GmailAttachmentMeta[];
  labels: string[];
}

// Decode base64url standard used in Gmail API
function decodeBase64Url(input: string): string {
  try {
    let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return decodeURIComponent(
      Array.prototype.map
        .call(atob(base64), (c: string) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
  } catch {
    try {
      return atob(input.replace(/-/g, '+').replace(/_/g, '/'));
    } catch {
      return '';
    }
  }
}

// Encode to base64url for sending
function encodeBase64Url(str: string): string {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  )
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function fetchGmailMessages(
  token: string,
  options: { maxResults?: number; query?: string } = {}
): Promise<{ messages: GmailEmail[]; totalEstimated?: number }> {
  const maxResults = options.maxResults || 20;
  const q = options.query ? encodeURIComponent(options.query) : '';
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}${
    q ? `&q=${q}` : ''
  }`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      `Gmail API error (${res.status}): ${
        errorBody.error?.message || res.statusText || 'Failed to list emails'
      }`
    );
  }

  const listData = await res.json();
  const messageRefs: { id: string; threadId: string }[] = listData.messages || [];

  if (messageRefs.length === 0) {
    return { messages: [], totalEstimated: 0 };
  }

  // Fetch individual message details in parallel
  const details = await Promise.all(
    messageRefs.map(async (ref) => {
      try {
        return await fetchMessageDetails(token, ref.id);
      } catch (err) {
        console.error(`Error fetching message ${ref.id}:`, err);
        return null;
      }
    })
  );

  return {
    messages: details.filter((m): m is GmailEmail => m !== null),
    totalEstimated: listData.resultSizeEstimate,
  };
}

export async function fetchMessageDetails(token: string, messageId: string): Promise<GmailEmail> {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      `Gmail API error (${res.status}): ${
        errorBody.error?.message || res.statusText || 'Failed to get message details'
      }`
    );
  }

  const data = await res.json();
  const headers = data.payload?.headers || [];

  const getHeader = (name: string) => {
    const h = headers.find((item: any) => item.name?.toLowerCase() === name.toLowerCase());
    return h ? h.value : '';
  };

  const subject = getHeader('Subject') || '(No Subject)';
  const from = getHeader('From') || 'Unknown Sender';
  const to = getHeader('To') || '';
  const date = getHeader('Date') || new Date().toISOString();

  let bodyText = '';
  const attachments: GmailAttachmentMeta[] = [];

  const parsePart = (part: any) => {
    if (part.filename && part.body && part.body.attachmentId) {
      attachments.push({
        id: part.body.attachmentId,
        filename: part.filename,
        mimeType: part.mimeType,
        size: part.body.size || 0,
      });
    }

    if (part.mimeType === 'text/plain' && part.body?.data && !bodyText) {
      bodyText = decodeBase64Url(part.body.data);
    } else if (part.mimeType === 'text/html' && part.body?.data && !bodyText) {
      const html = decodeBase64Url(part.body.data);
      // Strip tags for clean text preview
      bodyText = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }

    if (part.parts && Array.isArray(part.parts)) {
      part.parts.forEach(parsePart);
    }
  };

  if (data.payload) {
    parsePart(data.payload);
  }

  if (!bodyText && data.snippet) {
    bodyText = data.snippet;
  }

  return {
    id: data.id,
    threadId: data.threadId,
    snippet: data.snippet || '',
    subject,
    from,
    to,
    date,
    bodyText,
    attachments,
    labels: data.labelIds || [],
  };
}

export async function sendGmailMessage(
  token: string,
  to: string,
  subject: string,
  bodyText: string,
  threadId?: string
): Promise<{ id: string; threadId: string }> {
  const rawEmail = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    '',
    bodyText,
  ].join('\r\n');

  const encoded = encodeBase64Url(rawEmail);

  const payload: any = { raw: encoded };
  if (threadId) {
    payload.threadId = threadId;
  }

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      `Failed to send email (${res.status}): ${
        errorBody.error?.message || res.statusText
      }`
    );
  }

  return res.json();
}
