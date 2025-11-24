export type ExecutionStatus = 'RUNNING' | 'SUCCESS' | 'FAILED' | 'PENDING' | 'STUCK' | 'DEFAULT';

export const getExecutionState = (status: string | undefined, startTime?: string | Date): ExecutionStatus => {
  if (status === 'SUCCESS') return 'SUCCESS';
  if (status === 'FAILED') return 'FAILED';
  
  if (status === 'RUNNING') {
    if (startTime) {
      const start = new Date(startTime).getTime();
      const now = new Date().getTime();
      // 5 minutes = 300,000 ms
      if (now - start > 300000) {
        return 'STUCK';
      }
    }
    return 'RUNNING';
  }

  if (status === 'PENDING') return 'PENDING';
  
  return 'DEFAULT';
};

export const getHeaderColor = (state: ExecutionStatus): string => {
  switch (state) {
    case 'SUCCESS':
      return '#4CAF50'; // Green
    case 'FAILED':
      return '#F44336'; // Red
    case 'STUCK':
      return '#BDBDBD'; // Light Grey
    case 'RUNNING':
    case 'PENDING':
      return '#FF9800'; // Orange
    default:
      return ''; // Default (handled by component)
  }
};
