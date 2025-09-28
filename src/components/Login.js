import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin, onSwitchToSignUp }) => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
        if (errors[e.target.name]) {
            setErrors((p) => ({ ...p, [e.target.name]: '' }));
        }
    };

    const validateForm = () => {
        const e = {};
        if (!formData.username.trim()) e.username = '사용자명을 입력해주세요.';
        if (!formData.password) e.password = '비밀번호를 입력해주세요.';
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        const v = validateForm();
        if (Object.keys(v).length > 0) {
            setErrors(v);
            return;
        }

        try {
            setLoading(true);
            await onLogin(formData);
        } finally {
            setLoading(false);
        }
    };

    // ✅ 카카오 로그인 시작
    // 백엔드가 authorize URL로 리다이렉트 → 카카오 → (설정된 redirect_uri) 프론트 /kakao/callback?code=...
    const handleKakaoLogin = () => {
        window.location.href = 'http://127.0.0.1:8000/users/kakao/login/';
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>로그인</h2>
                <p className="login-subtitle">감정 캘린더에 다시 오신 것을 환영합니다!</p>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">사용자명</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className={errors.username ? 'error' : ''}
                            placeholder="사용자명을 입력하세요"
                            autoComplete="username"
                            disabled={loading}
                        />
                        {errors.username && <span className="error-message">{errors.username}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">비밀번호</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={errors.password ? 'error' : ''}
                            placeholder="비밀번호를 입력하세요"
                            autoComplete="current-password"
                            disabled={loading}
                        />
                        {errors.password && <span className="error-message">{errors.password}</span>}
                    </div>

                    <button type="submit" className="login-button" disabled={loading} aria-busy={loading}>
                        {loading ? '로그인 중...' : '로그인'}
                    </button>
                </form>

                <div style={{ margin: '16px 0', textAlign: 'center', color: '#999', fontSize: 12 }}>— 또는 —</div>

                {/* ✅ 카카오 로그인 버튼 */}
                <button type="button" className="kakao-button" onClick={handleKakaoLogin} disabled={loading}>
                    카카오로 로그인
                </button>

                <div className="signup-link">
                    계정이 없으신가요?
                    <button onClick={onSwitchToSignUp} className="link-button" disabled={loading}>
                        회원가입하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
