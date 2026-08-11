import React from 'react';
import { HiRefresh, HiExclamationCircle } from 'react-icons/hi';
import Button from '../ui/Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
    
    // Check if error is due to stale dynamic import chunk (new deployment)
    const isChunkError =
      error?.name === 'TypeError' ||
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('Importing a module script failed');

    if (isChunkError) {
      const key = 'streamkart_chunk_reload_eb';
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, 'true');
        window.location.reload();
      }
    }
  }

  handleReload = () => {
    sessionStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isChunkError =
        this.state.error?.message?.includes('Failed to fetch dynamically imported module') ||
        this.state.error?.message?.includes('Importing a module script failed');

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
          <div className="bg-white rounded-[24px] border border-[#E2E8F0] shadow-xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 text-[#5B4BFF]">
              <HiExclamationCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-[#0F172A] mb-2 tracking-tight">
              {isChunkError ? 'New Version Available!' : 'Something went wrong'}
            </h2>
            <p className="text-[#64748B] text-sm mb-6 font-medium leading-relaxed">
              {isChunkError
                ? 'StreamKart has just been updated with new improvements. Please reload the page to continue.'
                : 'An unexpected application error occurred. Click below to refresh the page.'}
            </p>
            <Button
              onClick={this.handleReload}
              className="w-full flex items-center justify-center gap-2 bg-[#5B4BFF] hover:bg-[#4F46E5] text-white font-extrabold py-3 rounded-[14px]"
              size="lg"
            >
              <HiRefresh className="w-5 h-5" />
              Reload StreamKart
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
