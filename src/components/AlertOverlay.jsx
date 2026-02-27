export default function AlertOverlay({ foulAlert, setFoulAlert }) {
    if (!foulAlert) return null;

    return (
        <div className="absolute inset-0 bg-black/85 flex items-center justify-center z-[100] p-6 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden text-center flex flex-col animate-[pulse_1.5s_ease-in-out_infinite]">
                {foulAlert.type === 'blue' && <div className="bg-blue-600 text-white p-6"><h2 className="text-4xl font-black uppercase tracking-wider">Blue Card</h2></div>}
                {foulAlert.type === 'yellow' && <div className="bg-yellow-400 text-black p-6"><h2 className="text-4xl font-black uppercase tracking-wider">Yellow Card</h2></div>}
                {foulAlert.type === 'red' && <div className="bg-red-600 text-white p-6"><h2 className="text-4xl font-black uppercase tracking-wider">Red Card</h2></div>}
                {foulAlert.type === 'warning' && <div className="bg-yellow-400 text-black p-6"><h2 className="text-3xl font-black uppercase tracking-wider">{foulAlert.title}</h2></div>}
                <div className="p-8">
                    <p className="text-3xl font-black text-gray-800 mb-2">#{foulAlert.player?.number} {foulAlert.player?.name}</p>
                    <p className="text-xl font-bold text-gray-600 mb-8">{foulAlert.message}</p>
                    <button onClick={() => setFoulAlert(null)} className="w-full py-4 bg-slate-800 text-white font-black text-xl rounded-xl hover:bg-slate-700 transition shadow-lg">Acknowledge</button>
                </div>
            </div>
        </div>
    );
}