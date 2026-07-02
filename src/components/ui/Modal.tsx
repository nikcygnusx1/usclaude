import { useEffect, useRef, ReactNode } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
interface ModalProps { isOpen: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; className?: string; }
export function Modal({ isOpen, onClose, title, children, footer, className }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (isOpen) { document.body.style.overflow = 'hidden'; dialogRef.current?.focus(); } else { document.body.style.overflow = ''; } return () => { document.body.style.overflow = ''; }; }, [isOpen]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={dialogRef} tabIndex={-1} className={clsx('relative w-full max-w-lg rounded-lg border border-line bg-card shadow-xl p-0 outline-none', className)} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-line"><h2 className="text-lg font-semibold">{title}</h2><button onClick={onClose} className="rounded p-1 text-grey hover:bg-ice-soft" aria-label="Close"><X size={18} /></button></div>
        <div className="px-4 py-3">{children}</div>
        {footer && <div className="px-4 py-3 border-t border-line flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
