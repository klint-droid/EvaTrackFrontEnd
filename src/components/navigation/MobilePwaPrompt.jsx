import React, { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { promptPwaInstall, isPwaInstallAvailable } from "../../registerServiceWorker";

const DISMISS_KEY = "evatrack:pwa-prompt-dismissed";

const MobilePwaPrompt = () => {
    const [canInstall, setCanInstall] = useState(false);
    const [isDismissed, setIsDismissed] = useState(true);
    const [installing, setInstalling] = useState(false);

    useEffect(() => {
        // Check if user already dismissed in this session
        const dismissed = sessionStorage.getItem(DISMISS_KEY) === "true";
        setIsDismissed(dismissed);

        if (isPwaInstallAvailable() && !dismissed) {
            setCanInstall(true);
        }

        const handlePwaEvent = (e) => {
            const available = Boolean(e.detail?.installable);
            const isDismissedNow = sessionStorage.getItem(DISMISS_KEY) === "true";
            if (available && !isDismissedNow) {
                setCanInstall(true);
            } else {
                setCanInstall(false);
            }
        };

        window.addEventListener("evatrack:pwa-installable", handlePwaEvent);
        return () => window.removeEventListener("evatrack:pwa-installable", handlePwaEvent);
    }, []);

    const handleInstall = async () => {
        setInstalling(true);
        try {
            await promptPwaInstall();
        } finally {
            setInstalling(false);
            setCanInstall(false);
        }
    };

    const handleDismiss = () => {
        sessionStorage.setItem(DISMISS_KEY, "true");
        setIsDismissed(true);
        setCanInstall(false);
    };

    if (!canInstall || isDismissed) {
        return null;
    }

    return (
        /* Only visible on mobile screens (lg:hidden) */
        <div className="fixed bottom-[68px] inset-x-3 z-40 lg:hidden animate-in slide-in-from-bottom-3 duration-300 pointer-events-auto">
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-blue-500/30 dark:border-blue-500/30 p-3.5 shadow-2xl flex items-center justify-between gap-3 ring-1 ring-black/5 dark:ring-white/5">
                {/* Left: App Logo & Prompt Message */}
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                        <Download size={20} strokeWidth={2.3} />
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                            Do you want to install EvaTrack?
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            Install on your device for fast offline access
                        </p>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                        type="button"
                        onClick={handleInstall}
                        disabled={installing}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all"
                    >
                        {installing ? "Installing..." : "Install"}
                    </button>
                    <button
                        type="button"
                        onClick={handleDismiss}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Dismiss install prompt"
                        title="Dismiss"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MobilePwaPrompt;
