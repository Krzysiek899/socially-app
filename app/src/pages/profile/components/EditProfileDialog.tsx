import React, { useState, useEffect } from 'react';
import { Button } from '../../../shared/components/index.ts';
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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ displayName, bio });
  };

  return (
    <div className="my-profile__dialog-overlay">
      <div className="my-profile__dialog-surface">
       
        <h2 className="my-profile__dialog-title">{t('profile.actions.edit')}</h2>
        
        <form onSubmit={handleSubmit} className="my-profile__dialog-form">
          <div className="my-profile__dialog-input-group">
            
            <label htmlFor="displayName">{t('auth.registration.full_name')}</label>
            <input 
              id="displayName" 
              type="text" 
              className="my-profile__dialog-input"
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)} 
              required 
              minLength={2}
            />
          </div>

          <div className="my-profile__dialog-input-group">
           
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
      </div>
    </div>
  );
};