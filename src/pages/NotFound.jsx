import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ApperIcon from '../components/ApperIcon';

const NotFound = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4"
    >
      <div className="bg-surface-100 dark:bg-surface-800 rounded-full p-8 mb-6">
        <ApperIcon 
          name="FileQuestion" 
          className="h-16 w-16 text-surface-400"
        />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold mb-4">404</h1>
      <h2 className="text-2xl md:text-3xl font-semibold mb-4">Page Not Found</h2>
      
      <p className="text-surface-600 dark:text-surface-300 max-w-md mb-8">
        The page you're looking for doesn't exist or has been moved.
        Let's get you back to managing your tasks.
      </p>
      
      <Link 
        to="/"
        className="btn btn-primary flex items-center gap-2"
      >
        <ApperIcon name="ArrowLeft" size={18} />
        Back to Dashboard
      </Link>
    </motion.div>
  );
};

export default NotFound;