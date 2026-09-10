import { useState } from 'react';
import { CheckCircle, Send } from 'lucide-react';
import api from '@/api/client';

const JobOpenings = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    experience: '',
    message: '',
  });
  const [resume, setResume] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError('');

    try {
      const submission = new FormData();
      submission.append('name', formData.name);
      submission.append('email', formData.email);
      submission.append('phone', formData.phone);
      submission.append('role', formData.role);
      submission.append('subject', `Job Application: ${formData.role}`);
      submission.append('message', `Experience: ${formData.experience}\n\n${formData.message}`);
      if (resume) submission.append('resume', resume);
      await api.post('/contact', submission);
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', role: '', experience: '', message: '' });
      setResume(null);
    } catch (error: any) {
      setSubmitError(error.response?.data?.error || 'Failed to submit your application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-cm-gray flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-cm-blue-dark mb-3">Application Submitted</h1>
          <p className="text-gray-600">Thank you for your interest. Our team will review your application and get back to you.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cm-gray py-8 sm:py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-cm-blue-dark mb-2 text-center">Job Openings</h1>
          <p className="text-gray-600 text-center mb-8">Tell us about your experience and the opportunity you would like to pursue.</p>

          {submitError && <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">{submitError}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="job-name" className="form-label">Full Name *</label>
              <input id="job-name" type="text" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} className="form-input" placeholder="Your full name" required />
            </div>
            <div>
              <label htmlFor="job-email" className="form-label">Email *</label>
              <input id="job-email" type="email" pattern="[^\s@]+@[^\s@]+\.[^\s@]+" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} className="form-input" placeholder="your@email.com" required />
            </div>
            <div>
              <label htmlFor="job-phone" className="form-label">Phone Number *</label>
              <input id="job-phone" type="tel" pattern="(?:\+91[ -]?)?[6-9][0-9]{9}" minLength={10} maxLength={14} value={formData.phone} onChange={(event) => setFormData({ ...formData, phone: event.target.value })} className="form-input" placeholder="+91 98765 43210" required />
            </div>
            <div>
              <label htmlFor="job-role" className="form-label">Role you are applying for *</label>
              <input id="job-role" type="text" value={formData.role} onChange={(event) => setFormData({ ...formData, role: event.target.value })} className="form-input" placeholder="Enter the role you are applying for" required />
            </div>
            <div>
              <label htmlFor="job-experience" className="form-label">Years of experience *</label>
              <select id="job-experience" value={formData.experience} onChange={(event) => setFormData({ ...formData, experience: event.target.value })} className="form-input" required>
                <option value="">Select experience</option>
                <option value="0-2 years">0-2 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="6-10 years">6-10 years</option>
                <option value="10+ years">10+ years</option>
              </select>
            </div>
            <div>
              <label htmlFor="job-message" className="form-label">Message *</label>
              <textarea id="job-message" value={formData.message} onChange={(event) => setFormData({ ...formData, message: event.target.value })} className="form-input min-h-[140px]" placeholder="Tell us about your skills, achievements, and interest in joining us" required />
            </div>
            <div>
              <label htmlFor="job-resume" className="form-label">Resume *</label>
              <input id="job-resume" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => setResume(event.target.files?.[0] ?? null)} className="block w-full rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600" required />
              <p className="mt-1 text-xs text-gray-500">PDF, DOC, or DOCX up to 10 MB.</p>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
              <Send className="w-5 h-5" />
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default JobOpenings;
