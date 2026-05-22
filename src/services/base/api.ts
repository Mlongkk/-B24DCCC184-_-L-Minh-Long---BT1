import axios from '@/utils/axios';
import {
	ip3,
	ipNotif,
	keycloakClientID,
	keycloakTokenEndpoint,
	keycloakUserInfoEndpoint,
	resourceServerClientId,
} from '@/utils/ip';
import queryString from 'query-string';
import type { ESettingKey } from './constant';
import type { ISetting } from './typing';

/**
 * ============================================
 * AUTH APIS - Keycloak OIDC Authentication
 * ============================================
 */

/**
 * Retrieve authenticated user information from Keycloak
 * @returns {Promise} User info response from Keycloak userinfo endpoint
 * @throws {Error} If the request fails
 */
export async function getUserInfo() {
	return axios.get(keycloakUserInfoEndpoint);
}

/**
 * Admin login with username and password
 * @param {Object} payload - Login credentials
 * @param {string} payload.username - Admin username
 * @param {string} payload.password - Admin password
 * @returns {Promise} Login response with tokens and user data
 * @throws {Error} If credentials are invalid
 */
export async function adminlogin(payload: { username?: string; password?: string }) {
	return axios.post(`${ip3}/auth/login`, { ...payload, platform: 'Web' });
}

/**
 * Refresh access token using refresh token
 * @param {Object} payload - Refresh token payload
 * @param {string} payload.refreshToken - The refresh token
 * @returns {Promise} New access token response
 * @throws {Error} If refresh token is invalid or expired
 */
export async function refreshAccessToken(payload: { refreshToken: string }) {
	const data = {
		client_id: keycloakClientID,
		grant_type: 'refresh_token',
		refresh_token: payload.refreshToken,
	};

	return axios({
		url: keycloakTokenEndpoint,
		method: 'POST',
		headers: { 'content-type': 'application/x-www-form-urlencoded' },
		data: queryString.stringify(data),
	});
}

/**
 * Get user permissions from Keycloak
 * @returns {Promise} Permissions response from Keycloak
 * @throws {Error} If the request fails
 */
export async function getPermission() {
	const data = {
		audience: resourceServerClientId,
		grant_type: 'urn:ietf:params:oauth:grant-type:uma-ticket',
		response_mode: 'permissions',
	};

	return axios({
		url: keycloakTokenEndpoint,
		method: 'POST',
		headers: { 'content-type': 'application/x-www-form-urlencoded' },
		data: queryString.stringify(data),
	});
}

/**
 * ============================================
 * NOTIFICATION APIS - OneSignal Integration
 * ============================================
 */

/**
 * Initialize OneSignal with player ID
 * @param {Object} payload - OneSignal payload
 * @param {string} payload.playerId - OneSignal player ID
 * @returns {Promise} Response from OneSignal initialization
 * @throws {Error} If initialization fails
 */
export async function initOneSignal(payload: { playerId: string }) {
	return axios.put(`${ipNotif}/one-signal/user`, payload);
}

/**
 * Delete OneSignal user/player
 * @param {Object} data - Deletion data
 * @param {string} data.playerId - OneSignal player ID to delete
 * @returns {Promise} Response from OneSignal deletion
 * @throws {Error} If deletion fails
 */
export async function deleteOneSignal(data: { playerId: string }) {
	return axios.delete(`${ipNotif}/one-signal/user`, { data });
}

/**
 * ============================================
 * SETTINGS APIS - Configuration Management
 * ============================================
 */

/**
 * Get setting value by key
 * @param {ESettingKey} key - Setting key identifier
 * @param {string} [ip] - Custom IP endpoint (defaults to ip3)
 * @returns {Promise} Setting value response
 * @throws {Error} If setting not found or request fails
 */
export async function getSettingByKey(key: ESettingKey, ip?: string) {
	return axios.get(`${ip ?? ip3}/setting/${key}/value`);
}

/**
 * Update or create setting with full object
 * @param {ISetting} data - Setting object with key and value
 * @param {string} [ip] - Custom IP endpoint (defaults to ip3)
 * @returns {Promise} Updated setting response
 * @throws {Error} If update fails
 */
export async function putSetting(data: ISetting, ip?: string) {
	return axios.put(`${ip ?? ip3}/setting/value`, data);
}

/**
 * Get single setting by key (alternative method)
 * @param {ESettingKey} key - Setting key identifier
 * @param {string} [ip] - Custom IP endpoint (defaults to ip3)
 * @returns {Promise} Setting object response
 * @throws {Error} If setting not found or request fails
 */
export async function getByKey(key: ESettingKey, ip?: string) {
	return axios.get(`${ip ?? ip3}/setting/one`, { params: { condition: { key } } });
}

/**
 * Update existing setting by ID
 * @param {string} id - Setting ID to update
 * @param {Object} payload - Update payload
 * @param {ESettingKey} payload.key - Setting key
 * @param {any} payload.value - New setting value
 * @param {string} [ip] - Custom IP endpoint (defaults to ip3)
 * @returns {Promise} Updated setting response
 * @throws {Error} If setting not found or update fails
 */
export async function updateSetting(
	id: string,
	payload: { key: ESettingKey; value: any },
	ip?: string,
) {
	return axios.put(`${ip ?? ip3}/setting/${id}`, payload);
}

/**
 * Create new setting
 * @param {Object} payload - Setting payload
 * @param {ESettingKey} payload.key - Setting key identifier
 * @param {any} payload.value - Setting value
 * @param {string} [ip] - Custom IP endpoint (defaults to ip3)
 * @returns {Promise} Created setting response
 * @throws {Error} If creation fails
 */
export async function createSetting(
	payload: { key: ESettingKey; value: any },
	ip?: string,
) {
	return axios.post(`${ip ?? ip3}/setting`, payload);
}
