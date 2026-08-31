import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useMovies } from '../context/MovieContext';

export const Toast = () => {
  const { toast } = useMovies();

  if (!toast) return null;

  const isError = toast.type === 'error';
  const isInfo = toast.type === 'info';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 9999,
        background: 'var(--bg-surface-elevated)',
        border: `1px solid ${isError ? '#f43f5e' : 'var(--primary)'}`,
        boxShadow: 'var(--shadow-lg)',
        backdropFilter: 'blur(16px)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        maxWidth: '420px',
        animation: 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        color: 'var(--text-primary)'
      }}
    >
      {isError ? (
        <AlertCircle size={22} color="#f43f5e" style={{ flexShrink: 0 }} />
      ) : isInfo ? (
        <Info size={22} color="#06b6d4" style={{ flexShrink: 0 }} />
      ) : (
        <CheckCircle2 size={22} color="var(--primary)" style={{ flexShrink: 0 }} />
      )}
      <span style={{ fontSize: '0.92rem', fontWeight: 500 }}>{toast.message}</span>
    </div>
  );
};
