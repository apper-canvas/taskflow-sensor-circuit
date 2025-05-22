import { motion } from 'framer-motion';
import MainFeature from '../components/MainFeature';
import ApperIcon from '../components/ApperIcon';

const Home = ({ toast }) => {
  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto mb-8 pt-4"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Manage Your Tasks with Ease</h1>
        <p className="text-surface-600 dark:text-surface-300 text-lg">
          Organize, prioritize, and track your tasks with TaskFlow's intuitive interface.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-primary/5 dark:to-secondary/5 rounded-2xl p-4 md:p-6 lg:p-8"
      >
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <ApperIcon name="ListTodo" className="text-primary" />
                Task Dashboard
              </h2>
              <p className="text-surface-600 dark:text-surface-300">
                View, manage, and organize all your tasks in one place
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-sm bg-white dark:bg-surface-800 px-3 py-2 rounded-lg shadow-sm">
              <ApperIcon name="Info" size={14} className="text-primary" />
              <span>Drag tasks between columns to change status</span>
            </div>
          </div>
          
          <MainFeature toast={toast} />
        </div>
      </motion.div>
      
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-center text-sm text-surface-500 mt-12 py-4"
      >
        <p>TaskFlow &copy; {new Date().getFullYear()} - Efficiently manage and organize tasks</p>
      </motion.footer>
    </div>
  );
};

export default Home;