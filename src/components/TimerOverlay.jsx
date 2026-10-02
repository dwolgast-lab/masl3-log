import { formatTimer } from '../utils';

export default function TimerOverlay({ appTimer, setAppTimer }) {
    if (!appTimer.active) return null;

    if (appTimer.minimized) {
        return (
            <div className="bg-slate-900 text-white pt-safe shadow-lg z-40 border-b border-slate-950 shrink-0">
                <div className="flex justify-between items-center gap-2 px-4 md:px-8 py-3">
                    <div className="flex items-center gap-4 md:gap-6 min-w-0">
                        <span className="font-bold tracking-widest text-blue-400 uppercase text-sm truncate">{appTimer.label}</span>
                        <span className="text-3xl font-mono font-black tabular-nums tracking-wider">{appTimer.time > 0 ? formatTimer(appTimer.time) : "0:00"}</span>
                    </div>
                    <div className="flex gap-2 md:gap-4 shrink-0">
                        <button onClick={() => setAppTimer(prev => ({...prev, minimized: false}))} className="min-h-11 px-4 bg-slate-700 hover:bg-slate-600 rounded font-bold text-sm shadow transition active:scale-[0.97] active:brightness-95">
                            ⤢ Expand<span className="hidden md:inline"> Fullscreen</span>
                        </button>
                        <button onClick={() => setAppTimer({active: false, time: 0, initialTime: 0, label: '', minimized: false})} className="min-h-11 px-4 bg-red-600 hover:bg-red-700 rounded font-bold text-sm shadow transition active:scale-[0.97] active:brightness-95">
                            Dismiss
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-[200] backdrop-blur-md p-4 md:p-8">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-[clamp(1rem,4dvh,4rem)] flex flex-col items-center shadow-2xl border-4 border-slate-800 dark:border-slate-600 w-full max-w-2xl max-h-full overflow-y-auto relative">
                <div className="w-full flex justify-end mb-2">
                    <button onClick={() => setAppTimer(prev => ({ ...prev, minimized: true }))} className="min-h-11 text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white font-bold flex items-center bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-lg transition active:scale-[0.97] active:brightness-95">
                        ⬇ Minimize to Top
                    </button>
                </div>
                <h2 className="text-[clamp(1.5rem,5dvh,2.25rem)] font-black uppercase text-slate-800 dark:text-slate-100 mb-[2dvh] tracking-widest text-center">{appTimer.label}</h2>

                <div className="text-[clamp(4rem,22dvh,8rem)] leading-none font-mono font-black text-blue-600 dark:text-blue-400 mb-[3dvh] tracking-tighter tabular-nums drop-shadow-md flex flex-col items-center">
                    {appTimer.time > 0 ? formatTimer(appTimer.time) : "0:00"}
                    {appTimer.time <= 0 && <span className="text-red-500 text-3xl mt-4 animate-pulse uppercase tracking-widest">Expired</span>}
                </div>

                <div className="flex gap-6 w-full">
                    <button onClick={() => setAppTimer({ active: false, time: 0, initialTime: 0, label: '', minimized: false })} className="flex-1 min-h-14 py-4 bg-blue-600 font-black text-xl text-white rounded-2xl shadow-xl hover:bg-blue-700 transition active:scale-[0.97] active:brightness-95">
                        Close Timer
                    </button>
                </div>
            </div>
        </div>
    );
}
