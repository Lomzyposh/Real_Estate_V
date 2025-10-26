import React from 'react'

const Release = () => {
    return (
        <div
            className="fixed inset-0 z-50 grid place-items-center px-4"
            role="dialog"
            aria-modal="true"
            onClick={(e) => {
                if (e.target === e.currentTarget) closeModal();
            }}
        >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121426] shadow-lg">
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 dark:border-gray-800">
                    <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Suggest Release of Agency</h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                            Property: <span className="font-mono">{propertyId(modalProperty)}</span>
                        </p>
                    </div>
                    <button
                        onClick={closeModal}
                        aria-label="Close"
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100"
                    >
                        <FiX />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-4 sm:p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                            <label htmlFor="effectiveDate" className="text-sm text-gray-700 dark:text-gray-200">
                                Effective Date
                            </label>
                            <input
                                id="effectiveDate"
                                name="effectiveDate"
                                type="date"
                                value={form.effectiveDate}
                                onChange={onChange}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0f111a] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label htmlFor="altAgentEmail" className="text-sm text-gray-700 dark:text-gray-200">
                                Alternative Agent Email (optional)
                            </label>
                            <input
                                id="altAgentEmail"
                                name="altAgentEmail"
                                type="email"
                                value={form.altAgentEmail}
                                onChange={onChange}
                                placeholder="agent@example.com"
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0f111a] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="reason" className="text-sm text-gray-700 dark:text-gray-200">
                            Reason
                        </label>
                        <textarea
                            id="reason"
                            name="reason"
                            rows={3}
                            value={form.reason}
                            onChange={onChange}
                            placeholder="Provide a brief reason for releasing this agency…"
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0f111a] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-y text-gray-900 dark:text-gray-100"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="handoverNotes" className="text-sm text-gray-700 dark:text-gray-200">
                            Handover Notes (optional)
                        </label>
                        <textarea
                            id="handoverNotes"
                            name="handoverNotes"
                            rows={3}
                            value={form.handoverNotes}
                            onChange={onChange}
                            placeholder="Anything the next agent or owner should know…"
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0f111a] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-y text-gray-900 dark:text-gray-100"
                        />
                    </div>

                    {submitMessage && (
                        <div className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
                            {submitMessage}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-1">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg text-sm font-medium border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors text-gray-900 dark:text-gray-100"
                        >
                            Submit (Local Only)
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Release
