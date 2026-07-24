import Spinner from './Spinner';

const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <div className="relative">
      <div className="absolute inset-0 rounded-full bg-[#5B4BFF]/10 animate-ping" style={{ animationDuration: '1.5s' }} />
      <Spinner size="lg" />
    </div>
    <p className="text-[#94A3B8] text-sm font-medium animate-pulse">Loading...</p>
  </div>
);

export default PageLoader;
