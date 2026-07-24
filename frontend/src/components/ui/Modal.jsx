import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX } from 'react-icons/hi';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[6px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 5 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className={`relative ${sizes[size]} w-full bg-white border border-[#E2E8F0] rounded-[20px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)]`}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#F1F5F9]">
                <h3 className="text-[17px] font-bold text-[#0F172A]">{title}</h3>
                <button onClick={onClose} className="text-[#94A3B8] hover:text-[#475569] transition-colors p-1.5 rounded-[10px] hover:bg-[#F1F5F9]">
                  <HiX className="w-5 h-5" />
                </button>
              </div>
            )}
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
