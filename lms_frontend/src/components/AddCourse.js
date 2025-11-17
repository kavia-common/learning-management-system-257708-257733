import React, { useState } from 'react';
import supabase from '../supabaseClient';

// PUBLIC_INTERFACE
/**
 * AddCourse allows creating a new course assigned to a learning path.
 * Fields: learning_path_id (uuid/int), title (string), sequence (number), url (optional)
 */
function AddCourse() {
  const [form, setForm] = useState({
    learning_path_id: '',
    title: '',
    sequence: '',
    url: '',
  });
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const resetMessages = () => setStatus({ loading: false, error: '', success: '' });

  const validate = () => {
    if (!form.learning_path_id.trim()) return 'Learning Path ID is required';
    if (!form.title.trim()) return 'Title is required';
    const sequenceNum = Number(form.sequence);
    if (!Number.isFinite(sequenceNum) || sequenceNum < 0) return 'Sequence must be a non-negative number';
    if (form.url && !/^https?:\/\/.+/i.test(form.url)) {
      return 'URL must start with http:// or https://';
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
        learning_path_id: form.learning_path_id.trim(),
        title: form.title.trim(),
        sequence: Number(form.sequence),
        url: form.url.trim() || null,
      };
      const { error } = await supabase.from('courses').insert([payload]);
      if (error) {
        throw error;
      }
      setStatus({ loading: false, error: '', success: 'Course added successfully.' });
      setForm({ learning_path_id: '', title: '', sequence: '', url: '' });
    } catch (err) {
      setStatus({ loading: false, error: err.message || 'Failed to add course', success: '' });
    }
  };

  return (
    <div className="container" style={{ maxWidth: 720, margin: '0 auto', textAlign: 'left' }}>
      <h2 style={{ marginBottom: 16 }}>Add Course</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="learning_path_id" style={{ display: 'block', marginBottom: 6 }}>Learning Path ID</label>
          <input
            id="learning_path_id"
            name="learning_path_id"
            value={form.learning_path_id}
            onChange={handleChange}
            placeholder="Enter target learning path ID"
            required
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-color)' }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="title" style={{ display: 'block', marginBottom: 6 }}>Title</label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g., Intro to React"
            required
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-color)' }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="sequence" style={{ display: 'block', marginBottom: 6 }}>Sequence</label>
          <input
            id="sequence"
            name="sequence"
            value={form.sequence}
            onChange={handleChange}
            placeholder="e.g., 1"
            inputMode="numeric"
            pattern="[0-9]*"
            required
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-color)' }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label htmlFor="url" style={{ display: 'block', marginBottom: 6 }}>Course URL (optional)</label>
          <input
            id="url"
            name="url"
            value={form.url}
            onChange={handleChange}
            placeholder="https://example.com/course"
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
          {status.loading ? 'Saving...' : 'Add Course'}
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

export default AddCourse;
