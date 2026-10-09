import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { usePageTitle } from '../hooks/usePageTitle';

export default function RegisterPage() {
  usePageTitle('Create account');

  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Required';
    if (!form.email.trim()) next.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = 'Invalid email';
    if (!form.password) next.password = 'Required';
    else if (form.password.length < 8)
      next.password = 'At least 8 characters';
    if (form.confirm !== form.password)
      next.confirm = 'Passwords do not match';
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      const result = await register(
        form.name.trim(),
        form.email.trim(),
        form.password
      );
      if (result.needsConfirmation) {
        setAwaitingConfirmation(form.email.trim());
      } else {
        navigate('/', { replace: true });
      }
    } catch {
      // Error already set in the store.
    } finally {
      setSubmitting(false);
    }
  };

  if (awaitingConfirmation) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight mb-1">
          Check your email
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          We sent a confirmation link to{' '}
          <span className="text-gray-900">{awaitingConfirmation}</span>.
        </p>

        <div className="border border-gray-200 rounded-md p-4 text-sm text-gray-600 leading-relaxed">
          <p>Click the link in the email to confirm your account.</p>
          <p className="mt-2">
            Once confirmed, you can{' '}
            <Link
              to="/login"
              className="text-gray-900 underline hover:text-brand transition-colors"
            >
              log in
            </Link>
            .
          </p>
        </div>

        <p className="text-xs text-gray-500 mt-6 text-center">
          Didn't get the email? Check your spam folder.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">
        Create account
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        Register to track orders and save addresses.
      </p>

      {error && (
        <div className="mb-4 px-3 py-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field
          label="Full name"
          name="name"
          autoComplete="name"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
        />
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />
        <Field
          label="Confirm password"
          name="confirm"
          type="password"
          autoComplete="new-password"
          value={form.confirm}
          onChange={handleChange}
          error={errors.confirm}
        />

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 py-2.5 bg-brand text-white text-sm font-medium rounded-md hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-6 text-center">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-gray-900 underline hover:text-brand transition-colors"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}

function Field({ label, name, type = 'text', autoComplete, value, onChange, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-700">{label}</label>
      <input
        type={type}
        name={name}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        className={`px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-black ${
          error ? 'border-red-400' : 'border-gray-300'
        }`}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}