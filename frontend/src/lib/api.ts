const API_BASE = 'http://localhost:3001/api';

class ApiClient {
  private getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  private setToken(token: string | null) {
    if (token) {
      sessionStorage.setItem('token', token);
    } else {
      sessionStorage.removeItem('token');
    }
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'GET' });
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }

  setAuthToken(token: string) {
    this.setToken(token);
  }

  clearAuthToken() {
    this.setToken(null);
  }
}

export const api = new ApiClient();

// Auth API
export const authApi = {
  async register(email: string, password: string, fullName: string, role: string) {
    const res = await api.post<{ user: any; token: string }>('/auth/register', {
      email,
      password,
      full_name: fullName,
      role,
    });
    api.setAuthToken(res.token);
    return res;
  },

  async login(email: string, password: string) {
    const res = await api.post<{ user: any; token: string }>('/auth/login', {
      email,
      password,
    });
    api.setAuthToken(res.token);
    return res;
  },


  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors on logout
    }
    api.clearAuthToken();
  },

  async getCurrentUser() {
    return api.get<any>('/auth/me');
  },

  async updateProfile(data: { full_name?: string }) {
    return api.put<any>('/auth/me', data);
  },

  clearToken() {
    api.clearAuthToken();
  },
};


// Jobs API
export const jobsApi = {
  async getAll(params?: { search?: string; location?: string; type?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return api.get<any[]>(`/jobs?${query}`);
  },

  async getById(id: string) {
    return api.get<any>(`/jobs/${id}`);
  },

  async create(data: any) {
    return api.post<any>('/jobs', data);
  },

  async update(id: string, data: any) {
    return api.put<any>(`/jobs/${id}`, data);
  },

  async delete(id: string) {
    return api.delete(`/jobs/${id}`);
  },
};

// Internships API
export const internshipsApi = {
  async getAll(params?: { search?: string; remote_only?: boolean }) {
    const query = new URLSearchParams(params as any).toString();
    return api.get<any[]>(`/internships?${query}`);
  },

  async getById(id: string) {
    return api.get<any>(`/internships/${id}`);
  },

  async create(data: any) {
    return api.post<any>('/internships', data);
  },
};

// Profiles API
export const profilesApi = {
  async getCandidate() {
    return api.get<any>('/profiles/candidate');
  },

  async saveCandidate(data: any) {
    return api.post<any>('/profiles/candidate', data);
  },

  async getEmployee() {
    return api.get<any>('/profiles/employee');
  },

  async saveEmployee(data: any) {
    return api.post<any>('/profiles/employee', data);
  },

  // Education
  async getEducation() {
    return api.get<any[]>('/profiles/education');
  },

  async addEducation(data: any) {
    return api.post<any>('/profiles/education', data);
  },

  async updateEducation(id: string, data: any) {
    return api.put<any>(`/profiles/education/${id}`, data);
  },

  async deleteEducation(id: string) {
    return api.delete(`/profiles/education/${id}`);
  },

  // Experience
  async getExperience() {
    return api.get<any[]>('/profiles/experience');
  },

  async addExperience(data: any) {
    return api.post<any>('/profiles/experience', data);
  },

  async updateExperience(id: string, data: any) {
    return api.put<any>(`/profiles/experience/${id}`, data);
  },

  async deleteExperience(id: string) {
    return api.delete(`/profiles/experience/${id}`);
  },

  // Projects
  async getProjects() {
    return api.get<any[]>('/profiles/projects');
  },

  async addProject(data: any) {
    return api.post<any>('/profiles/projects', data);
  },

  async updateProject(id: string, data: any) {
    return api.put<any>(`/profiles/projects/${id}`, data);
  },

  async deleteProject(id: string) {
    return api.delete(`/profiles/projects/${id}`);
  },

  // Certifications
  async getCertifications() {
    return api.get<any[]>('/profiles/certifications');
  },

  async addCertification(data: any) {
    return api.post<any>('/profiles/certifications', data);
  },

  async deleteCertification(id: string) {
    return api.delete(`/profiles/certifications/${id}`);
  },
};

// Referrals API
export const referralsApi = {
  async getAll() {
    return api.get<any[]>('/referrals');
  },

  async create(data: any) {
    return api.post<any>('/referrals', data);
  },

  async updateStatus(id: string, status: string) {
    return api.put<any>(`/referrals/${id}`, { status });
  },

  async getEmployees(params?: { search?: string }) {
    const query = params?.search ? `?search=${params.search}` : '';
    return api.get<any[]>(`/referrals/employees${query}`);
  },
};

// Assessments API
export const assessmentsApi = {
  async getAll() {
    return api.get<any[]>('/assessments');
  },

  async getById(id: string) {
    return api.get<any>(`/assessments/${id}`);
  },

  async create(data: any) {
    return api.post<any>('/assessments', data);
  },

  async complete(id: string, data: any) {
    return api.put<any>(`/assessments/${id}/complete`, data);
  },
};

// Interviews API
export const interviewsApi = {
  async getAll() {
    return api.get<any[]>('/interviews');
  },

  async create(data: any) {
    return api.post<any>('/interviews', data);
  },

  async complete(id: string, data: any) {
    return api.put<any>(`/interviews/${id}/complete`, data);
  },
};

// Resume API
export const resumeApi = {
  async getAll() {
    return api.get<any[]>('/resume');
  },

  async create(data: any) {
    return api.post<any>('/resume', data);
  },
};

// Community API
export const communityApi = {
  async getAll(params?: { category?: string; search?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return api.get<any[]>(`/community?${query}`);
  },

  async getById(id: string) {
    return api.get<any>(`/community/${id}`);
  },

  async create(data: any) {
    return api.post<any>('/community', data);
  },

  async like(id: string) {
    return api.post<{ upvotes: number }>(`/community/${id}/like`);
  },

  async getReplies(postId: string) {
    return api.get<any[]>(`/community/${postId}/replies`);
  },

  async addReply(postId: string, content: string) {
    return api.post<any>(`/community/${postId}/replies`, { content });
  },
};

// Badges API
export const badgesApi = {
  async getAll() {
    return api.get<any[]>('/badges');
  },

  async earn(badgeType: string) {
    return api.post<any>('/badges', { badge_type: badgeType });
  },
};


// Analytics API
export const analyticsApi = {
  async getStats() {
    return api.get<{
      totals: { users: number; jobs: number; referrals: number; companies: number };
      usersByRole: { candidates: number; employees: number; recruiters: number; students: number };
      referralStatuses: Record<string, number>;
      recentActivity: { newUsersWeek: number; newReferralsWeek: number };
      topCompanies: Array<{ name: string; referral_count: number }>;
      monthlyGrowth: Array<{ month: string; users: number }>;
    }>('/analytics/stats');
  },

  async getPublicStats() {
    return api.get<{ users: number; jobs: number; companies: number }>('/analytics/public');
  },
};
