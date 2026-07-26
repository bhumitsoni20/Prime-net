import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import { apiPost } from '../../services/api';
import useAuthStore from '../../store/authStore';

const categories = [
  'ott',
  'ai-tools',
  'vpn',
  'education',
  'software',
  'cloud-storage',
  'music',
  'gaming',
  'other',
];

const RequestProduct = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    priority: 'Medium',
    duration: '',
    referenceUrl: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in to request a product');
      navigate('/login?redirect=/request-product');
      return;
    }

    try {
      setLoading(true);
      await apiPost('/requests', {
        ...formData,
        duration: formData.duration ? Number(formData.duration) : undefined,
      });
      toast.success('Product request submitted successfully!');
      navigate('/dashboard/my-requests');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Request a Product</h1>
          <p className="mt-4 text-lg text-gray-600">
            Can't find the subscription or digital product you need? Let us know, and our sellers will source it for you!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 sm:p-10"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#5B4BFF] focus:border-transparent transition-all outline-none"
                  placeholder="e.g. Adobe Creative Cloud 1 Year"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  id="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#5B4BFF] focus:border-transparent transition-all outline-none bg-white"
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                  Priority *
                </label>
                <select
                  name="priority"
                  id="priority"
                  required
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#5B4BFF] focus:border-transparent transition-all outline-none bg-white"
                >
                  <option value="Low">Low - Just exploring</option>
                  <option value="Medium">Medium - Would like to buy soon</option>
                  <option value="High">High - Need it immediately</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description & Requirements *
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={4}
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#5B4BFF] focus:border-transparent transition-all outline-none resize-none"
                  placeholder="Describe exactly what you are looking for... (e.g. Need a private account, not shared)"
                />
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Subscription Duration (Optional, Months)
                </label>
                <input
                  type="number"
                  name="duration"
                  id="duration"
                  min="1"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#5B4BFF] focus:border-transparent transition-all outline-none"
                  placeholder="e.g. 12"
                />
              </div>

              <div>
                <label htmlFor="referenceUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Reference URL (Optional)
                </label>
                <input
                  type="url"
                  name="referenceUrl"
                  id="referenceUrl"
                  value={formData.referenceUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#5B4BFF] focus:border-transparent transition-all outline-none"
                  placeholder="Link to official product page"
                />
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full py-4 text-base rounded-xl bg-gradient-to-r from-[#5B4BFF] to-[#7C3AED] shadow-lg shadow-[#5B4BFF]/30" isLoading={loading}>
                Submit Request
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default RequestProduct;
