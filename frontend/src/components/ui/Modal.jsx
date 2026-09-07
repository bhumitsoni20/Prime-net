import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX } from 'react-icons/hi';

const Modal = ({ isOpen, onClose, title, subtitle, children, footer, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[#0F172A]/55 backdrop-blur-[8px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 5 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className={`relative ${sizes[size] || sizes.md} w-full max-h-[90vh] bg-white border border-[#E2E8F0] rounded-[24px] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.3)] flex flex-col my-auto z-10 overflow-hidden`}
          >
            {title ? (
              <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#F1F5F9] flex-shrink-0 bg-white">
                <div>
                  <h3 className="text-[17px] font-bold text-[#0F172A]">{title}</h3>
                  {subtitle && <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
                </div>
                <button
                  onClick={onClose}
                  className="text-[#94A3B8] hover:text-[#0F172A] transition-colors p-1.5 rounded-xl hover:bg-[#F1F5F9]"
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 text-[#94A3B8] hover:text-[#0F172A] transition-colors p-1.5 rounded-xl hover:bg-[#F1F5F9]"
              >
                <HiX className="w-5 h-5" />
              </button>
            )}

            <div className="p-5 sm:p-6 overflow-y-auto flex-1 overscroll-contain">
              {children}
            </div>

            {footer && (
              <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#F1F5F9] flex-shrink-0 flex items-center justify-between gap-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;


