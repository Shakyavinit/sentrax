import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
interface ModalProps { isOpen:boolean; onClose:()=>void; title:React.ReactNode; children:React.ReactNode; maxWidth?:'sm'|'md'|'lg'|'xl'|'2xl'|'4xl'|'5xl'|'6xl'; }
export const Modal: React.FC<ModalProps> = ({isOpen,onClose,title,children,maxWidth='xl'}) => {
  const ref=useRef<HTMLDialogElement>(null), titleId=useId();
  useEffect(()=> {
    const dialog=ref.current;
    if (isOpen && dialog && !dialog.open) dialog.showModal();
    if (!isOpen && dialog?.open) dialog.close();
    if (!isOpen) return;
    const previous=document.body.style.overflow;
    document.body.style.overflow='hidden';
    return ()=>{ document.body.style.overflow=previous; if(dialog?.open) dialog.close(); };
  },[isOpen]);
  const widths={sm:'max-w-sm',md:'max-w-md',lg:'max-w-lg',xl:'max-w-xl','2xl':'max-w-2xl','4xl':'max-w-4xl','5xl':'max-w-5xl','6xl':'max-w-6xl'};
  return createPortal(<dialog ref={ref} aria-labelledby={titleId} onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===e.currentTarget)onClose();}} className={`sentrax-dialog ${widths[maxWidth]}`}>
    <div className="dialog-content"><div className="dialog-heading"><h2 id={titleId}>{title}</h2><button className="icon-button" aria-label="Close modal" onClick={onClose}><X size={20}/></button></div><div className="dialog-body">{isOpen && children}</div></div>
  </dialog>,document.body);
};
