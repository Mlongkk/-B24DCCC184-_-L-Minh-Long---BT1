import axios, { AxiosInstance } from 'axios';
import { User, AuthResponse, LoginRequest, Permission_Codes } from '@/models/auth';

// Hardcode Render URL - không dùng env var vì UmiJS hash mode không inject env vars
const API_BASE = 'https://ript1307-nhom-4-kthp-backend.onrender.com/api';

interface RegisterRequest {
    username: string;
    email: string;
    fullName: string;
    phone: string;
    password: string;
}

class AuthService {
    private http: AxiosInstance;
    private storageKey = 'bva_auth_token';
    private userKey = 'bva_user_info';

    constructor() {
        this.http = axios.create({
            baseURL: API_BASE,
            timeout: 30000, // Tăng timeout từ 10s lên 30s vì Render server có thể slow
        });

        // Add token to requests
        this.http.interceptors.request.use((config) => {
            const token = localStorage.getItem(this.storageKey);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
    }

    /**
     * Keycloak OIDC Login
     */
    async keycloakLogin(code: string, state?: string): Promise<AuthResponse> {
        try {
            const response = await this.http.post('/auth/keycloak/callback', {
                code,
                state,
            });

            // Handle both token and accessToken from backend
            const backendToken = response.data.token || response.data.accessToken;
            const backendUser = response.data.user;

            // Convert backend user format to frontend format
            const user: User = {
                id: backendUser.id,
                username: backendUser.username,
                email: backendUser.email,
                fullName: backendUser.full_name || backendUser.fullName || backendUser.username,
                avatar: backendUser.avatar,
                roles: backendUser.roles ? (Array.isArray(backendUser.roles) ? backendUser.roles : [backendUser.roles]) : (backendUser.role ? [backendUser.role] : []),
                permissions: backendUser.permissions || [],
                isActive: backendUser.isActive !== undefined ? backendUser.isActive : true,
                createdAt: backendUser.createdAt || new Date().toISOString(),
                updatedAt: backendUser.updatedAt || new Date().toISOString(),
            };

            localStorage.setItem(this.storageKey, backendToken);
            localStorage.setItem(this.userKey, JSON.stringify(user));

            return {
                accessToken: backendToken,
                refreshToken: response.data.refreshToken || '',
                user,
                expiresIn: response.data.expiresIn || 3600,
            };
        } catch (error) {
            console.error('Keycloak login failed', error);
            throw error;
        }
    }

    /**
     * Traditional username/password login
     */
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        try {
            const response = await this.http.post('/auth/login', credentials);

            // Backend trả về format: { token, user: { role, full_name, ... } }
            // Frontend đợi: { accessToken, user: { roles: [], permissions: [], ... } }
            const backendToken = response.data.token || response.data.accessToken;
            const backendUser = response.data.user;

            // Convert backend user format to frontend format
            const user: User = {
                id: backendUser.id,
                username: backendUser.username,
                email: backendUser.email,
                fullName: backendUser.full_name || backendUser.fullName || backendUser.username,
                avatar: backendUser.avatar,
                roles: backendUser.roles ? (Array.isArray(backendUser.roles) ? backendUser.roles : [backendUser.roles]) : (backendUser.role ? [backendUser.role] : []),
                permissions: backendUser.permissions || [],
                isActive: backendUser.isActive !== undefined ? backendUser.isActive : true,
                createdAt: backendUser.createdAt || new Date().toISOString(),
                updatedAt: backendUser.updatedAt || new Date().toISOString(),
            };

            localStorage.setItem(this.storageKey, backendToken);
            localStorage.setItem(this.userKey, JSON.stringify(user));

            return {
                accessToken: backendToken,
                refreshToken: response.data.refreshToken || '',
                user,
                expiresIn: response.data.expiresIn || 3600,
            };
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        }
    }

    /**
     * Register new user
     * Convert frontend camelCase to backend snake_case
     */
    async register(data: RegisterRequest): Promise<AuthResponse> {
        try {
            // Convert to backend format (snake_case)
            const backendPayload = {
                username: data.username,
                email: data.email,
                password: data.password,
                full_name: data.fullName,  // Convert camelCase to snake_case
                phone: data.phone,
            };

            console.log('=== REGISTER API DEBUG ===');
            console.log('API_BASE:', API_BASE);
            console.log('Full URL:', `${API_BASE}/auth/register`);
            console.log('Frontend Payload:', JSON.stringify(data, null, 2));
            console.log('Backend Payload (converted):', JSON.stringify(backendPayload, null, 2));

            const response = await this.http.post('/auth/register', backendPayload);
            console.log('✅ Register success:', response.data);

            // Backend có thể trả về token sau register hoặc không
            // Nếu có token → auto-login user
            if (response.data.token) {
                const backendToken = response.data.token;
                const backendUser = response.data.user;

                const user: User = {
                    id: backendUser.id,
                    username: backendUser.username,
                    email: backendUser.email,
                    fullName: backendUser.full_name || backendUser.fullName || backendUser.username,
                    avatar: backendUser.avatar,
                    roles: backendUser.roles ? (Array.isArray(backendUser.roles) ? backendUser.roles : [backendUser.roles]) : (backendUser.role ? [backendUser.role] : []),
                    permissions: backendUser.permissions || [],
                    isActive: backendUser.isActive !== undefined ? backendUser.isActive : true,
                    createdAt: backendUser.createdAt || new Date().toISOString(),
                    updatedAt: backendUser.updatedAt || new Date().toISOString(),
                };

                localStorage.setItem(this.storageKey, backendToken);
                localStorage.setItem(this.userKey, JSON.stringify(user));

                return {
                    accessToken: backendToken,
                    refreshToken: response.data.refreshToken || '',
                    user,
                    expiresIn: response.data.expiresIn || 3600,
                };
            }

            // Nếu backend không trả về token → return response.data as-is
            return response.data;
        } catch (error: any) {
            console.error('❌ Register API error:');
            console.error('Status:', error?.response?.status);
            console.error('Status Text:', error?.response?.statusText);
            console.error('Error Data (raw):', error?.response?.data);
            console.error('Error Data (JSON):', JSON.stringify(error?.response?.data, null, 2));
            console.error('Error Message:', error?.message);
            console.error('Request URL:', error?.config?.url);
            console.error('Request Method:', error?.config?.method);
            console.error('Request Body:', error?.config?.data);
            throw error;
        }
    }

    /**
     * Logout
     */
    async logout(): Promise<void> {
        try {
            await this.http.post('/auth/logout');
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.userKey);
        }
    }

