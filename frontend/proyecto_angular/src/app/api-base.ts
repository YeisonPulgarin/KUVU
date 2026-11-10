import { isDevMode } from '@angular/core';

/**
 * Base URL of the KUVU API. In development (ng serve, Karma) the backend runs on
 * localhost:3000; the production build calls the same origin (`/api`), which the
 * hosting rewrites to the deployed backend.
 */
export const API_BASE = isDevMode() ? 'http://localhost:3000/api' : '/api';
