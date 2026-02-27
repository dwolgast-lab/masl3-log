import { formatTimer } from '../utils';

export default function TimerOverlay({ appTimer, setAppTimer }) {
    if (!appTimer.active) return null;

    if (appTimer.minimized) {
        return (
            <div className="bg-slate-900 text-white flex justify-between items-center px-8 py-3 shadow-lg z-40 border-b border-slate-950">
                <div className="flex items-center space-x-6">
                    <span className="font-black tracking-widest text-blue-400 uppercase text-sm">{appTimer.label}</span>
                    <span className="text-3xl font-mono font-black tabular-nums tracking-wider">{appTimer.time > 0 ? formatTimer(appTimer.time) : "0:00"}</span>
                </div>
                <div className="flex space-x-4">
                    <button onClick={() => setAppTimer(prev => ({...prev, minimized: false}))} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded font-bold text-sm shadow transition">
                        ⤢ Expand Fullscreen
                    </button>
                    <button onClick={() => setAppTimer({active: false, time: 0, initialTime: 0, label: '', minimized: false})} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-bold text-sm shadow transition">
                        Dismiss
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-[200] backdrop-blur-md p-8">
            <div className="bg-white rounded-3xl p-16 flex flex-col items-center shadow-2xl border-4 border-slate-800 w-full max-w-2xl relative">
                <button onClick={() => setAppTimer(prev => ({ ...prev, minimized: true }))} className="absolute top-6 right-8 text-gray-400 hover:text-gray-800 font-bold flex items-center bg-gray-100 px-4 py-2 rounded-lg transition">
                    ⬇ Minimize to Top
                </button>
                <h2 className="text-4xl font-black uppercase text-gray-800 mb-6 tracking-widest">{appTimer.label}</h2>
                
                <div className="text-9xl font-mono font-black text-blue-600 mb-12 tracking-tighter tabular-nums drop-shadow-md flex flex-col items-center">
                    {appTimer.time > 0 ? formatTimer(appTimer.time) : "0:00"}
                    {appTimer.time <= 0 && <span className="text-red-500 text-3xl mt-4 animate-pulse uppercase tracking-widest">Expired</span>}
                </div>
                
                <div className="flex space-x-6 w-full">
                    <button onClick={() => setAppTimer({ active: false, time: 0, initialTime: 0, label: '', minimized: false })} className="flex-1 py-5 bg-blue-600 font-black text-xl text-white rounded-2xl shadow-xl hover:bg-blue-700 transition">
                        Close Timer
                    </button>
                </div>
            </div>
        </div>
    );
}