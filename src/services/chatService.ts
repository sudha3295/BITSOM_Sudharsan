/**
 * Real Google Chat Service
 * Interacts directly with Google Chat REST API v1 using user OAuth token.
 * CRITICAL: NEVER generates fake Chat conversations.
 * If Chat API is unavailable for the current account or workspace tier,
 * returns explicit unavailable status as required by specification.
 */

export interface ChatSpace {
  name: string; // format: "spaces/XXXX"
  displayName: string;
  type: string;
  spaceType?: string;
}

export interface ChatMessage {
  name: string; // format: "spaces/XXXX/messages/YYYY"
  sender?: {
    name?: string;
    displayName?: string;
    avatarUrl?: string;
    type?: string;
  };
  createTime: string;
  text?: string;
  formattedText?: string;
}

export interface ChatServiceResponse<T> {
  data: T | null;
  unavailable: boolean;
  unavailableReason?: string;
}

export async function fetchChatSpaces(token: string): Promise<ChatServiceResponse<ChatSpace[]>> {
  try {
    const res = await fetch('https://chat.googleapis.com/v1/spaces?pageSize=20', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (res.status === 403 || res.status === 404) {
      const err = await res.json().catch(() => ({}));
      return {
        data: null,
        unavailable: true,
        unavailableReason:
          err.error?.message ||
          'Google Chat integration unavailable for this account or environment.',
      };
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        `Chat API error (${res.status}): ${
          err.error?.message || res.statusText
        }`
      );
    }

    const data = await res.json();
    return {
      data: data.spaces || [],
      unavailable: false,
    };
  } catch (err: any) {
    return {
      data: null,
      unavailable: true,
      unavailableReason:
        err.message ||
        'Google Chat integration unavailable for this account or environment.',
    };
  }
}

export async function fetchChatMessages(
  token: string,
  spaceName: string
): Promise<ChatServiceResponse<ChatMessage[]>> {
  try {
    const url = `https://chat.googleapis.com/v1/${spaceName}/messages?pageSize=25`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (res.status === 403 || res.status === 404) {
      return {
        data: null,
        unavailable: true,
        unavailableReason:
          'Google Chat integration unavailable for this account or environment.',
      };
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        `Chat API error (${res.status}): ${
          err.error?.message || res.statusText
        }`
      );
    }

    const data = await res.json();
    return {
      data: data.messages || [],
      unavailable: false,
    };
  } catch (err: any) {
    return {
      data: null,
      unavailable: true,
      unavailableReason:
        err.message ||
        'Google Chat integration unavailable for this account or environment.',
    };
  }
}

export async function sendChatMessage(
  token: string,
  spaceName: string,
  text: string
): Promise<ChatMessage> {
  const url = `https://chat.googleapis.com/v1/${spaceName}/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Failed to send Chat message (${res.status}): ${
        err.error?.message || res.statusText
      }`
    );
  }

  return res.json();
}
