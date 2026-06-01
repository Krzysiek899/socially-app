import React, { FormEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks.ts';
import { Button, Card, PasswordField, TextField } from '../../components/index.ts';
import { login } from './authSlice.ts';

export const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const authStatus = useAppSelector((state) => state.auth.status);
  const errorKey = useAppSelector((state) => state.auth.errorKey);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const params = new URLSearchParams(location.search);
  const returnTo = params.get('returnTo') ?? '/app';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      navigate(returnTo, { replace: true });
    }
  };

  return (
    <main>
      <Card
        as="section"
        variant="raised"
        header={<h1>auth.login.title</h1>}
      >
        <form onSubmit={handleSubmit}>
          <TextField
            id="login-email"
            label="auth.login.email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            variant={errorKey ? 'error' : 'default'}
            errorText={errorKey ?? undefined}
          />
          <PasswordField
            id="login-password"
            label="auth.login.password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            variant={errorKey ? 'error' : 'default'}
          />
          <Button type="submit" disabled={authStatus === 'loading'}>
            auth.login.submit
          </Button>
        </form>
      </Card>
    </main>
  );
};
