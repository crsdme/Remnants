import io from 'socket.io-client';
import { notification } from 'antd';
import i18next from 'i18next';

const { t } = i18next;

const socket = io('http://localhost:3001', {
  transports: ['websocket'],
  reconnectionAttempts: 3,
});

socket.on('connect_error', (error) => {
  console.error('Socket error:', error);
  notification.error({ message: t('socketError'), description: i18next.t('socketConnectionLost') });
});

export default socket;