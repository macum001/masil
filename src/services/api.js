import { apiRequest, tokenStorage } from '@/api/httpClient';

export const authService = {
  async getCurrentUser() {
    const result = await apiRequest('/auth/me');
    return result.data;
  },
  async isAuthenticated() {
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
  async updateProfile(data) {
    const result = await apiRequest('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return result.data;
  },
  async changePassword({ currentPassword, newPassword }) {
    return apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
  async deleteAccount() {
    const result = await apiRequest('/auth/me', { method: 'DELETE' });
    tokenStorage.clear();
    return result;
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

export const requestService = {
  async list(params = {}) {
    // 문자열로 들어오면 category로 취급 (구버전 호환)
    if (typeof params === 'string') {
      params = params && params !== 'all' ? { category: params } : {};
    }
    const qs = new URLSearchParams();
    if (params.category) qs.append('category', params.category);
    if (params.post_type) qs.append('post_type', params.post_type);
    if (params.search) qs.append('search', params.search);
    if (params.status) qs.append('status', params.status);
    const query = qs.toString() ? `?${qs.toString()}` : '';
    const result = await apiRequest(`/requests${query}`);
    return result.data;
  },
  async getById(id) {
    const result = await apiRequest(`/requests/${id}`);
    return result.data;
  },
  async myPosts() {
    const result = await apiRequest('/requests/my/posts');
    return result.data;
  },
  async myHelped() {
    const result = await apiRequest('/requests/my/helped');
    return result.data;
  },
  async create(data) {
    const result = await apiRequest('/requests', {
      method: 'POST',
      body: JSON.stringify(data),
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
  async updateStatus(id, status) {
    const result = await apiRequest(`/requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return result.data;
  },
};

export const apartmentService = {
  async list(query = '') {
    const result = await apiRequest(`/apartments?query=${encodeURIComponent(query)}`);
    return result.data;
  },
  async searchKakao(query) {
    const result = await apiRequest(`/apartments/search?query=${encodeURIComponent(query)}`);
    return result.data;
  },
  async register(place) {
    const result = await apiRequest('/apartments/register', {
      method: 'POST',
      body: JSON.stringify(place),
    });
    return result.data;
  },
};

export const chatService = {
  async listRooms() {
    const result = await apiRequest('/chat/rooms');
    return result.data;
  },
  async startChat(requestId) {
    const result = await apiRequest('/chat/start', {
      method: 'POST',
      body: JSON.stringify({ request_id: requestId }),
    });
    return result.data;
  },
  async getRoom(roomId) {
    const result = await apiRequest(`/chat/rooms/${roomId}`);
    return result.data;
  },

  async getMessages(roomId) {
    const result = await apiRequest(`/chat/messages/${roomId}`);
    return result.data;
  },

  async sendMessage(roomId, message) {
    const result = await apiRequest('/chat/messages', {
      method: 'POST',
      body: JSON.stringify({
        room_id: roomId,
        message,
      }),
    });

    return result.data;
  },
};

export const userService = {
  async getStats() {
    const result = await apiRequest('/users/me/stats');
    return result.data;
  },
  async getNotifications() {
    const result = await apiRequest('/users/me/notifications');
    return result.data;
  },
  async readNotification(id) {
    return apiRequest(`/users/me/notifications/${id}/read`, { method: 'PATCH' });
  },
  async readAllNotifications() {
    return apiRequest('/users/me/notifications/read-all', { method: 'PATCH' });
  },
};

export const fileService = {
  async upload(files) {
    const token = tokenStorage.get();
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('images', f));
    const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api').replace('/api', '');
    const res = await fetch(`${base}/api/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || '업로드 실패');
    return data.imageUrls || [];
  },
};
