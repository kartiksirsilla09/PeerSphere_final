import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page not found</p>
      <Link
        to="/"
        className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
      >
        Go back home
      </Link>
    </div>
  );
};

export default NotFoundPage;
