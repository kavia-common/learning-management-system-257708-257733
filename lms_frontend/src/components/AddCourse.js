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
    <div style={{ textAlign: 'left' }}>
      <h2 className="h3" style={{ marginBottom: 8 }}>Add Course</h2>
      <form onSubmit={handleSubmit} className="stack">
        <div>
          <label htmlFor="learning_path_id" className="label">Learning Path ID</label>
          <input
            id="learning_path_id"
            name="learning_path_id"
            className="input"
            value={form.learning_path_id}
            onChange={handleChange}
            placeholder="Enter target learning path ID"
            required
          />
        </div>

        <div>
          <label htmlFor="title" className="label">Title</label>
          <input
            id="title"
            name="title"
            className="input"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g., Intro to React"
            required
          />
        </div>

        <div>
          <label htmlFor="sequence" className="label">Sequence</label>
          <input
            id="sequence"
            name="sequence"
            className="input"
            value={form.sequence}
            onChange={handleChange}
            placeholder="e.g., 1"
            inputMode="numeric"
            pattern="[0-9]*"
            required
          />
        </div>

        <div>
          <label htmlFor="url" className="label">Course URL (optional)</label>
          <input
            id="url"
            name="url"
            className="input"
            value={form.url}
            onChange={handleChange}
            placeholder="https://example.com/course"
          />
        </div>

        <div className="row">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={status.loading}
          >
            {status.loading ? 'Saving...' : 'Add Course'}
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

export default AddCourse;
