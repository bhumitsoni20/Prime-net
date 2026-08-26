import toast from 'react-hot-toast';

export const handleApiError = (error) => {
  if (!error.response) {
    toast.error('Network Error: Please check your connection.');
    return;
  }

  const { status, data } = error.response;
  const message = data?.message || 'An unexpected error occurred.';

  switch (status) {
    case 401:
      toast.error('Session expired. Please log in again.');
      break;
    case 403:
      toast.error(`Forbidden: ${message}`);
      break;
    case 404:
      toast.error('Resource not found.');
      break;
    case 409:
      toast.error(`Conflict: ${message}`);
      break;
    case 422:
      toast.error(`Validation Error: ${message}`);
      break;
    case 429:
      toast.error('Too many requests. Please try again later.');
      break;
    case 500:
      console.error('Server error. Our team has been notified.');
      break;
    default:
      toast.error(message);
      break;
  }
};
