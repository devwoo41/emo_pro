import React, { useState } from 'react';
import './SignUp.css';

const SignUp = ({ onSignUp, onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
    });
    const [errors, setErrors] = useState({});

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

        if (!formData.email.trim()) {
            newErrors.email = '이메일을 입력해주세요.';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = '유효한 이메일 형식이 아닙니다.';
        }

        if (!formData.password) {
            newErrors.password = '비밀번호를 입력해주세요.';
        } else if (formData.password.length < 6) {
            newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
        }

        if (!formData.password2) {
            newErrors.password2 = '비밀번호 확인을 입력해주세요.';
        } else if (formData.password !== formData.password2) {
            newErrors.password2 = '비밀번호가 일치하지 않습니다.';
        }

        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = validateForm();

        if (Object.keys(newErrors).length === 0) {
            onSignUp(formData);
        } else {
            setErrors(newErrors);
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-card">
                <h2>회원가입</h2>
                <p className="signup-subtitle">감정 캘린더에 오신 것을 환영합니다!</p>

                <form onSubmit={handleSubmit} className="signup-form">
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
                        />
                        {errors.username && <span className="error-message">{errors.username}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">이메일</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={errors.email ? 'error' : ''}
                            placeholder="이메일을 입력하세요"
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
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
                        />
                        {errors.password && <span className="error-message">{errors.password}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password2">비밀번호 확인</label>
                        <input
                            type="password"
                            id="password2"
                            name="password2"
                            value={formData.password2}
                            onChange={handleChange}
                            className={errors.password2 ? 'error' : ''}
                            placeholder="비밀번호를 다시 입력하세요"
                        />
                        {errors.password2 && <span className="error-message">{errors.password2}</span>}
                    </div>

                    <button type="submit" className="signup-button">
                        회원가입
                    </button>
                </form>

                <div className="login-link">
                    이미 계정이 있으신가요?
                    <button onClick={onSwitchToLogin} className="link-button">
                        로그인하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
