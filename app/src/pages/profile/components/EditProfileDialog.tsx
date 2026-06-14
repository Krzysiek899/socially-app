import React, { useState, useEffect } from 'react';
import { Button, Modal, TextField } from '../../../shared/components/index.ts';
import type { UpdateProfileRequestDTO } from '../dto/profileSchemas.ts';
import { t } from '../../../i18n/index.ts'; 

interface EditProfileDialogProps {
  isOpen: boolean;
  initialData: {
    displayName: string;
    bio: string;
  };
  onClose: () => void;
  onSave: (data: UpdateProfileRequestDTO) => void;
}

export const EditProfileDialog = ({ isOpen, initialData, onClose, onSave }: EditProfileDialogProps) => {
  const [displayName, setDisplayName] = useState(initialData.displayName);
  const [bio, setBio] = useState(initialData.bio);

  useEffect(() => {
    if (isOpen) {
      setDisplayName(initialData.displayName);
      setBio(initialData.bio);
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ displayName, bio });
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={t('profile.actions.edit')}
    >
      <form onSubmit={handleSubmit} className="my-profile__dialog-form">
        <div className="my-profile__dialog-input-group">
          {/* Replaced native input with your shared TextField */}
          <TextField 
            id="displayName" 
            label={t('auth.registration.full_name')}
            value={displayName} 
            onChange={(e) => setDisplayName(e.target.value)} 
            required 
          />
        </div>

        <div className="my-profile__dialog-input-group">
          {/* Kept native textarea since a shared one doesn't exist yet */}
          <label htmlFor="bio">{t('profile.my.about')}</label>
          <textarea 
            id="bio" 
            className="my-profile__dialog-textarea"
            value={bio} 
            onChange={(e) => setBio(e.target.value)}
            maxLength={300}
          />
        </div>

        <div className="my-profile__dialog-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary">
            {t('eventManagement.manage.dialog.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};