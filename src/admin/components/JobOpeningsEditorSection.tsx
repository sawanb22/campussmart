import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, X, RotateCcw, Eye, EyeOff, Briefcase, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import type { PageData } from './UnifiedPageEditor';

export interface JobOpeningItem {
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

const EMPTY_JOB: JobOpeningItem = {
    id: '',
    title: '',
    department: '',
    location: '',
    type: 'Full-time',
    experience: '',
    description: '',
    requirements: [''],
    active: true,
};

interface JobOpeningsEditorSectionProps {
    data: PageData;
    set: (key: string, value: any) => void;
    onSyncOpenings: (nextOpenings: JobOpeningItem[]) => Promise<void>;
}

export default function JobOpeningsEditorSection({
    data,
    set,
    onSyncOpenings,
}: JobOpeningsEditorSectionProps) {
    const openings: JobOpeningItem[] = Array.isArray(data.openings) ? data.openings : [];
    const experienceOptions: string[] = Array.isArray((data as any).experienceOptions)
        ? (data as any).experienceOptions
        : [];

    const [search, setSearch] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [showModal, setShowModal] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editing, setEditing] = useState<JobOpeningItem>(EMPTY_JOB);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [syncing, setSyncing] = useState(false);

    const departments = Array.from(
        new Set(openings.map((j) => (j.department || '').trim()).filter(Boolean))
    );

    const filtered = openings
        .map((job, idx) => ({ job, idx }))
        .filter(({ job }) => {
            const query = search.toLowerCase().trim();
            const isActive = job.active !== false;
            const matchesSearch =
                !query ||
                (job.title || '').toLowerCase().includes(query) ||
                (job.department || '').toLowerCase().includes(query) ||
                (job.location || '').toLowerCase().includes(query) ||
                (job.description || '').toLowerCase().includes(query);
            const matchesStatus =
                statusFilter === 'all'
                    ? true
                    : statusFilter === 'active'
                        ? isActive
                        : !isActive;
            const matchesDept =
                departmentFilter === 'all'
                    ? true
                    : (job.department || '').toLowerCase() === departmentFilter.toLowerCase();
            return matchesSearch && matchesStatus && matchesDept;
        });

    const openAdd = () => {
        setEditingIndex(null);
        setEditing({
            ...EMPTY_JOB,
            id: `job-${Date.now()}`,
            requirements: [''],
            active: true,
        });
        setFormErrors({});
        setShowModal(true);
    };

    const openEdit = (idx: number) => {
        const target = openings[idx];
        if (!target) return;
        setEditingIndex(idx);
        setEditing({
            id: target.id || `job-${idx + 1}`,
            title: target.title || '',
            department: target.department || '',
            location: target.location || '',
            type: target.type || 'Full-time',
            experience: target.experience || '',
            description: target.description || '',
            requirements:
                Array.isArray(target.requirements) && target.requirements.length > 0
                    ? [...target.requirements]
                    : [''],
            active: target.active !== false,
        });
        setFormErrors({});
        setShowModal(true);
    };

    const handleSaveModal = async () => {
        const errors: Record<string, string> = {};
        if (!editing.title.trim()) errors.title = 'Job title is required.';
        if (!editing.department.trim()) errors.department = 'Department is required.';
        if (!editing.location.trim()) errors.location = 'Location is required.';
        if (!editing.experience.trim()) errors.experience = 'Experience range is required.';
        if (!editing.description.trim()) errors.description = 'Role description is required.';

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        const cleanRequirements = (editing.requirements || [])
            .map((r) => r.trim())
            .filter(Boolean);

        const slugId =
            editing.id?.trim() ||
            editing.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '') ||
            `job-${Date.now()}`;

        const normalizedJob: JobOpeningItem = {
            ...editing,
            id: slugId,
            title: editing.title.trim(),
            department: editing.department.trim(),
            location: editing.location.trim(),
            type: editing.type.trim() || 'Full-time',
            experience: editing.experience.trim(),
            description: editing.description.trim(),
            requirements: cleanRequirements,
            active: editing.active !== false,
        };

        const nextOpenings = [...openings];
        if (editingIndex !== null && editingIndex >= 0 && editingIndex < nextOpenings.length) {
            nextOpenings[editingIndex] = normalizedJob;
        } else {
            nextOpenings.unshift(normalizedJob);
        }

