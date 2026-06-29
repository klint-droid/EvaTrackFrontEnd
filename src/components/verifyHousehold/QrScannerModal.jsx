import React from "react";
import { createPortal } from "react-dom";
import { QrCode, X, Keyboard } from "lucide-react";
import QRScanner from "../QRScanner";

export default function QrScannerModal({
    qrModalOpen,
    setQrModalOpen,
    handleScan,
    setTab
}) {
    if (!qrModalOpen) return null;

    return createPortal(
        <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9999] p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 animate-in fade-in duration-200"
                onClick={() => setQrModalOpen(false)}
            />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 flex flex-col">
                {/* Modal Header */}
                <div className="w-full flex items-center justify-between bg-white px-5 py-4 border-b border-slate-150">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <QrCode size={18} className="text-slate-700" />
                        Scan Household QR Code
                    </h3>
                    <button
                        onClick={() => setQrModalOpen(false)}
                        className="p-1 text-slate-400 hover:bg-slate-100 rounded-full transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* QR Scanner viewport box */}
                <div className="w-full aspect-square bg-slate-950 flex items-center justify-center overflow-hidden relative">
                    <QRScanner onScan={(id) => {
                        setQrModalOpen(false);
                        handleScan(id);
                    }} />

                    {/* Visual scan targets - glowing corner brackets */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-56 h-56 relative">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-[4px] border-l-[4px] border-blue-400 rounded-tl-xl" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-[4px] border-r-[4px] border-blue-400 rounded-tr-xl" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[4px] border-l-[4px] border-blue-400 rounded-bl-xl" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[4px] border-r-[4px] border-blue-400 rounded-br-xl" />
                        </div>
                    </div>
                </div>

                {/* Viewport Status Row */}
                <div className="w-full bg-slate-50 border-b border-slate-150 py-3.5 px-5 text-center flex flex-col items-center justify-center gap-2">
                    <p className="text-xs text-slate-500 font-medium leading-tight">
                        Align the QR code within the frame to scan automatically.
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 font-bold rounded-full text-[9px] uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        Camera Active
                    </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="w-full bg-white px-5 py-4 flex items-center justify-between gap-4">
                    <button
                        onClick={() => setQrModalOpen(false)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-all"
                    >
                        <X size={14} />
                        Cancel
                    </button>

                    <button
                        onClick={() => {
                            setQrModalOpen(false);
                            setTab("admit");
                            setTimeout(() => {
                                const inputEl = document.querySelector('input[placeholder="Enter Household Name or Official ID..."]');
                                if (inputEl) inputEl.focus();
                            }, 150);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-950 text-white hover:bg-slate-900 active:scale-95 rounded-lg text-xs font-semibold transition-all shadow-sm"
                    >
                        <Keyboard size={14} />
                        Enter ID Manually
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
