import { useEffect, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { useOrderEvents, type OrderEvent } from '../hooks/useOrderEvents';
import { useOrderReceipts } from '../hooks/useOrderReceipts';

interface NotificationState {
  id: string;
  event: OrderEvent;
  show: boolean;
}

export function EventNotifications() {
  const { events, isSubscribed } = useOrderEvents();
  const { refetch: refetchReceipts } = useOrderReceipts();
  const [notifications, setNotifications] = useState<NotificationState[]>([]);

  // Convert events to notifications
  useEffect(() => {
    if (events.length > 0) {
      const latestEvent = events[0];
      const notificationId = `event-${latestEvent.timestamp}-${latestEvent.data.order_id}`;
      
      // Check if notification already exists
      if (!notifications.find(n => n.id === notificationId)) {
        setNotifications((prev) => [
          {
            id: notificationId,
            event: latestEvent,
            show: true,
          },
          ...prev,
        ].slice(0, 5)); // Keep max 5 notifications

        // Refetch receipts when order events occur
        refetchReceipts();
      }
    }
  }, [events, notifications, refetchReceipts]);

  const handleClose = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, show: false } : n))
    );
    
    // Remove after animation
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 300);
  };

  const getEventMessage = (event: OrderEvent): string => {
    switch (event.type) {
      case 'placed':
        return `Order #${event.data.order_id.slice(0, 8)} placed successfully!`;
      case 'filled':
        return `Order #${event.data.order_id.slice(0, 8)} filled!`;
      case 'partial_filled':
        return `Order #${event.data.order_id.slice(0, 8)} partially filled`;
      case 'cancelled':
        return `Order #${event.data.order_id.slice(0, 8)} cancelled`;
      default:
        return 'Order event occurred';
    }
  };

  const getEventVariant = (event: OrderEvent): 'success' | 'info' | 'warning' | 'danger' => {
    switch (event.type) {
      case 'placed':
        return 'success';
      case 'filled':
        return 'success';
      case 'partial_filled':
        return 'info';
      case 'cancelled':
        return 'warning';
      default:
        return 'info';
    }
  };

  if (!isSubscribed) {
    return null;
  }

  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1055 }}>
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          show={notification.show}
          onClose={() => handleClose(notification.id)}
          delay={5000}
          autohide
          bg={getEventVariant(notification.event)}
        >
          <Toast.Header>
            <strong className="me-auto">
              {notification.event.type === 'placed' && 'Order Placed'}
              {notification.event.type === 'filled' && 'Order Filled'}
              {notification.event.type === 'partial_filled' && 'Order Partially Filled'}
              {notification.event.type === 'cancelled' && 'Order Cancelled'}
            </strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            {getEventMessage(notification.event)}
          </Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
}

