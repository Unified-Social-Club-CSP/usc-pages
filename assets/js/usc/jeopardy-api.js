// Club Jeopardy calls to the usc-flask backend (api/usc_jeopardy.py).
// Boards are open to everyone; saving a game needs a signed-in member, and
// writing boards needs a volunteer or staff account. Every call returns
// { ok, data, message } so pages can show the server's plain-words reason.
import { pythonURI, fetchOptions } from '../api/config.js';

const BASE = `${pythonURI}/api/usc/jeopardy`;

// Roles that can write boards (same as EDITOR_ROLES on the server).
export const EDITOR_ROLES = ['Admin', 'Teacher', 'Volunteer'];

async function call(path, method = 'GET', body) {
  try {
    const response = await fetch(`${BASE}${path}`, {
      ...fetchOptions,
      method,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const data = await response.json().catch(() => null);
    return { ok: response.ok, data, message: data?.message || '' };
  } catch (e) {
    return { ok: false, data: null, message: 'The club server is not reachable right now.' };
  }
}

export const listBoards = () => call('/boards');
export const getBoard = (id) => call(`/boards/${id}`);
export const saveBoard = (board, id) => (id ? call(`/boards/${id}`, 'PUT', board) : call('/boards', 'POST', board));
export const deleteBoard = (id) => call(`/boards/${id}`, 'DELETE');
export const saveResult = (id, teams) => call(`/boards/${id}/results`, 'POST', { teams });
export const recentResults = (id) => call(`/boards/${id}/results`);
