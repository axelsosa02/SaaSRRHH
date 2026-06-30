// components/ui/NativeSelect.tsx
interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    children: React.ReactNode
}

export function NativeSelect({ children, className, ...props }: NativeSelectProps) {
    return (
        <div className="relative">
            <select
                className={`block h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-[#472825] shadow-sm outline-none focus:border-[#472825] focus:ring-1 focus:ring-[#472825] appearance-none cursor-pointer pr-10 ${className || ''}`}
                {...props}
            >
                {children}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg className="h-4 w-4 text-[#96786f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </div>
        </div>
    )
}