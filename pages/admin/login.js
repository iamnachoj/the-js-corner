import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';

import {
  ADMIN_SESSION_COOKIE_NAME,
  hasValidAdminSession,
} from '../../lib/admin-auth';
import classes from '../../styles/admin.module.css';

function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function submitHandler(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      setError('Password incorrecta o configuración inválida del servidor.');
      setIsSubmitting(false);
      return;
    }

    await router.push('/admin/new-post');
  }

  return (
    <>
      <Head>
        <title>Admin Login</title>
        <meta
          name='description'
          content='Private admin access to create markdown posts from UI.'
        />
      </Head>

      <section className={classes.panel}>
        <h1>Admin Access</h1>
        <p>Introduce tu contraseña privada para crear nuevos posts.</p>

        <form className={classes.form} onSubmit={submitHandler}>
          <div className={classes.control}>
            <label htmlFor='password'>Password</label>
            <input
              id='password'
              type='password'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error ? <p className={classes.error}>{error}</p> : null}

          <div className={classes.actions}>
            <button type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}

export function getServerSideProps(context) {
  const sessionToken = context.req.cookies?.[ADMIN_SESSION_COOKIE_NAME];

  if (hasValidAdminSession(sessionToken)) {
    return {
      redirect: {
        destination: '/admin/new-post',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

export default AdminLoginPage;
