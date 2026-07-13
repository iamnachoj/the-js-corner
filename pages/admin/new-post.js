import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

import {
  ADMIN_SESSION_COOKIE_NAME,
  hasValidAdminSession,
} from '../../lib/admin-auth';
import classes from '../../styles/admin.module.css';

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

const initialFormState = {
  title: '',
  slug: '',
  excerpt: '',
  image: '',
  date: getTodayDate(),
  isFeatured: false,
  content: '',
};

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read file.'));

    reader.readAsDataURL(file);
  });
}

function NewPostAdminPage() {
  const router = useRouter();
  const [formValues, setFormValues] = useState(initialFormState);
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  function changeHandler(event) {
    const { name, value, type, checked } = event.target;
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function submitHandler(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess(null);

    let imageBase64 = '';

    if (imageFile) {
      try {
        imageBase64 = await fileToDataUrl(imageFile);
      } catch (fileError) {
        setError('No se pudo leer la imagen seleccionada.');
        setIsSubmitting(false);
        return;
      }
    }

    const response = await fetch('/api/admin/create-post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formValues,
        image: formValues.image || imageFile?.name || '',
        imageBase64,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      setError(responseData.message || 'No se pudo crear el post.');
      setIsSubmitting(false);
      return;
    }

    setSuccess(responseData);
    setFormValues((currentValues) => ({
      ...initialFormState,
      date: getTodayDate(),
      isFeatured: currentValues.isFeatured,
    }));
    setImageFile(null);
    setIsSubmitting(false);
  }

  async function logoutHandler() {
    await fetch('/api/admin/logout', { method: 'POST' });
    await router.push('/admin/login');
  }

  return (
    <>
      <Head>
        <title>Admin - New Post</title>
        <meta name='description' content='Create markdown posts from private admin UI.' />
      </Head>

      <section className={classes.panel}>
        <div className={classes.topBar}>
          <h1>Crear Nuevo Post</h1>
          <button type='button' onClick={logoutHandler} className={classes.secondaryBtn}>
            Cerrar sesión
          </button>
        </div>

        <p>
          Esto crea el archivo markdown en <strong>posts/</strong> y la carpeta de imagen
          en <strong>public/images/posts/&lt;slug&gt;</strong>. Si eliges una imagen, se sube
          automáticamente.
        </p>

        <form className={classes.form} onSubmit={submitHandler}>
          <div className={classes.control}>
            <label htmlFor='title'>Title</label>
            <input id='title' name='title' value={formValues.title} onChange={changeHandler} required />
          </div>

          <div className={classes.control}>
            <label htmlFor='slug'>Slug (opcional)</label>
            <input id='slug' name='slug' value={formValues.slug} onChange={changeHandler} placeholder='si se deja vacío se genera con el title' />
          </div>

          <div className={classes.control}>
            <label htmlFor='excerpt'>Excerpt</label>
            <textarea id='excerpt' name='excerpt' value={formValues.excerpt} onChange={changeHandler} rows='3' required />
          </div>

          <div className={classes.control}>
            <label htmlFor='image'>Image filename</label>
            <input id='image' name='image' value={formValues.image} onChange={changeHandler} placeholder='cover.png' />
            <small className={classes.helpText}>
              Opcional. Si no escribes nada y subes un archivo, se usa el nombre del archivo.
            </small>
          </div>

          <div className={classes.control}>
            <label htmlFor='imageFile'>Upload image file</label>
            <input
              id='imageFile'
              name='imageFile'
              type='file'
              accept='image/png,image/jpeg,image/webp,image/gif,image/svg+xml'
              onChange={(event) => setImageFile(event.target.files?.[0] || null)}
            />
            {imageFile ? <small className={classes.helpText}>Archivo: {imageFile.name}</small> : null}
          </div>

          <div className={classes.control}>
            <label htmlFor='date'>Date (YYYY-MM-DD)</label>
            <input id='date' name='date' value={formValues.date} onChange={changeHandler} pattern='\d{4}-\d{2}-\d{2}' required />
          </div>

          <div className={classes.inlineControl}>
            <input
              id='isFeatured'
              name='isFeatured'
              type='checkbox'
              checked={formValues.isFeatured}
              onChange={changeHandler}
            />
            <label htmlFor='isFeatured'>Featured post</label>
          </div>

          <div className={classes.control}>
            <label htmlFor='content'>Markdown content</label>
            <textarea
              id='content'
              name='content'
              value={formValues.content}
              onChange={changeHandler}
              rows='14'
              required
            />
          </div>

          {error ? <p className={classes.error}>{error}</p> : null}

          {success ? (
            <p className={classes.success}>
              Post creado. Archivo: <strong>{success.filePath}</strong>. Ver en{' '}
              <Link href={`/posts/${success.slug}`}>/posts/{success.slug}</Link>. Imagen:{' '}
              <strong>{success.imagePath}</strong>
            </p>
          ) : null}

          <div className={classes.actions}>
            <button type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear post'}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}

export function getServerSideProps(context) {
  const sessionToken = context.req.cookies?.[ADMIN_SESSION_COOKIE_NAME];

  if (!hasValidAdminSession(sessionToken)) {
    return {
      redirect: {
        destination: '/admin/login',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

export default NewPostAdminPage;
