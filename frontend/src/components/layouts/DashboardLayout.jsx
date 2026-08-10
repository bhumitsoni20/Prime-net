import { useOutlet, useLocation, ScrollRestoration } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';

import PaymentApprovalHandler from '../../components/PaymentApprovalHandler';

const DashboardLayout = () => {
  const location = useLocation();
  const outlet = useOutlet();
  
  const isChatsPage = location.pathname.startsWith('/dashboard/chats');

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <PaymentApprovalHandler />
      {!isChatsPage && <Sidebar />}
      <main className={`pt-16 min-h-screen overflow-x-hidden ${isChatsPage ? '' : 'lg:pl-[240px]'}`}>
        <div className="p-4 sm:p-5 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              {outlet}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <ScrollRestoration />
    </div>
  );
};

export default DashboardLayout;
