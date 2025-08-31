import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '../UI';
import { useNotification } from '../../context/NotificationContext';

const DataRefreshButton = ({ onRefresh, loading = false, label = "Refresh Data" }) => {
  const { addNotification } = useNotification();

  const handleRefresh = async () => {
    try {
      if (onRefresh) {
        await onRefresh();
        addNotification({
          type: 'success',
          message: 'Data refreshed successfully'
        });
      } else {
        // Force page reload as fallback
        window.location.reload();
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      addNotification({
        type: 'error',
        message: 'Failed to refresh data. Page will reload.'
      });
      // Fallback to page reload
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <Button
      onClick={handleRefresh}
      disabled={loading}
      variant="outline"
      className="flex items-center gap-2"
    >
      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Refreshing...' : label}
    </Button>
  );
};

export default DataRefreshButton;
