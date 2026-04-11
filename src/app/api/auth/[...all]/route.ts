import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

// toNextJsHandler автоматически создает обработчики GET и POST
// для логина, логаута, коллбэков Google и управления сессией.
export const { GET, POST } = toNextJsHandler(auth);
