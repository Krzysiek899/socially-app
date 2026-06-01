import React from 'react';
import { Button, Card, PasswordField, TextField } from '../../components/index.ts';

export const RegistrationPage = () => (
  <main>
    <Card as="section" variant="raised" header={<h1>auth.registration.title</h1>}>
      <TextField
        id="registration-email"
        label="auth.registration.email"
        type="email"
        value=""
        readOnly
        helperText="auth.registration.coming_soon"
      />
      <PasswordField
        id="registration-password"
        label="auth.registration.password"
        value=""
        readOnly
      />
      <Button type="button" disabled>
        auth.registration.submit
      </Button>
    </Card>
  </main>
);
