import React from 'react';

const labelCls = "block text-sm font-bold text-slate-600 dark:text-slate-300 mb-1";
const inputCls = "w-full min-h-11 px-3 text-base border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 dark:text-slate-100 dark:[color-scheme:dark]";

export default function MatchInfoBlock({ gameData, handleInputChange }) {
    return (
        <div className="grid grid-cols-2 landscape:md:grid-cols-3 landscape:lg:grid-cols-5 gap-4">
            <div>
                <label className={labelCls}>Game Number</label>
                <input type="text" name="gameNumber" placeholder="e.g. 25MASL3-001" value={gameData.gameNumber || ''} onChange={handleInputChange} className={`${inputCls} uppercase`} />
            </div>
            <div>
                <label className={labelCls}>Date</label>
                <input type="date" name="date" value={gameData.date || ''} onChange={handleInputChange} className={inputCls} />
            </div>
            <div>
                <label className={labelCls}>Scheduled KO</label>
                <input type="time" name="scheduledKO" value={gameData.scheduledKO || ''} onChange={handleInputChange} className={inputCls} />
            </div>
            <div>
                <label className={labelCls}>Venue</label>
                <input type="text" name="venue" value={gameData.venue || ''} onChange={handleInputChange} className={inputCls} />
            </div>
            <div>
                <label className={labelCls}>City</label>
                <input type="text" name="city" value={gameData.city || ''} onChange={handleInputChange} className={inputCls} />
            </div>
        </div>
    );
}
