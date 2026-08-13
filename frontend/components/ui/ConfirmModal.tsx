import React from 'react';
import Modal from './Modal';
import SubmitButton from '../SubmitButton';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  impactDetails?: string[];
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  loading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  impactDetails = [],
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="confirm-modal-content">
        <p className="confirm-message">{message}</p>

        {impactDetails.length > 0 && (
          <div className="impact-warning-box">
            <strong className="impact-warning-title">Impact Warning:</strong>
            <ul className="impact-list">
              {impactDetails.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="confirm-modal-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <SubmitButton
            variant={variant === 'danger' ? 'danger-outline' : 'primary'}
            loading={loading}
            onClick={onConfirm}
            type="button"
          >
            {confirmText}
          </SubmitButton>
        </div>
      </div>
    </Modal>
  );
}
