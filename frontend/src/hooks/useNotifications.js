import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as notificationService from '../services/notification.service';
import useAuthStore from '../store/authStore';

export const useNotifications = (params = '') => {
  const token = useAuthStore((state) => state.token);
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationService.getNotifications(params),
    enabled: !!token,
  });
};

export const useUnreadCount = () => {
  const token = useAuthStore((state) => state.token);
  return useQuery({
    queryKey: ['unreadCount'],
    queryFn: notificationService.getUnreadCount,
    refetchInterval: 30000, // Poll every 30 seconds
    enabled: !!token,
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });
};
