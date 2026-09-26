/**
 * Real Google Drive Service
 * Interacts directly with Google Drive REST API v3 using user OAuth token.
 * CRITICAL: NEVER invents mock Drive files.
 */

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
  iconLink?: string;
  description?: string;
  owners?: { displayName: string; emailAddress: string }[];
}

export async function fetchDriveFiles(
  token: string,
  options: { pageSize?: number; query?: string } = {}
): Promise<{ files: DriveFileItem[]; nextPageToken?: string }> {
  const pageSize = options.pageSize || 30;
  const fields = 'nextPageToken,files(id,name,mimeType,modifiedTime,size,webViewLink,iconLink,description,owners)';
  
  let url = `https://www.googleapis.com/drive/v3/files?pageSize=${pageSize}&fields=${encodeURIComponent(
    fields
  )}`;

  if (options.query) {
    const q = `name contains '${options.query.replace(/'/g, "\\'")}' and trashed = false`;
    url += `&q=${encodeURIComponent(q)}`;
  } else {
    url += `&q=${encodeURIComponent('trashed = false')}`;
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      `Drive API error (${res.status}): ${
        errorBody.error?.message || res.statusText || 'Failed to list Drive files'
      }`
    );
  }

  const data = await res.json();
  return {
    files: data.files || [],
    nextPageToken: data.nextPageToken,
  };
}

export async function fetchDriveFileMetadata(
  token: string,
  fileId: string
): Promise<DriveFileItem> {
  const fields = 'id,name,mimeType,modifiedTime,size,webViewLink,iconLink,description,owners';
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=${encodeURIComponent(fields)}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      `Drive API error (${res.status}): ${
        errorBody.error?.message || res.statusText || 'Failed to fetch file metadata'
      }`
    );
  }

  return res.json();
}
