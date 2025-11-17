import React, { useState } from 'react';
import supabase from '../supabaseClient';

// PUBLIC_INTERFACE
/**
 * AddLearningPath allows creating a new learning path entry in 'learning_paths' table.
 * Fields: name (string), description (string), external_url (string, optional)
 */
function AddLearningPath() {
  const [form, setForm] = useState({ name: '', description: '', external_url: '' });
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const resetMessages = () => setStatus({ loading: false, error: '', success: '' });

  const validate = () => {
    if (!form.name.trim()) return 'Name is required';
    if (!form.description.trim()) return 'Description is required';
    // basic URL check if provided
    if (form.external_url && !/^https?:\/\/.+/i.test(form.external_url)) {
      return 'External URL must start with http:// or https://';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetMessages();
    const validationError = validate();
    if (validationError) {
      setStatus((s) => ({ ...s, error: validationError }));
      return;
    }
    setStatus((s) => ({ ...s, loading: true }));

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        external_url: form.external_url.trim() || null,
      };
      const { error } = await supabase.from('learning_paths').insert([payload]);
      if (error) {
        throw error;
      }
      setStatus({ loading: false, error: '', success: 'Learning path added successfully.' });
      setForm({ name: '', description: '', external_url: '' });
    } catch (err) {
      setStatus({ loading: false, error: err.message || 'Failed to add learning path', success: '' });
    }
  };

  return (
    <div style={{ textAlign: 'left' }}>
      <h2 className="h3" style={{ marginBottom: 8 }}>Add Learning Path</h2>
      <form onSubmit={handleSubmit} className="stack">
        <div>
          <label htmlFor="name" className="label">Name</label>
          <input
            id="name"
            name="name"
            className={`input ${status.error && !form.name.trim() ? 'error' : ''}`}
            value={form.name}
            onChange={handleChange}
            placeholder="e.g., Frontend Development"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="label">Description</label>
          <textarea
            id="description"
            name="description"
            className={`textarea ${status.error && !form.description.trim() ? 'error' : ''}`}
            value={form.description}
            onChange={handleChange}
            placeholder="Short summary of the learning path"
            required
            rows={4}
          />
        </div>

        <div>
          <label htmlFor="external_url" className="label">External URL (optional)</label>
          <input
            id="external_url"
            name="external_url"
            className="input"
            value={form.external_url}
            onChange={handleChange}
            placeholder="https://example.com/path"
          />
        </div>

        <div className="row">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={status.loading}
          >
            {status.loading ? 'Saving...' : 'Add Path'}
          </button>
        </div>

        {status.error && (
          <p role="alert" className="field-error">{status.error}</p>
        )}
        {status.success && (
          <p style={{ color: 'var(--color-primary)' }}>{status.success}</p>
        )}
      </form>
    </div>
  );
}

export default AddLearningPath;