        setSyncing(true);
        try {
            await onSyncOpenings(nextOpenings);
            setShowModal(false);
        } finally {
            setSyncing(false);
        }
    };

    const handleToggleActive = async (idx: number) => {
        const nextOpenings = [...openings];
        const target = nextOpenings[idx];
        if (!target) return;
        nextOpenings[idx] = { ...target, active: target.active === false ? true : false };
        await onSyncOpenings(nextOpenings);
    };

    const handleDeleteJob = async (idx: number) => {
        const target = openings[idx];
        if (!target) return;
        if (!confirm(`Delete "${target.title}" from Job Openings?`)) return;
        const nextOpenings = openings.filter((_, i) => i !== idx);
        await onSyncOpenings(nextOpenings);
    };

    const updateRequirement = (reqIdx: number, val: string) => {
        const next = [...(editing.requirements || [])];
        next[reqIdx] = val;
        setEditing({ ...editing, requirements: next });
    };

    const addRequirement = () => {
        setEditing({ ...editing, requirements: [...(editing.requirements || []), ''] });
    };

    const removeRequirement = (reqIdx: number) => {
        const next = (editing.requirements || []).filter((_, i) => i !== reqIdx);
        setEditing({ ...editing, requirements: next.length > 0 ? next : [''] });
    };

    const setExpOption = (idx: number, val: string) => {
        const next = [...experienceOptions];
        next[idx] = val;
        set('experienceOptions', next);
    };

    const addExpOption = () => {
        set('experienceOptions', [...experienceOptions, 'New experience range']);
    };

    const removeExpOption = (idx: number) => {
        set(
            'experienceOptions',
            experienceOptions.filter((_, i) => i !== idx)
        );
    };

    return (
        <div className="space-y-12">
            {/* 1. Hero Header Section */}
            <section className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <div>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">
                            Page Header Banner Content
                        </h4>
                        <p className="text-xs text-gray-400 mt-0.5">Top header displayed on /job-openings</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => set('hideHero', !data.hideHero)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            data.hideHero
                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                    >
                        {data.hideHero ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {data.hideHero ? 'Hidden / Draft' : 'Live on Page'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700">Header Eyebrow Badge</label>
                        <input
                            type="text"
                            value={data.heroEyebrow ?? ''}
                            onChange={(e) => set('heroEyebrow', e.target.value)}
                            placeholder="Careers at CampusMart"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700">Page Heading *</label>
                        <input
                            type="text"
                            value={data.heroTitle ?? ''}
                            onChange={(e) => set('heroTitle', e.target.value)}
                            placeholder="Build Future-Ready Campuses With Us"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700">Page Subtitle</label>
                        <textarea
                            rows={2}
                            value={data.heroSubtitle ?? ''}
                            onChange={(e) => set('heroSubtitle', e.target.value)}
                            placeholder="Join India's premier educational infrastructure team..."
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y"
                        />
                    </div>
                </div>
            </section>

            {/* 2. Product-Style Job Openings Manager */}
            <section className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-gray-100">
                    <div>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-blue-600" />
                            Job Openings Inventory
                        </h4>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">
                            {openings.length} {openings.length === 1 ? 'Position' : 'Positions'} Cataloged in Database
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => set('hideOpenings', !data.hideOpenings)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                data.hideOpenings
                                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                        >
                            {data.hideOpenings ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            {data.hideOpenings ? 'Section Hidden' : 'Live on Page'}
                        </button>
                        <button
                            type="button"
                            onClick={openAdd}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-95"
                        >
                            <Plus className="w-4 h-4" /> Add New Job Opening
                        </button>
                    </div>
                </div>

                {/* Section Heading & Card Labels */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/70 p-4 rounded-2xl border border-gray-100">
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Left Column Heading
                        </label>
                        <input
                            type="text"
                            value={data.section1Title ?? ''}
                            onChange={(e) => set('section1Title', e.target.value)}
                            placeholder="Current Openings"
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Selection Helper Label
                        </label>
                        <input
                            type="text"
                            value={(data as any).section1Subtitle ?? ''}
                            onChange={(e) => set('section1Subtitle', e.target.value)}
                            placeholder="Select a role to apply"
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Job Card Apply Button Label
                        </label>
                        <input
                            type="text"
                            value={(data as any).cardButtonLabel ?? ''}
                            onChange={(e) => set('cardButtonLabel', e.target.value)}
                            placeholder="Apply for this Role"
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>

                {/* Search & Status Filters Bar (Matches Products.tsx) */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:max-w-2xl">
                        <div className="relative w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by role title, department, location..."
                                className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>
                        <select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            aria-label="Filter jobs by department"
                            className="w-full sm:w-auto shrink-0 border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                        >
                            <option value="all">All Departments ({openings.length})</option>
                            {departments.map((dept) => {
                                const count = openings.filter(
                                    (j) => (j.department || '').toLowerCase() === dept.toLowerCase()
                                ).length;
                                return (
                                    <option key={dept} value={dept}>
                                        {dept} ({count})
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl self-stretch sm:self-auto shrink-0">
                        {(['all', 'active', 'inactive'] as const).map((tab) => {
                            const count =
                                tab === 'all'
                                    ? openings.length
                                    : tab === 'active'
                                        ? openings.filter((j) => j.active !== false).length
                                        : openings.filter((j) => j.active === false).length;
                            return (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setStatusFilter(tab)}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all flex items-center gap-1.5 ${
                                        statusFilter === tab
                                            ? 'bg-white text-blue-600 shadow-xs'
                                            : 'text-slate-500 hover:text-slate-900'
                                    }`}
                                >
                                    <span>{tab}</span>
                                    <span
                                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                            statusFilter === tab
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'bg-slate-200 text-slate-600'
                                        }`}
                                    >
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Concise Product-Style Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-gray-100">
                                <tr>
                                    {[
                                        'Role Details',
                                        'Department',
                                        'Location & Type',
                                        'Experience',
                                        'Requirements',
                                        'Visibility',
                                        'Actions',
                                    ].map((h) => (
                                        <th
                                            key={h}
                                            className="px-5 py-3.5 text-left font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                                            {openings.length === 0
                                                ? 'No job openings added yet. Click "+ Add New Job Opening" above to post a role.'
                                                : 'No job openings match your search filters.'}
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map(({ job, idx }) => {
                                        const isActive = job.active !== false;
                                        const reqCount = Array.isArray(job.requirements)
                                            ? job.requirements.filter(Boolean).length
                                            : 0;
                                        return (
                                            <tr
                                                key={job.id || idx}
                                                className="hover:bg-blue-50/30 transition-colors group"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                        {job.title || 'Untitled Role'}
                                                    </div>
                                                    <div className="text-slate-400 text-xs font-medium truncate max-w-[260px] mt-0.5">
                                                        {job.description}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="inline-block text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                                                        {job.department || 'General'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                                                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                        <span>{job.location || '—'}</span>
                                                    </div>
                                                    <div className="text-[11px] text-blue-600 font-bold mt-0.5">
                                                        {job.type || 'Full-time'}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
                                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                        {job.experience || '—'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                                                        {reqCount} {reqCount === 1 ? 'item' : 'items'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-block text-[10px] font-black uppercase text-center px-2.5 py-1 rounded-full border ${
                                                            isActive
                                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                                : 'bg-red-50 text-red-600 border-red-100'
                                                        }`}
                                                    >
                                                        {isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            title="Edit job opening"
                                                            onClick={() => openEdit(idx)}
                                                            className="p-2 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-xs border border-gray-100 hover:border-blue-600"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            title={isActive ? 'Hide role from page' : 'Restore role on page'}
                                                            onClick={() => handleToggleActive(idx)}
                                                            className={`p-2 rounded-xl transition-all shadow-xs border border-gray-100 ${
                                                                isActive
                                                                    ? 'text-amber-600 hover:bg-amber-600 hover:text-white hover:border-amber-600'
                                                                    : 'text-emerald-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-600'
                                                            }`}
                                                        >
                                                            {isActive ? (
                                                                <EyeOff className="w-4 h-4" />
                                                            ) : (
                                                                <RotateCcw className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            title="Delete job opening"
                                                            onClick={() => handleDeleteJob(idx)}
                                                            className="p-2 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-xs border border-gray-100 hover:border-red-600"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* 3. Application Form Sidebar Section (Full Form Controls) */}
            <section className="space-y-8">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <div>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">
                            Submit Your Application Form (Right Column)
                        </h4>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Configure every heading, input label, placeholder, experience option, and confirmation message on the application form
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => set('hideForm', !data.hideForm)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            data.hideForm
                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                    >
                        {data.hideForm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {data.hideForm ? 'Hidden / Draft' : 'Live on Page'}
                    </button>
                </div>

                {/* 3A. Form Header & Primary CTA */}
                <div className="rounded-2xl border border-gray-200 bg-slate-50/50 p-5 space-y-4">
                    <h5 className="text-[11px] font-black text-slate-600 uppercase tracking-wider">
                        Form Header &amp; Submit Button
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-700">Form Heading</label>
                            <input
                                type="text"
                                value={(data as any).formTitle ?? ''}
                                onChange={(e) => set('formTitle', e.target.value)}
                                placeholder="Submit Your Application"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-700">Submit Button Label</label>
                            <input
                                type="text"
                                value={(data as any).formButtonLabel ?? ''}
                                onChange={(e) => set('formButtonLabel', e.target.value)}
                                placeholder="Submit Application"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-700">Selected Role Prefix Text</label>
                            <input
                                type="text"
                                value={(data as any).formApplyingPrefix ?? ''}
                                onChange={(e) => set('formApplyingPrefix', e.target.value)}
                                placeholder="Applying for:"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-700">Fallback Role Name (When None Selected)</label>
                            <input
                                type="text"
                                value={(data as any).formDefaultRole ?? ''}
                                onChange={(e) => set('formDefaultRole', e.target.value)}
                                placeholder="General Application"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* 3B. Input Field Labels & Placeholders */}
                <div className="rounded-2xl border border-gray-200 bg-slate-50/50 p-5 space-y-5">
                    <h5 className="text-[11px] font-black text-slate-600 uppercase tracking-wider">
                        Form Field Labels &amp; Placeholders
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Full Name */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-700">Full Name Label</label>
                            <input
                                type="text"
                                value={(data as any).formNameLabel ?? ''}
                                onChange={(e) => set('formNameLabel', e.target.value)}
                                placeholder="Full Name *"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-700">Full Name Placeholder</label>
                            <input
                                type="text"
                                value={(data as any).formNamePlaceholder ?? ''}
                                onChange={(e) => set('formNamePlaceholder', e.target.value)}
                                placeholder="Enter your full name"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-700">Email Label</label>
                            <input
                                type="text"
                                value={(data as any).formEmailLabel ?? ''}
                                onChange={(e) => set('formEmailLabel', e.target.value)}
                                placeholder="Email *"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-700">Email Placeholder</label>
                            <input
                                type="text"
                                value={(data as any).formEmailPlaceholder ?? ''}
                                onChange={(e) => set('formEmailPlaceholder', e.target.value)}
                                placeholder="you@email.com"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>

                        {/* Phone */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-700">Phone Number Label</label>
                            <input
                                type="text"
                                value={(data as any).formPhoneLabel ?? ''}
                                onChange={(e) => set('formPhoneLabel', e.target.value)}
                                placeholder="Phone Number *"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-700">Phone Number Placeholder</label>
                            <input
                                type="text"
                                value={(data as any).formPhonePlaceholder ?? ''}
                                onChange={(e) => set('formPhonePlaceholder', e.target.value)}
                                placeholder="+91 98765 43210"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>

                        {/* Position Applied For */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-700">Position Field Label</label>
                            <input
                                type="text"
                                value={(data as any).formRoleLabel ?? ''}
                                onChange={(e) => set('formRoleLabel', e.target.value)}
                                placeholder="Position Applied For *"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-700">Position Field Placeholder</label>
                            <input
                                type="text"
                                value={(data as any).formRolePlaceholder ?? ''}
                                onChange={(e) => set('formRolePlaceholder', e.target.value)}
                                placeholder="Selected role or desired position"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>

                        {/* Years of Experience */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-700">Experience Field Label</label>
                            <input
                                type="text"
                                value={(data as any).formExpLabel ?? ''}
                                onChange={(e) => set('formExpLabel', e.target.value)}
                                placeholder="Years of Experience *"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-700">Experience Dropdown Placeholder</label>
                            <input
                                type="text"
                                value={(data as any).formExpPlaceholder ?? ''}
                                onChange={(e) => set('formExpPlaceholder', e.target.value)}
                                placeholder="Select experience level"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>

                        {/* Cover Note */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-700">Cover Note Label</label>
                            <input
                                type="text"
                                value={(data as any).formMessageLabel ?? ''}
                                onChange={(e) => set('formMessageLabel', e.target.value)}
                                placeholder="Cover Note / Highlights *"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-700">Cover Note Placeholder</label>
                            <input
                                type="text"
                                value={(data as any).formMessagePlaceholder ?? ''}
                                onChange={(e) => set('formMessagePlaceholder', e.target.value)}
                                placeholder="Briefly highlight your notable achievements..."
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>

                        {/* Resume Upload */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-700">Resume Upload Label</label>
                            <input
                                type="text"
                                value={(data as any).formResumeLabel ?? ''}
                                onChange={(e) => set('formResumeLabel', e.target.value)}
                                placeholder="Upload Resume (PDF, DOC, DOCX) *"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-700">Resume Upload Dropzone Text</label>
                            <input
                                type="text"
                                value={(data as any).formResumePrompt ?? ''}
                                onChange={(e) => set('formResumePrompt', e.target.value)}
                                placeholder="Click or drag file here to attach resume"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                            <label className="block text-xs font-bold text-gray-700">Resume File Format / Size Hint</label>
                            <input
                                type="text"
                                value={(data as any).formResumeHint ?? ''}
                                onChange={(e) => set('formResumeHint', e.target.value)}
                                placeholder="PDF, DOC, or DOCX up to 10 MB"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* 3C. Experience Level Dropdown Options */}
                <div className="rounded-2xl border border-gray-200 bg-slate-50/50 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h5 className="text-[11px] font-black text-slate-600 uppercase tracking-wider">
                                Experience Dropdown Options ({experienceOptions.length})
                            </h5>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Options shown in the &ldquo;Years of Experience&rdquo; select menu on the form
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={addExpOption}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all shadow-xs"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Option
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {experienceOptions.map((opt, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => setExpOption(idx, e.target.value)}
                                    placeholder="e.g. 2-5 years (Mid Level)"
                                    className="flex-1 bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeExpOption(idx)}
                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3D. Post-Submission Confirmation Screen */}
                <div className="rounded-2xl border border-gray-200 bg-slate-50/50 p-5 space-y-4">
                    <h5 className="text-[11px] font-black text-slate-600 uppercase tracking-wider">
                        Submission Confirmation Screen (After Applying)
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-700">Success Heading</label>
                            <input
                                type="text"
                                value={(data as any).successTitle ?? ''}
                                onChange={(e) => set('successTitle', e.target.value)}
                                placeholder="Application Received"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-700">Reset Button Label</label>
                            <input
                                type="text"
                                value={(data as any).successButtonLabel ?? ''}
                                onChange={(e) => set('successButtonLabel', e.target.value)}
                                placeholder="Apply for Another Role"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                            <label className="block text-xs font-bold text-gray-700">Success Confirmation Message</label>
                            <textarea
                                rows={2}
                                value={(data as any).successMessage ?? ''}
                                onChange={(e) => set('successMessage', e.target.value)}
                                placeholder="Thank you for applying. Our talent acquisition team will review your credentials..."
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-y"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Product-Style Add / Edit Job Opening Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-in fade-in duration-200"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-200">
                        <div className="flex items-center justify-between px-8 py-6 border-b bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                                    {editingIndex !== null ? 'Edit Job Opening Details' : 'Post New Job Opening'}
                                </h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
                                    Talent Acquisition System
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 overflow-y-auto">
                            <div className="sm:col-span-2 space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">
                                    Job Title / Position Name *
                                </label>
                                <input
                                    type="text"
                                    value={editing.title}
                                    onChange={(e) => {
                                        setEditing({ ...editing, title: e.target.value });
                                        if (formErrors.title) setFormErrors((p) => ({ ...p, title: '' }));
                                    }}
                                    placeholder="e.g. Campus Infrastructure Architect"
                                    className={`w-full border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                                        formErrors.title
                                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/20'
                                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
                                    }`}
                                />
                                {formErrors.title && (
                                    <p className="text-[11px] font-bold text-red-500">{formErrors.title}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">
                                    Department *
                                </label>
                                <input
                                    type="text"
                                    value={editing.department}
                                    onChange={(e) => {
                                        setEditing({ ...editing, department: e.target.value });
                                        if (formErrors.department) setFormErrors((p) => ({ ...p, department: '' }));
                                    }}
                                    placeholder="e.g. Design & Architecture"
                                    className={`w-full border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                                        formErrors.department
                                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/20'
                                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
                                    }`}
                                />
                                {formErrors.department && (
                                    <p className="text-[11px] font-bold text-red-500">{formErrors.department}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">
                                    Location *
                                </label>
                                <input
                                    type="text"
                                    value={editing.location}
                                    onChange={(e) => {
                                        setEditing({ ...editing, location: e.target.value });
                                        if (formErrors.location) setFormErrors((p) => ({ ...p, location: '' }));
                                    }}
                                    placeholder="e.g. Bengaluru / Hybrid"
                                    className={`w-full border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                                        formErrors.location
                                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/20'
                                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
                                    }`}
                                />
                                {formErrors.location && (
                                    <p className="text-[11px] font-bold text-red-500">{formErrors.location}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">
                                    Employment Type *
                                </label>
                                <select
                                    value={editing.type}
                                    onChange={(e) => setEditing({ ...editing, type: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                >
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Hybrid">Hybrid</option>
                                    <option value="Remote">Remote</option>
                                    <option value="Internship">Internship</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">
                                    Experience Required *
                                </label>
                                <input
                                    type="text"
                                    value={editing.experience}
                                    onChange={(e) => {
                                        setEditing({ ...editing, experience: e.target.value });
                                        if (formErrors.experience) setFormErrors((p) => ({ ...p, experience: '' }));
                                    }}
                                    placeholder="e.g. 4-8 years"
                                    className={`w-full border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                                        formErrors.experience
                                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/20'
                                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
                                    }`}
                                />
                                {formErrors.experience && (
                                    <p className="text-[11px] font-bold text-red-500">{formErrors.experience}</p>
                                )}
                            </div>

                            <div className="sm:col-span-2 space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">
                                    Role Description *
                                </label>
                                <textarea
                                    rows={3}
                                    value={editing.description}
                                    onChange={(e) => {
                                        setEditing({ ...editing, description: e.target.value });
                                        if (formErrors.description) setFormErrors((p) => ({ ...p, description: '' }));
                                    }}
                                    placeholder="Describe responsibilities, impact, and scope of the role..."
                                    className={`w-full border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 transition-all resize-none ${
                                        formErrors.description
                                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/20'
                                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
                                    }`}
                                />
                                {formErrors.description && (
                                    <p className="text-[11px] font-bold text-red-500">{formErrors.description}</p>
                                )}
                            </div>

                            <div className="sm:col-span-2 space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">
                                        Key Requirements / Qualifications ({(editing.requirements || []).length})
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addRequirement}
                                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Add Requirement
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {(editing.requirements || []).map((req, rIdx) => (
                                        <div key={rIdx} className="flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                                                ✓
                                            </span>
                                            <input
                                                type="text"
                                                value={req}
                                                onChange={(e) => updateRequirement(rIdx, e.target.value)}
                                                placeholder="e.g. Degree in Architecture / Urban Planning"
                                                className="flex-1 border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeRequirement(rIdx)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="sm:col-span-2 pt-2">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        checked={editing.active !== false}
                                        onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                                    />
                                    <span className="text-xs font-black uppercase text-slate-600 group-hover:text-slate-900 transition-colors">
                                        Visible on Job Openings page
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 px-8 py-5 border-t bg-slate-50/50">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveModal}
                                disabled={syncing}
                                className="px-8 py-2.5 bg-blue-600 text-white text-sm font-black rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                            >
                                {syncing ? 'Saving...' : 'Sync with Database'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