    /**
     * Refresh token
     */
    async refreshToken(): Promise<string> {
        try {
            const response = await this.http.post('/auth/refresh');
            const { accessToken } = response.data;
            localStorage.setItem(this.storageKey, accessToken);
            return accessToken;
        } catch (error) {
            console.error('Token refresh failed', error);
            throw error;
        }
    }

    /**
     * Get current user
     */
    getCurrentUser(): User | null {
        const userStr = localStorage.getItem(this.userKey);
        return userStr ? JSON.parse(userStr) : null;
    }

    /**
     * Get auth token
     */
    getToken(): string | null {
        return localStorage.getItem(this.storageKey);
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    /**
     * Check if user has permission
     */
    hasPermission(permissionCode: Permission_Codes): boolean {
        const user = this.getCurrentUser();
        if (!user) return false;
        return user.permissions.includes(permissionCode);
    }

    /**
     * Check if user has any of the given permissions
     */
    hasAnyPermission(permissionCodes: Permission_Codes[]): boolean {
        const user = this.getCurrentUser();
        if (!user) return false;
        return permissionCodes.some(code => user.permissions.includes(code));
    }

    /**
     * Check if user has role
     */
    hasRole(role: string): boolean {
        const user = this.getCurrentUser();
        if (!user) return false;
        return user.roles.includes(role);
    }

    /**
     * Get user permissions
     */
    getUserPermissions(): string[] {
        const user = this.getCurrentUser();
        return user?.permissions || [];
    }

    /**
     * Get user roles
     */
    getUserRoles(): string[] {
        const user = this.getCurrentUser();
        return user?.roles || [];
    }

    /**
     * Check Keycloak login URL
     */
    getKeycloakLoginUrl(redirectUri: string): string {
        const clientId = process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'benhnvienabc-client';
        const keycloakUrl = process.env.REACT_APP_KEYCLOAK_URL || 'http://localhost:8080';
        const realm = process.env.REACT_APP_KEYCLOAK_REALM || 'benhnvienabc';

        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            response_type: 'code',
            scope: 'openid profile email',
            state: this.generateState(),
        });

        return `${keycloakUrl}/auth/realms/${realm}/protocol/openid-connect/auth?${params.toString()}`;
    }

    /**
     * Generate state for OIDC
     */
    private generateState(): string {
        const state = Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('oidc_state', state);
        return state;
    }

    /**
     * Verify state from OIDC callback
     */
    verifyState(state: string): boolean {
        const savedState = sessionStorage.getItem('oidc_state');
        sessionStorage.removeItem('oidc_state');
        return savedState === state;
    }
}

export default new AuthService();
