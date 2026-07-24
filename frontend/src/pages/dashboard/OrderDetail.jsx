import { useParams, Link } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const OrderDetail = () => {
  const { id } = useParams();
  return (
    <div>
      <Link to="/dashboard/orders" className="text-[#5B4BFF] text-[14px] font-semibold hover:text-[#4F3FE8] mb-6 inline-block transition-colors">← Back to Orders</Link>
      <h1 className="text-[28px] font-extrabold text-[#0F172A] mb-8 tracking-[-0.02em]">Order #{id?.slice(-6).toUpperCase()}</h1>
      <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] text-center">
        <p className="text-[#64748B] text-[15px] font-medium">Order details will load from your database.</p>
      </div>
    </div>
  );
};

export default OrderDetail;
