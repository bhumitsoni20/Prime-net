import { Link } from 'react-router-dom';
import { HiExclamationCircle } from 'react-icons/hi';
import Button from '../../components/ui/Button';

const PaymentCancel = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-10 max-w-md w-full text-center shadow-sm">
        <div className="h-20 w-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <HiExclamationCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-[#0F172A] mb-3">Payment Cancelled</h2>
        <p className="text-[#64748B] mb-8 leading-relaxed">
          Your payment process was interrupted. Don't worry, your cart is still intact. You can try again whenever you are ready.
        </p>
        <Link to="/cart">
          <Button size="lg" className="w-full">
            Return to Cart
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PaymentCancel;
