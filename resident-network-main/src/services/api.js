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
  async list(category = 'all') {
    const query = category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
    const result = await apiRequest(`/requests${query}`);
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
};

export const chatService = {
  async listRooms() {
    const result = await apiRequest('/chat/rooms');
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

export const fileService = {
  async upload() {
    throw new Error('파일 업로드는 S3 연결 단계에서 활성화합니다.');
  },
};
