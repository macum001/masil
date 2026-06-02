import { apiRequest, tokenStorage } from '@/api/httpClient';

// ══════════════════════════════════════════════════════════════
// 인증 서비스
// ══════════════════════════════════════════════════════════════
export const authService = {
  async getCurrentUser() {
    const result = await apiRequest('/auth/me');
    return result.data;
  },
  isAuthenticated() {
    return Boolean(tokenStorage.get());
  },
  async loginViaEmailPassword(email, password) {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (result.access_token) tokenStorage.set(result.access_token);
    return result;
  },
  async register({ email, password }) {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  async verifyOtp({ email, otpCode }) {
    const result = await apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otpCode }),
    });
    if (result.access_token) tokenStorage.set(result.access_token);
    return result;
  },
  async resendOtp(email) {
    return apiRequest('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  async resetPasswordRequest(email) {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  async resetPassword({ resetToken, newPassword }) {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ resetToken, newPassword }),
    });
  },
  async changePassword({ currentPassword, newPassword }) {
    return apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
  async updateProfile(data) {
    const result = await apiRequest('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return result.data;
  },
  async deleteAccount() {
    return apiRequest('/auth/me', { method: 'DELETE' });
  },
  logout() {
    tokenStorage.clear();
  },
  setToken(token) {
    tokenStorage.set(token);
  },
  loginWithProvider() {
    throw new Error('소셜 로그인은 정식 출시 단계에서 연결합니다.');
  },
};

// ══════════════════════════════════════════════════════════════
// 요청글 서비스
// ══════════════════════════════════════════════════════════════
export const requestService = {
  /**
   * @param {Object} options - category, post_type, search, status, limit, offset
   */
  async list(options = {}) {
    const params = new URLSearchParams();
    if (options.category && options.category !== 'all') params.set('category', options.category);
    if (options.post_type && options.post_type !== 'all') params.set('post_type', options.post_type);
    if (options.search)  params.set('search', options.search);
    if (options.status)  params.set('status', options.status);
    if (options.limit)   params.set('limit', options.limit);
    if (options.offset)  params.set('offset', options.offset);
    const qs = params.toString() ? `?${params}` : '';
    const result = await apiRequest(`/requests${qs}`);
    return result.data;
  },

  async getById(id) {
    const result = await apiRequest(`/requests/${id}`);
    return result.data;
  },

  async create(data) {
    const result = await apiRequest('/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result.data;
  },

  async update(id, data) {
    const result = await apiRequest(`/requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return result.data;
  },

  async updateStatus(id, status) {
    const result = await apiRequest(`/requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return result.data;
  },

  async apply(id, message = '') {
    const result = await apiRequest(`/requests/${id}/applications`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
    return result.data;
  },

  async remove(id) {
    return apiRequest(`/requests/${id}`, { method: 'DELETE' });
  },

  // 내가 올린 글
  async myPosts() {
    const result = await apiRequest('/requests/my/posts');
    return result.data;
  },

  // 내가 도움을 준 글
  async myHelped() {
    const result = await apiRequest('/requests/my/helped');
    return result.data;
  },
};

// ══════════════════════════════════════════════════════════════
// 아파트 서비스 (주소 검색)
// ══════════════════════════════════════════════════════════════
export const apartmentService = {
  async list(keyword = '') {
    const result = await apiRequest(`/apartments?query=${encodeURIComponent(keyword)}`);
    return result.data;
  },
  async getById(id) {
    const result = await apiRequest(`/apartments/${id}`);
    return result.data;
  },
};

// ══════════════════════════════════════════════════════════════
// 채팅 서비스
// ══════════════════════════════════════════════════════════════
export const chatService = {
  async listRooms() {
    const result = await apiRequest('/chat/rooms');
    return result.data;
  },

  async getRoom(roomId) {
    const result = await apiRequest(`/chat/rooms/${roomId}`);
    return result.data;
  },

  async createRoom({ request_id, helper_id }) {
    const result = await apiRequest('/chat/rooms', {
      method: 'POST',
      body: JSON.stringify({ request_id, helper_id }),
    });
    return result.data;
  },

  async getMessages(roomId) {
    const result = await apiRequest(`/chat/messages/${roomId}`);
    return result.data;
  },

  async sendMessage(roomId, message) {
    const result = await apiRequest('/chat/messages', {
      method: 'POST',
      body: JSON.stringify({ room_id: roomId, message }),
    });
    return result.data;
  },
};

// ══════════════════════════════════════════════════════════════
// 사용자 활동 통계 서비스
// ══════════════════════════════════════════════════════════════
export const userService = {
  // 도움 준 횟수, 감사 받은 수, 매너 온도 등 통계
  async getStats() {
    const result = await apiRequest('/users/me/stats');
    return result.data;
  },

  // 알림 목록
  async getNotifications() {
    const result = await apiRequest('/users/me/notifications');
    return result.data;
  },

  // 단일 알림 읽음
  async markNotificationRead(id) {
    return apiRequest(`/users/me/notifications/${id}/read`, { method: 'PATCH' });
  },

  // 모든 알림 읽음
  async markAllNotificationsRead() {
    return apiRequest('/users/me/notifications/read-all', { method: 'PATCH' });
  },
};

// ══════════════════════════════════════════════════════════════
// 파일 업로드 서비스
// ══════════════════════════════════════════════════════════════
export const fileService = {
  /**
   * 이미지 업로드
   * @param {File[]} files
   * @returns {Promise<string[]>} imageUrls
   */
  async upload(files) {
    const formData = new FormData();
    files.forEach((f) => formData.append('images', f));

    const token = (await import('@/api/httpClient')).tokenStorage.get();
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:4000'}/api/upload`,
      {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      }
    );

    const result = await response.json();
    if (!result.success) throw new Error(result.message || '업로드 실패');
    return result.imageUrls;
  },
};
