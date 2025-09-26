const API_BASE_URL = 'http://127.0.0.1:8000/api';
const AUTH_BASE_URL = 'http://127.0.0.1:8000/users';

// ✅ JWT 토큰 관리
const getAccessToken = () => localStorage.getItem('access');
const getRefreshToken = () => localStorage.getItem('refresh');
const setTokens = (access, refresh) => {
    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);
};
const removeTokens = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('currentUser');
};

// ✅ 공통 API 호출
const apiCall = async (url, options = {}) => {
    const token = getAccessToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // ✅ Bearer JWT 인증 헤더 추가
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    } else {
        return response.text();
    }
};

// ✅ 인증 관련 API
export const authAPI = {
    // 회원가입
    register: async (userData) => {
        const response = await fetch(`${AUTH_BASE_URL}/register/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(JSON.stringify(errorData) || '회원가입 실패');
        }

        return response.json();
    },

    // 일반 로그인 → JWT 발급
    login: async (loginData) => {
        const response = await fetch(`${AUTH_BASE_URL}/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || '로그인 실패');
        }

        const data = await response.json();

        // ✅ JWT 저장
        setTokens(data.access, data.refresh);

        return data; // { msg, user_id, access, refresh }
    },

    // 카카오 로그인 요청 (백엔드로 리다이렉트)
    kakaoLogin: async () => {
        window.location.href = `${AUTH_BASE_URL}/kakao/login/`;
    },

    // 카카오 로그인 콜백 (백엔드에서 JWT 발급)
    kakaoCallback: async (code) => {
        const response = await fetch(`${AUTH_BASE_URL}/kakao/callback/?code=${code}`);
        if (!response.ok) {
            throw new Error('카카오 로그인 실패');
        }
        const data = await response.json();
        setTokens(data.access, data.refresh);
        return data; // { msg, user_id, access, refresh }
    },

    // 로그아웃
    logout: () => {
        removeTokens();
    },
};

// ✅ 감정 기록 API
export const emotionAPI = {
    getEmotions: async () => apiCall(`${API_BASE_URL}/emotions/`),
    getEmotionByDate: async (date) => {
        const formattedDate = typeof date === 'string' ? date : date.toISOString().split('T')[0];
        return apiCall(`${API_BASE_URL}/emotions/date/${formattedDate}/`);
    },
    createEmotion: async (emotionData) =>
        apiCall(`${API_BASE_URL}/emotions/`, {
            method: 'POST',
            body: JSON.stringify(emotionData),
        }),
    saveEmotion: async (emotionData) =>
        apiCall(`${API_BASE_URL}/emotions/save/`, {
            method: 'POST',
            body: JSON.stringify(emotionData),
        }),
    updateEmotion: async (id, emotionData) =>
        apiCall(`${API_BASE_URL}/emotions/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify(emotionData),
        }),
    deleteEmotion: async (id) =>
        apiCall(`${API_BASE_URL}/emotions/${id}/`, {
            method: 'DELETE',
        }),
    getCalendarData: async (year, month) => apiCall(`${API_BASE_URL}/emotions/calendar/${year}/${month}/`),
};

// ✅ 서버 연결 테스트
export const testConnection = async () => {
    try {
        const response = await fetch(`${AUTH_BASE_URL}/`, { method: 'GET' });
        return response.status !== undefined;
    } catch (error) {
        console.error('서버 연결 테스트 실패:', error);
        return false;
    }
};

// ✅ 토큰 유틸
export const tokenUtils = {
    getAccessToken,
    getRefreshToken,
    setTokens,
    removeTokens,
    isAuthenticated: () => !!getAccessToken(),
};
