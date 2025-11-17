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
    <div className="container" style={{ maxWidth: 720, margin: '0 auto', textAlign: 'left' }}>
      <h2 style={{ marginBottom: 16 }}>Add Learning Path</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: 6 }}>Name</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g., Frontend Development"
            required
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-color)' }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="description" style={{ display: 'block', marginBottom: 6 }}>Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Short summary of the learning path"
            required
            rows={4}
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-color)' }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label htmlFor="external_url" style={{ display: 'block', marginBottom: 6 }}>External URL (optional)</label>
          <input
            id="external_url"
            name="external_url"
            value={form.external_url}
            onChange={handleChange}
            placeholder="https://example.com/path"
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-color)' }}
          />
        </div>

        <button
          type="submit"
          className="btn"
          disabled={status.loading}
          style={{
            background: 'var(--button-bg)',
            color: 'var(--button-text)',
            border: 'none',
            padding: '10px 16px',
            borderRadius: 8,
            cursor: 'pointer'
          }}
        >
          {status.loading ? 'Saving...' : 'Add Path'}
        </button>

        {status.error && (
          <p role="alert" style={{ color: '#EF4444', marginTop: 12 }}>{status.error}</p>
        )}
        {status.success && (
          <p style={{ color: '#2563EB', marginTop: 12 }}>{status.success}</p>
        )}
      </form>
    </div>
  );
}

export default AddLearningPath;
