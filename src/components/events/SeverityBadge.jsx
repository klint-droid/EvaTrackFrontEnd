const SEVERITY_COLORS = {
    low:      'bg-green-100 text-green-700',
    moderate: 'bg-yellow-100 text-yellow-700',
    high:     'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
};

export default function SeverityBadge({ severity }) {
    if (!severity) return <span className="text-gray-400 text-xs">—</span>;

    const colorClass = SEVERITY_COLORS[severity.severity_key?.toLowerCase()] 
        ?? 'bg-gray-100 text-gray-600';  
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
            {severity.severity_label}
        </span>
    );
}