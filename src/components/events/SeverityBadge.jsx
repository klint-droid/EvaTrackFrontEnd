const SEVERITY_STYLES = {
    low:      { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    moderate: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    high:     { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

const DEFAULT_STYLE = { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' };

export default function SeverityBadge({ severity }) {
    if (!severity) return <span className="text-slate-300 text-xs">—</span>;

    const key = severity.severity_key?.toLowerCase();
    const style = SEVERITY_STYLES[key] || DEFAULT_STYLE;

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
            {severity.severity_label}
        </span>
    );
}