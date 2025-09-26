import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin, onSwitchToSignUp }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false); // ✅ 로딩 상태

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

        // 입력 시 해당 필드의 에러 메시지 제거
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: '',
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = '사용자명을 입력해주세요.';
        }

        if (!formData.password) {
            newErrors.password = '비밀번호를 입력해주세요.';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return; // 중복 제출 방지

        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setLoading(true);
            await onLogin(formData); // 부모에서 JWT 저장/화면 전환 처리
        } catch {
            // 부모에서 에러 alert 처리함. 여기선 추가 처리 불필요.
        } finally {
            setLoading(false);
        }
    };

    // ✅ 카카오 로그인
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

                {/* 구분선 */}
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
