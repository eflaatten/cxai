import React from "react";
import './styles/MobileSettingsModal.css';

const MobileSettingsModal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="mobile-settings-modal-backdrop" onClick={onClose}>
      <div className="mobile-settings-modal" onClick={e => e.stopPropagation()}>
        <button className="mobile-settings-modal-close" onClick={onClose}>&#10005;</button>
        {children}
      </div>
    </div>
  );
};

export default MobileSettingsModal;
