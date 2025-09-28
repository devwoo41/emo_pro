import React, { useState, useEffect } from 'react';
import './EmotionModal.css';

const EmotionModal = ({ isOpen, onClose, onSave, selectedDate, existingRecord }) => {
    const [selectedEmotion, setSelectedEmotion] = useState('');
    const [comment, setComment] = useState('');
    const [selectedSport, setSelectedSport] = useState(null);

    const emotions = [
        { id: 'happy', name: '행복', emoji: '😊', color: '#FFD93D' },
        { id: 'sad', name: '우울', emoji: '😢', color: '#4DABF7' },
        { id: 'angry', name: '화남', emoji: '😠', color: '#FF6B6B' },
        { id: 'lonely', name: '외로움', emoji: '😔', color: '#9775FA' },
        { id: 'excited', name: '신남', emoji: '🤗', color: '#51CF66' },
        { id: 'anxious', name: '불안', emoji: '😰', color: '#FFA8A8' },
        { id: 'calm', name: '평온', emoji: '😌', color: '#74C0FC' },
        { id: 'grateful', name: '감사', emoji: '🙏', color: '#FFB366' },
    ];

    const sportsOptions = [
        { id: 1, name: '목풀기' },
        { id: 2, name: '헬스' },
        { id: 3, name: '축구' },
        { id: 4, name: '농구' },
        { id: 5, name: '수영' },
    ];

    // 기존 기록 반영
    useEffect(() => {
        if (existingRecord) {
            setSelectedEmotion(existingRecord.emotion);
            setComment(existingRecord.comment || existingRecord.memo || '');
            setSelectedSport(existingRecord.sports || null);
        } else {
            setSelectedEmotion('');
            setComment('');
            setSelectedSport(null);
        }
    }, [existingRecord, isOpen]);

    const handleSave = () => {
        if (!selectedEmotion) {
            alert('감정을 선택해주세요.');
            return;
        }

        const record = {
            emotion: selectedEmotion,
            comment: comment.trim(),
            date: selectedDate,
            sports: selectedSport, // ✅ 운동 번호 포함
            timestamp: new Date().toISOString(),
        };

        onSave(record);
        onClose();
    };

    const handleClose = () => {
        setSelectedEmotion('');
        setComment('');
        setSelectedSport(null);
        onClose();
    };

    const formatDate = (date) => {
        if (!date) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        return date.toLocaleDateString('ko-KR', options);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{formatDate(selectedDate)}</h3>
                    <button className="close-button" onClick={handleClose}>
                        ✕
                    </button>
                </div>

                <div className="modal-body">
                    <div className="emotion-section">
                        <h4>오늘의 감정을 선택해주세요</h4>
                        <div className="emotion-grid">
                            {emotions.map((emotion) => (
                                <button
                                    key={emotion.id}
                                    className={`emotion-button ${selectedEmotion === emotion.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedEmotion(emotion.id)}
                                    style={{
                                        backgroundColor:
                                            selectedEmotion === emotion.id ? emotion.color + '40' : undefined,
                                        borderColor: selectedEmotion === emotion.id ? emotion.color : undefined,
                                    }}
                                >
                                    <span className="emotion-emoji-large">{emotion.emoji}</span>
                                    <span className="emotion-name">{emotion.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="sports-section">
                        <h4>오늘 한 운동</h4>
                        <select value={selectedSport || ''} onChange={(e) => setSelectedSport(Number(e.target.value))}>
                            <option value="">선택 안 함</option>
                            {sportsOptions.map((sport) => (
                                <option key={sport.id} value={sport.id}>
                                    {sport.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="comment-section">
                        <h4>한줄평 (선택사항)</h4>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="오늘 하루는 어땠나요? 간단한 한줄평을 남겨보세요..."
                            maxLength={200}
                            rows={4}
                        />
                        <div className="character-count">{comment.length}/200</div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="cancel-button" onClick={handleClose}>
                        취소
                    </button>
                    <button className="save-button" onClick={handleSave}>
                        저장
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmotionModal;
