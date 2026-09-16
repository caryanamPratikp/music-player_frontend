/**
 * AAWAZ API Service Layer
 * Centralizes all communication with the FastAPI backend.
 * Uses environment variable VITE_API_URL without hardcoding localhost.
 */

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

export function getFullMediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

export async function fetchSongs() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/songs`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status} (${response.statusText})`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch songs from API:', error);
    throw error;
  }
}

export async function fetchSongById(songId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/songs/${songId}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Song not found (status ${response.status})`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch song ${songId}:`, error);
    throw error;
  }
}

export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Search YouTube videos via backend API
 * Never talks directly to YouTube with API keys
 */
export async function searchYouTube(query, maxResults = 10, page = null) {
  try {
    const params = new URLSearchParams({
      q: query.trim(),
      max_results: maxResults.toString(),
    });
    if (page) {
      params.append('page', page);
    }

    const response = await fetch(`${API_BASE_URL}/api/youtube/search?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      let detail = 'Unable to search YouTube right now.';
      try {
        const errorJson = await response.json();
        if (errorJson.detail) {
          detail = errorJson.detail;
        }
      } catch {
        // use default message
      }

      if (response.status === 429) {
        throw new Error('YouTube search quota exceeded for today. Please try again later.');
      }
      throw new Error(detail);
    }

    return await response.json();
  } catch (error) {
    console.error('YouTube search error:', error);
    throw error;
  }
}

export { API_BASE_URL };
