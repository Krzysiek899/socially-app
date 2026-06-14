import * as React from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks.ts';
import { Button, Card, PasswordField, TextField } from '../../shared/components/index.ts';
import { t } from '../../i18n/index.ts';
import { login, sessionPersistencePreferenceSet } from '../../redux/auth/authSlice.ts';
import { resolveReturnTo, withReturnTo } from './authNavigation.ts';
import './AuthPage.css';

export const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const authStatus = useAppSelector((state) => state.auth.status);
  const errorKey = useAppSelector((state) => state.auth.errorKey);
  const session = useAppSelector((state) => state.auth.session);
  const sessionPersistencePreference = useAppSelector((state) => state.auth.sessionPersistencePreference);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const rememberMe = sessionPersistencePreference === 'persistent';

  const params = new URLSearchParams(location.search);
  const returnTo = resolveReturnTo(params.get('returnTo'));

  if (session) {
    return <Navigate to="/app" replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(sessionPersistencePreferenceSet(rememberMe ? 'persistent' : 'session'));

    const result = await dispatch(login({ email, password, rememberMe }));
    if (login.fulfilled.match(result)) {
      navigate(returnTo, { replace: true });
    }
  };

  return (
    <main className="auth-page">
      <Card as="section" variant="raised" header={<h1 className="auth-page__title">{t('auth.login.title')}</h1>}>
        <form className="auth-form auth-page__card" onSubmit={handleSubmit}>
          <TextField
            id="login-email"
            label={t('auth.login.email')}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            variant={errorKey ? 'error' : 'default'}
            errorText={errorKey ? t(errorKey) : undefined}
            leadingIcon={<Mail />}
          />
          <PasswordField
            id="login-password"
            label={t('auth.login.password')}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            variant={errorKey ? 'error' : 'default'}
            leadingIcon={<Lock />}
          />
          <div className="auth-form__actions">
            <label className="auth-form__remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => dispatch(sessionPersistencePreferenceSet(event.target.checked ? 'persistent' : 'session'))}
              />
              {t('auth.login.remember_me')}
            </label>
            <a className="auth-form__support-link" href="#forgot-password">
              {t('auth.login.forgot_password')}
            </a>
          </div>
          <Button size="lg" type="submit" disabled={authStatus === 'loading'}>
            <ShieldCheck size={16} aria-hidden="true" />
            {t('auth.login.submit')}
          </Button>
          <p className="auth-form__redirect">
            <span>{t('auth.login.no_account')}</span>
            <Link className="auth-form__redirect-link" to={withReturnTo('/register', returnTo)}>
              {t('auth.login.go_to_register')}
            </Link>
          </p>
        </form>
      </Card>
    </main>
  );
};
