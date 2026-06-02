import React, { FormEvent, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, User } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks.ts';
import { Button, Card, PasswordField, TextField } from '../../components/index.ts';
import { t } from '../../i18n/index.ts';
import { register, sessionPersistencePreferenceSet } from './redux/authSlice.ts';
import { resolveReturnTo, withReturnTo } from './authNavigation.ts';
import './AuthPage.css';

type RegistrationErrors = Partial<Record<'fullName' | 'email' | 'password' | 'confirmPassword' | 'consent', string>>;

const PASSWORD_COMPLEXITY_PATTERN = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const validateRegistration = (input: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  consent: boolean;
}): RegistrationErrors => {
  const errors: RegistrationErrors = {};
  const fullName = input.fullName.trim();
  if (!fullName) {
    errors.fullName = 'auth.registration.validation.full_name.required';
  } else if (fullName.length < 2 || fullName.length > 80) {
    errors.fullName = 'auth.registration.validation.full_name.length';
  }

  if (!input.email.trim()) {
    errors.email = 'auth.registration.validation.email.required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    errors.email = 'auth.registration.validation.email.invalid';
  }

  if (!input.password) {
    errors.password = 'auth.registration.validation.password.required';
  } else if (!PASSWORD_COMPLEXITY_PATTERN.test(input.password)) {
    errors.password = 'auth.registration.validation.password.rules';
  }

  if (!input.confirmPassword) {
    errors.confirmPassword = 'auth.registration.validation.confirm_password.required';
  } else if (input.confirmPassword !== input.password) {
    errors.confirmPassword = 'auth.registration.validation.confirm_password.mismatch';
  }

  if (!input.consent) {
    errors.consent = 'auth.registration.validation.consent.required';
  }

  return errors;
};

export const RegistrationPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const authStatus = useAppSelector((state) => state.auth.status);
  const serverErrorKey = useAppSelector((state) => state.auth.errorKey);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const params = new URLSearchParams(location.search);
  const returnTo = resolveReturnTo(params.get('returnTo'));

  const validationErrors = useMemo(
    () => validateRegistration({ fullName, email, password, confirmPassword, consent }),
    [confirmPassword, consent, email, fullName, password],
  );
  const showValidation = submitted;
  const isSubmitDisabled =
    authStatus === 'loading' || [fullName, email, password, confirmPassword].some((value) => value.trim().length === 0);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    dispatch(sessionPersistencePreferenceSet('persistent'));
    const result = await dispatch(register({ fullName: fullName.trim(), email: email.trim(), password }));
    if (register.fulfilled.match(result)) {
      navigate(returnTo, { replace: true });
    }
  };

  return (
    <main className="auth-page">
      <Card as="section" variant="raised" header={<h1 className="auth-page__title">{t('auth.registration.title')}</h1>}>
        <form className="auth-form auth-page__card" onSubmit={handleSubmit} noValidate>
          <TextField
            id="registration-full-name"
            label={t('auth.registration.full_name')}
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
            variant={showValidation && validationErrors.fullName ? 'error' : 'default'}
            errorText={showValidation && validationErrors.fullName ? t(validationErrors.fullName) : undefined}
            leadingIcon={<User />}
          />
          <TextField
            id="registration-email"
            label={t('auth.registration.email')}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            variant={showValidation && validationErrors.email ? 'error' : serverErrorKey === 'auth.registration.email_taken' ? 'error' : 'default'}
            errorText={showValidation && validationErrors.email ? t(validationErrors.email) : serverErrorKey === 'auth.registration.email_taken' ? t(serverErrorKey) : undefined}
            leadingIcon={<Mail />}
          />
          <PasswordField
            id="registration-password"
            label={t('auth.registration.password')}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            variant={showValidation && validationErrors.password ? 'error' : 'default'}
            errorText={showValidation && validationErrors.password ? t(validationErrors.password) : undefined}
            leadingIcon={<Lock />}
          />
          <PasswordField
            id="registration-confirm-password"
            label={t('auth.registration.confirm_password')}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            variant={showValidation && validationErrors.confirmPassword ? 'error' : 'default'}
            errorText={showValidation && validationErrors.confirmPassword ? t(validationErrors.confirmPassword) : undefined}
            leadingIcon={<Lock />}
          />
          <label className="auth-form__consent">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              aria-invalid={showValidation && validationErrors.consent ? true : undefined}
            />
            <span>
              {t('auth.registration.consent_prefix')}{' '}
              <a href="#terms" title={t('auth.common.legal_placeholder')}>{t('auth.registration.consent_terms')}</a>{' '}
              {t('auth.registration.consent_and')}{' '}
              <a href="#privacy" title={t('auth.common.legal_placeholder')}>{t('auth.registration.consent_privacy')}</a>
            </span>
          </label>
          {showValidation && validationErrors.consent && (
            <p className="auth-form__error" role="alert">
              {t(validationErrors.consent)}
            </p>
          )}
          {serverErrorKey && serverErrorKey !== 'auth.registration.email_taken' && (
            <p className="auth-form__error" role="alert">
              {t(serverErrorKey)}
            </p>
          )}
          <Button size="lg" type="submit" disabled={isSubmitDisabled}>
            <ShieldCheck size={16} aria-hidden="true" />
            {t('auth.registration.submit')}
          </Button>
          <p className="auth-form__redirect">
            <span>{t('auth.registration.has_account')}</span>
            <Link className="auth-form__redirect-link" to={withReturnTo('/login', returnTo)}>
              {t('auth.registration.go_to_login')}
            </Link>
          </p>
        </form>
      </Card>
    </main>
  );
};
