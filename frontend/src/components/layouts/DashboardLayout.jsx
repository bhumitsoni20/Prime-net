import { useOutlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';

const DashboardLayout = () => {
  const location = useLocation();
  const outlet = useOutlet();
  
  const isChatsPage = location.pathname.startsWith('/dashboard/chats');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {!isChatsPage && <Sidebar />}
      <main className={`pt-20 min-h-screen overflow-x-hidden ${isChatsPage ? '' : 'lg:pl-60'}`}>
        <div className="p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {outlet}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
