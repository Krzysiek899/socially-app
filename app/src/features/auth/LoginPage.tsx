import React, { FormEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks.ts';
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
      <h1>auth.login.title</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="login-email">auth.login.email</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <label htmlFor="login-password">auth.login.password</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <button type="submit" disabled={authStatus === 'loading'}>
          auth.login.submit
        </button>
      </form>

      {errorKey ? <p role="alert">{errorKey}</p> : null}
    </main>
  );
};
