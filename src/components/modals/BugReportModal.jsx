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
        } catch (error) {
            setStatus('ERROR');
        }
    };

    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[300] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
                    <h2 className="text-xl font-black uppercase tracking-wider">Report an Issue</h2>
                    <button onClick={onClose} className="text-slate-300 hover:text-white font-bold">✕ Close</button>
                </div>

                {status === 'SUCCESS' ? (
                    <div className="p-8 text-center bg-gray-50 flex-1 flex flex-col items-center justify-center">
                        <div className="text-5xl mb-4">✅</div>
                        <h3 className="text-2xl font-black text-green-600 mb-2">Report Sent!</h3>
                        <p className="text-gray-600 font-bold">Thank you. The developer has been notified.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 bg-gray-50 flex-1 flex flex-col space-y-4">
                        <p className="text-sm text-gray-600 font-bold mb-2">
                            Found a bug or have a feature request? Let us know. App Version ({appVersion}) and your browser info will be automatically included.
                        </p>

                        <div className="flex space-x-4">
                            <div className="flex-1">
                                <label className="block text-xs font-black text-gray-500 uppercase mb-1">Your Name</label>
                                <input required type="text" className="w-full p-2 border-2 border-gray-300 rounded-lg font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-black text-gray-500 uppercase mb-1">Email (Optional)</label>
                                <input type="email" className="w-full p-2 border-2 border-gray-300 rounded-lg font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase mb-1">Issue Title</label>
                            <input required type="text" placeholder="e.g., App freezes when logging a Red Card" className="w-full p-2 border-2 border-gray-300 rounded-lg font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase mb-1">Description</label>
                            <textarea required rows="3" placeholder="What happened?" className="w-full p-2 border-2 border-gray-300 rounded-lg font-bold resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase mb-1">Steps to Reproduce</label>
                            <textarea rows="2" placeholder="1. Clicked this... 2. Entered that..." className="w-full p-2 border-2 border-gray-300 rounded-lg font-bold resize-none text-sm" value={formData.steps} onChange={e => setFormData({...formData, steps: e.target.value})}></textarea>
                        </div>

                        {status === 'ERROR' && <div className="text-red-600 text-sm font-bold text-center">Failed to send report. Please check your internet connection.</div>}

                        <button type="submit" disabled={status === 'SUBMITTING'} className="w-full py-3 mt-2 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
                            {status === 'SUBMITTING' ? 'SENDING...' : 'SUBMIT BUG REPORT'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}