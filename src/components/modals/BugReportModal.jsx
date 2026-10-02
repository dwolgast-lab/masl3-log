import React, { useState } from 'react';

export default function BugReportModal({ isOpen, onClose, appVersion }) {
    const [status, setStatus] = useState('IDLE'); // IDLE, SUBMITTING, SUCCESS, ERROR
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        title: '',
        description: '',
        steps: ''
    });

    if (!isOpen) return null;

    // Grab the user's device info automatically
    const systemInfo = navigator.userAgent;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('SUBMITTING');

        // REPLACE THIS URL WITH YOUR FORMSPREE ENDPOINT
        const FORMSPREE_URL = "https://formspree.io/f/mkoqkpjb";

        const payload = {
            ...formData,
            appVersion: appVersion,
            systemInfo: systemInfo,
            _subject: `MASL App Bug: ${formData.title}`
        };

        try {
            const response = await fetch(FORMSPREE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setStatus('SUCCESS');
                setTimeout(() => {
                    setStatus('IDLE');
                    onClose();
                }, 2000);
            } else {
                setStatus('ERROR');
            }
        } catch {
            setStatus('ERROR');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[300] p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90dvh] overflow-hidden flex flex-col">
                <div className="bg-slate-800 dark:bg-slate-950 p-4 text-white flex justify-between items-center gap-3 shrink-0">
                    <h2 className="text-xl font-black uppercase tracking-wider">Report an Issue</h2>
                    <button onClick={onClose} className="min-h-11 px-3 text-slate-300 hover:text-white font-bold rounded active:scale-[0.97] active:brightness-95 transition">✕ Close</button>
                </div>

                {status === 'SUCCESS' ? (
                    <div className="p-8 text-center bg-slate-50 dark:bg-slate-800 flex-1 flex flex-col items-center justify-center">
                        <div className="text-5xl mb-4">✅</div>
                        <h3 className="text-2xl font-black text-green-600 dark:text-green-400 mb-2">Report Sent!</h3>
                        <p className="text-slate-600 dark:text-slate-300 font-bold">Thank you. The developer has been notified.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-4 md:p-6 bg-slate-50 dark:bg-slate-800 flex-1 min-h-0 overflow-y-auto flex flex-col space-y-4">
                        <p className="text-sm text-slate-600 dark:text-slate-300 font-bold mb-2">
                            Found a bug or have a feature request? Let us know. App Version ({appVersion}) and your browser info will be automatically included.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Your Name</label>
                                <input required type="text" className="w-full min-h-11 px-3 border-2 border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-lg font-bold text-base" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Email (Optional)</label>
                                <input type="email" className="w-full min-h-11 px-3 border-2 border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-lg font-bold text-base" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Issue Title</label>
                            <input required type="text" placeholder="e.g., App freezes when logging a Red Card" className="w-full min-h-11 px-3 border-2 border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-lg font-bold text-base" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Description</label>
                            <textarea required rows="3" placeholder="What happened?" className="w-full p-2 border-2 border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-lg font-bold text-base resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Steps to Reproduce</label>
                            <textarea rows="2" placeholder="1. Clicked this... 2. Entered that..." className="w-full p-2 border-2 border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-lg font-bold text-base resize-none" value={formData.steps} onChange={e => setFormData({...formData, steps: e.target.value})}></textarea>
                        </div>

                        {status === 'ERROR' && <div className="text-red-600 dark:text-red-400 text-sm font-bold text-center">Failed to send report. Please check your internet connection.</div>}

                        <button type="submit" disabled={status === 'SUBMITTING'} className="w-full min-h-11 py-3 mt-2 shrink-0 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 active:scale-[0.97] active:brightness-95 transition disabled:opacity-50">
                            {status === 'SUBMITTING' ? 'SENDING...' : 'SUBMIT BUG REPORT'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}