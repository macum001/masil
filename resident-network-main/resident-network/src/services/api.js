/**
 * API Service Layer
 * 
 * All data fetching and mutations go through this layer.
 * When migrating to AWS (Lambda / ECS / RDS), only this file needs to change.
 * The rest of the app remains untouched.
 */

// Current adapter: Base44 platform
import { base44 } from '@/api/base44Client';

// ─── Auth ───────────────────────────────────────────────────
export const authService = {
  async getCurrentUser() {
    return base44.auth.me();
  },
  async isAuthenticated() {
    return base44.auth.isAuthenticated();
  },
  async logout(redirectUrl) {
    return base44.auth.logout(redirectUrl);
  },
  redirectToLogin(nextUrl) {
    return base44.auth.redirectToLogin(nextUrl);
  },
  async updateProfile(data) {
    return base44.auth.updateMe(data);
  },
};

// ─── Posts (게시글) ──────────────────────────────────────────
export const postService = {
  async list(sortBy = '-created_date', limit = 20) {
    // Future: GET /api/posts?sort=...&limit=...
    return [];
  },
  async getById(id) {
    return null;
  },
  async create(data) {
    return null;
  },
  async update(id, data) {
    return null;
  },
  async delete(id) {
    return null;
  },
};

// ─── Chat ───────────────────────────────────────────────────
export const chatService = {
  async listRooms() {
    return [];
  },
  async getMessages(roomId) {
    return [];
  },
  async sendMessage(roomId, content) {
    return null;
  },
};

// ─── File Upload ────────────────────────────────────────────
export const fileService = {
  async upload(file) {
    const result = await base44.integrations.Core.UploadFile({ file });
    return result;
  },
};