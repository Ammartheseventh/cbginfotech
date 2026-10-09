import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { usePageTitle } from '../../hooks/usePageTitle';

export default function SettingsPage() {
  usePageTitle('Settings');

  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const showToast = useToastStore((s) => s.show);

  const [form, setForm] = useState(() => ({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  }));
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Required';
    if (!form.phone.trim()) next.phone = 'Required';
    return next;
  };

  const isDirty = form.name !== user?.name || form.phone !== user?.phone;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    try {
      await updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim(),
      });
      showToast('Settings saved');
    } catch (err) {
      // updateProfile sets store.error on failure; surface it as a toast.
      showToast(err.message ?? 'Could not save settings');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-8">Settings</h1>

      <section>
        <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-4">
          Profile
        </h2>

        <form
          onSubmit={handleSubmit}
          className="border border-gray-200 rounded-md p-6 flex flex-col gap-4"
        >
          <Field
            label="Full name"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">Email</label>
            <input
              type="email"
              value={form.email}
              disabled
              className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <span className="text-xs text-gray-400">
              Email changes are not supported yet.
            </span>
          </div>

          <Field
            label="Phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            error={errors.phone}
          />

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!isDirty}
              className="px-5 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save changes
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Field({ label, name, type = 'text', value, onChange, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-700">{label}</label>
      <input
        type={type}
        name={name}
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