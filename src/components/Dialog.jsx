import React, { createContext, useContext, useState, useCallback } from 'react';

const DialogContext = createContext(null);

// 어디서든 호출 가능한 전역 함수
let _toast = () => {};
let _confirm = () => Promise.resolve(false);

export function toast(message, type = 'info') {
  _toast(message, type);
}

export function confirmDialog(options) {
  return _confirm(options);
}

export function DialogProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2600);
  }, []);

  const showConfirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmState({
        title: options.title || '확인',
        message: options.message || '',
        confirmText: options.confirmText || '확인',
        cancelText: options.cancelText || '취소',
        danger: options.danger || false,
        resolve,
      });
    });
  }, []);

  _toast = showToast;
  _confirm = showConfirm;

  const handleConfirm = (result) => {
    if (confirmState) {
      confirmState.resolve(result);
      setConfirmState(null);
    }
  };

  return (
    <DialogContext.Provider value={{ showToast, showConfirm }}>
      {children}

      {/* 토스트 */}
      <div style={{
        position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px',
        width: 'calc(100% - 40px)', maxWidth: '380px', pointerEvents: 'none',
      }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            background: 'rgba(28, 32, 40, 0.96)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '14px',
            padding: '14px 18px',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', gap: '10px',
            animation: 'fadeUp 0.3s cubic-bezier(0.22,1,0.36,1)',
          }}>
            <span style={{ fontSize: '16px' }}>
              {t.type === 'success' ? '✓' : t.type === 'error' ? '⚠️' : '💬'}
            </span>
            <span style={{ flex: 1 }}>{t.message}</span>
          </div>
        ))}
      </div>

      {/* 확인 모달 */}
      {confirmState && (
        <div
          onClick={() => handleConfirm(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px', animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(145deg, hsl(222 16% 16%) 0%, hsl(222 18% 12%) 100%)',
              border: '1px solid hsl(222 12% 24%)',
              borderRadius: '22px',
              padding: '28px 24px 22px',
              width: '100%', maxWidth: '340px',
              boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
              animation: 'popUp 0.28s cubic-bezier(0.22,1,0.36,1)',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '10px', textAlign: 'center' }}>
              {confirmState.title}
            </h3>
            {confirmState.message && (
              <p style={{ fontSize: '14px', color: 'hsl(220 8% 65%)', lineHeight: 1.6, textAlign: 'center', marginBottom: '24px' }}>
                {confirmState.message}
              </p>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleConfirm(false)}
                style={{
                  flex: 1, height: '48px', borderRadius: '14px', border: 'none',
                  background: 'hsl(222 14% 22%)', color: 'hsl(220 15% 85%)',
                  fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                }}
              >
                {confirmState.cancelText}
              </button>
              <button
                onClick={() => handleConfirm(true)}
                style={{
                  flex: 1, height: '48px', borderRadius: '14px', border: 'none',
                  fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                  background: confirmState.danger
                    ? 'linear-gradient(135deg, #E5484D 0%, #D13438 100%)'
                    : 'linear-gradient(135deg, #6D8DF5 0%, #7B6EF6 100%)',
                  color: '#fff',
                  boxShadow: confirmState.danger
                    ? '0 4px 16px rgba(229,72,77,0.4)'
                    : '0 4px 16px rgba(109,141,245,0.4)',
                }}
              >
                {confirmState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popUp { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </DialogContext.Provider>
  );
}

export function useDialog() {
  return useContext(DialogContext);
}
