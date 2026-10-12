import { useState, useRef, useEffect, useMemo } from 'react';
import { CheckCircle, Send, Briefcase, MapPin, Clock, ArrowRight, Upload, FileText, Check, Sparkles } from 'lucide-react';
import api from '@/api/client';
import { usePageData } from '@/hooks/usePageData';

export interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  description: string;
  requirements: string[];
  active?: boolean;
}

const JobOpenings = () => {
  const { data: pageData, loading } = usePageData('job-openings');

  const openings = useMemo<JobOpening[]>(() => {
    const raw = Array.isArray((pageData as any).openings) ? (pageData as any).openings : [];
    return raw.filter((job: JobOpening) => job && job.title && job.active !== false);
  }, [pageData]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    experience: '',
    message: '',
  });
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [resume, setResume] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (openings.length > 0 && !selectedJobId) {
      const first = openings[0];
      setSelectedJobId(first.id);
      setFormData((prev) => ({
        ...prev,
        role: prev.role || first.title,
        experience: prev.experience || first.experience,
      }));
    }
  }, [openings, selectedJobId]);

  const handleSelectJob = (job: JobOpening) => {
    setSelectedJobId(job.id);
    setFormData((prev) => ({
      ...prev,
      role: job.title,
      experience: prev.experience || job.experience,
    }));
    // Smooth scroll to form on mobile devices
    if (window.innerWidth < 1024) {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
      setSubmitError(error.response?.data?.error || 'Failed to submit your application. Please ensure all required fields and your resume are provided.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center py-16 px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-slate-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-green-600">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-cm-blue-dark mb-3">
            {(pageData as any).successTitle || 'Application Received'}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            {(pageData as any).successMessage || 'Thank you for applying. Our talent acquisition team will review your credentials and reach out to you within 3 business days.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              const first = openings[0];
              setFormData({
                name: '',
                email: '',
                phone: '',
                role: first?.title || '',
                experience: first?.experience || '',
                message: '',
              });
              setSelectedJobId(first?.id || '');
            }}
            className="w-full py-3 px-4 rounded-xl bg-cm-blue text-white text-sm font-bold hover:bg-cm-blue-dark transition-colors"
          >
            {(pageData as any).successButtonLabel || 'Apply for Another Role'}
          </button>
        </div>
      </main>
    );
  }

  const hideHero = Boolean((pageData as any).hideHero);
  const hideOpenings = Boolean((pageData as any).hideOpenings);
  const hideForm = Boolean((pageData as any).hideForm);
  const experienceOptions: string[] = Array.isArray((pageData as any).experienceOptions)
    ? (pageData as any).experienceOptions.filter(Boolean)
    : [];

  return (
    <main className="min-h-screen bg-slate-50/60 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Hero */}
        {!hideHero && (
          <div className="mb-10 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-cm-blue text-xs font-bold tracking-wide uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              {pageData.heroEyebrow || 'Careers at CampusMart'}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-cm-blue-dark tracking-tight">
              {pageData.heroTitle || 'Build Future-Ready Campuses With Us'}
            </h1>
            <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
              {pageData.heroSubtitle || "Join India's premier educational infrastructure team. Select an open position on the left, or submit your resume directly using the application form."}
            </p>
          </div>
        )}

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Job Openings List */}
          {!hideOpenings && (
            <div className={`${hideForm ? 'lg:col-span-12' : 'lg:col-span-7'} space-y-4`}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-cm-blue" />
                  {pageData.section1Title || 'Current Openings'} ({openings.length})
                </h2>
                <span className="text-xs text-slate-500 font-semibold">
                  {(pageData as any).section1Subtitle || 'Select a role to apply'}
                </span>
              </div>

              {loading && openings.length === 0 ? (
                <div className="p-8 rounded-2xl border border-slate-200 bg-white text-center text-sm text-slate-400 font-semibold">
                  Loading job openings...
                </div>
              ) : openings.length === 0 ? (
                <div className="p-8 rounded-2xl border border-slate-200 bg-white text-center text-sm text-slate-500">
                  No open positions are currently listed. You may still submit a general application using the form.
                </div>
              ) : (
                <div className="space-y-4">
                  {openings.map((job) => {
                    const isSelected = selectedJobId === job.id;
                    const requirements = Array.isArray(job.requirements) ? job.requirements : [];
                    return (
                      <div
                        key={job.id}
                        onClick={() => handleSelectJob(job)}
                        className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer text-left bg-white ${
                          isSelected
                            ? 'border-cm-blue ring-2 ring-blue-500/20 shadow-md bg-blue-50/10'
                            : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <h3 className="text-lg font-extrabold text-cm-blue-dark">
                            {job.title}
                          </h3>
                          {job.department && (
                            <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                              {job.department}
                            </span>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                          {job.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium mb-4">
                          {job.location && (
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {job.location}
                            </span>
                          )}
                          {job.location && job.experience && <span>•</span>}
                          {job.experience && (
                            <span className="inline-flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {job.experience}
                            </span>
                          )}
                          {(job.location || job.experience) && job.type && <span>•</span>}
                          {job.type && <span className="text-slate-600 font-bold">{job.type}</span>}
                        </div>

                        {requirements.length > 0 && (
                          <div className="space-y-1.5 pt-3 border-t border-slate-100 mb-4">
                            {requirements.map((req, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs text-slate-500">
                                <Check className="w-3.5 h-3.5 text-cm-blue shrink-0" />
                                <span>{req}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <span className={`text-xs font-bold ${isSelected ? 'text-cm-blue' : 'text-slate-400'}`}>
                            {isSelected ? '✓ Selected in Form' : 'Click to select this role'}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectJob(job);
                            }}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-cm-blue text-white shadow-sm'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {(pageData as any).cardButtonLabel || 'Apply for this Role'}
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Right Column: Application Form */}
          {!hideForm && (
            <div ref={formRef} className={`${hideOpenings ? 'lg:col-span-8 lg:col-start-3' : 'lg:col-span-5'} lg:sticky lg:top-24`}>
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
                <div className="border-b border-slate-100 pb-4 mb-6">
                  <h2 className="text-xl font-black text-cm-blue-dark">
                    {(pageData as any).formTitle || 'Submit Your Application'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {(pageData as any).formApplyingPrefix || 'Applying for:'}{' '}
                    <strong className="text-cm-blue font-bold">
                      {formData.role || (pageData as any).formDefaultRole || 'General Application'}
                    </strong>
                  </p>
                </div>

                {submitError && (
                  <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium leading-relaxed">
                    {submitError}
                  </div>
                )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="job-name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    {(pageData as any).formNameLabel || 'Full Name *'}
                  </label>
                  <input
                    id="job-name"
                    type="text"
                    value={formData.name}
                    onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cm-blue/20 focus:border-cm-blue transition-all"
                    placeholder={(pageData as any).formNamePlaceholder || 'Enter your full name'}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="job-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      {(pageData as any).formEmailLabel || 'Email *'}
                    </label>
                    <input
                      id="job-email"
                      type="email"
                      pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                      value={formData.email}
                      onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cm-blue/20 focus:border-cm-blue transition-all"
                      placeholder={(pageData as any).formEmailPlaceholder || 'you@email.com'}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="job-phone" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      {(pageData as any).formPhoneLabel || 'Phone Number *'}
                    </label>
                    <input
                      id="job-phone"
                      type="tel"
                      pattern="(?:\+?91[\s\-]?)?0?[0-9\s\-]{10,14}"
                      minLength={10}
                      maxLength={14}
                      value={formData.phone}
                      onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cm-blue/20 focus:border-cm-blue transition-all"
                      placeholder={(pageData as any).formPhonePlaceholder || '+91 98765 43210'}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="job-role" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    {(pageData as any).formRoleLabel || 'Position Applied For *'}
                  </label>
                  <input
                    id="job-role"
                    type="text"
                    value={formData.role}
                    onChange={(event) => setFormData({ ...formData, role: event.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-cm-blue-dark bg-slate-50/70 focus:outline-none focus:ring-2 focus:ring-cm-blue/20 focus:border-cm-blue transition-all"
                    placeholder={(pageData as any).formRolePlaceholder || 'Selected role or desired position'}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="job-experience" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    {(pageData as any).formExpLabel || 'Years of Experience *'}
                  </label>
                  <select
                    id="job-experience"
                    value={formData.experience}
                    onChange={(event) => setFormData({ ...formData, experience: event.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cm-blue/20 focus:border-cm-blue transition-all"
                    required
                  >
                    <option value="">{(pageData as any).formExpPlaceholder || 'Select experience level'}</option>
                    {experienceOptions.map((opt, idx) => {
                      const val = opt.split('(')[0].trim();
                      return (
                        <option key={idx} value={val}>
                          {opt}
                        </option>
                      );
                    })}
                    {formData.experience &&
                      !experienceOptions.some((opt) => opt.split('(')[0].trim() === formData.experience) && (
                        <option value={formData.experience}>{formData.experience}</option>
                      )}
                  </select>
                </div>

                <div>
                  <label htmlFor="job-message" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    {(pageData as any).formMessageLabel || 'Cover Note / Highlights *'}
                  </label>
                  <textarea
                    id="job-message"
                    rows={3}
                    value={formData.message}
                    onChange={(event) => setFormData({ ...formData, message: event.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cm-blue/20 focus:border-cm-blue transition-all resize-none"
                    placeholder={(pageData as any).formMessagePlaceholder || 'Briefly highlight your notable achievements, domain skills, and why you wish to join CampusMart...'}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="job-resume" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    {(pageData as any).formResumeLabel || 'Upload Resume (PDF, DOC, DOCX) *'}
                  </label>
                  <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <input
                      id="job-resume"
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(event) => setResume(event.target.files?.[0] ?? null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                    {resume ? (
                      <div className="flex items-center justify-center gap-2 text-cm-blue font-bold text-xs">
                        <FileText className="w-4 h-4 text-cm-blue" />
                        <span className="truncate max-w-[220px]">{resume.name}</span>
                        <span className="text-slate-400 font-normal">({(resume.size / 1024).toFixed(0)} KB)</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="w-5 h-5 text-slate-400 mx-auto" />
                        <p className="text-xs font-bold text-slate-700">
                          {(pageData as any).formResumePrompt || 'Click or drag file here to attach resume'}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {(pageData as any).formResumeHint || 'PDF, DOC, or DOCX up to 10 MB'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-6 rounded-xl bg-cm-blue text-white font-bold text-sm hover:bg-cm-blue-dark transition-all duration-200 flex items-center justify-center gap-2 shadow-md active:scale-95 disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Submitting Application...' : ((pageData as any).formButtonLabel || 'Submit Application')}
                </button>
              </form>
            </div>
          </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default JobOpenings;
