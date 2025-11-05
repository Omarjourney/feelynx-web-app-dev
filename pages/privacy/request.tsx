import { FormEvent, useState } from 'react';

interface FormState {
  type: 'export' | 'deletion' | 'rectification';
  email: string;
  message: string;
}

const initialState: FormState = {
  type: 'export',
  email: '',
  message: ''
};

const RequestPage = () => {
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('submitting');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/privacy/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error('Unable to submit request. Please try again.');
      }

      setStatus('success');
      setForm(initialState);
    } catch (error) {
      setErrorMessage((error as Error).message);
      setStatus('error');
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold text-slate-900">Data Subject Access Request</h1>
      <p className="mt-4 text-slate-600">
        Submit a request to export, delete, or correct your personal information. We respond to
        verified requests within 30 days.
      </p>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-slate-700">
            Request Type
          </label>
          <select
            id="type"
            name="type"
            className="mt-1 block w-full rounded-md border border-slate-300 p-2"
            value={form.type}
            onChange={(event) =>
              setForm((current) => ({ ...current, type: event.target.value as FormState['type'] }))
            }
            required
          >
            <option value="export">Export my data</option>
            <option value="deletion">Delete my data</option>
            <option value="rectification">Correct my data</option>
          </select>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 block w-full rounded-md border border-slate-300 p-2"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-slate-700">
            Additional Details
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            className="mt-1 block w-full rounded-md border border-slate-300 p-2"
            value={form.message}
            onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500"
            disabled={status === 'submitting'}
          >
            {status === 'submitting' ? 'Submitting…' : 'Submit Request'}
          </button>
          {status === 'success' && <span className="text-sm text-emerald-600">Request received.</span>}
          {status === 'error' && errorMessage && (
            <span className="text-sm text-red-600">{errorMessage}</span>
          )}
        </div>
      </form>

      <section className="mt-12 rounded-lg border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-xl font-semibold text-slate-900">How we handle your request</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-600">
          <li>We verify your identity before processing any request.</li>
          <li>Deletion requests are irreversible once completed.</li>
          <li>Legal hold or regulatory requirements may extend retention timelines.</li>
        </ul>
      </section>
    </main>
  );
};

export default RequestPage;
