import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/features/shared/store/toast-slice';

export function useToast() {
  const dispatch = useAppDispatch();

  return {
    success: (message: string, duration?: number) => {
      dispatch(addToast({ message, type: 'success', duration }));
    },
    error: (message: string, duration?: number) => {
      dispatch(addToast({ message, type: 'error', duration }));
    },
    info: (message: string, duration?: number) => {
      dispatch(addToast({ message, type: 'info', duration }));
    },
    warning: (message: string, duration?: number) => {
      dispatch(addToast({ message, type: 'warning', duration }));
    },
  };
}
export type UseToastReturn = ReturnType<typeof useToast>;
