'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Bell } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
}

// Simple event bus for notifications
let notificationCallback: (n: Notification) => void = () => {};

export const notify = (type: NotificationType, title: string, message: string) => {
  notificationCallback({
    id: Math.random().toString(36).substr(2, 9),
    type,
    title,
    message
  });
};

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    notificationCallback = (n: Notification) => {
      setNotifications(prev => [n, ...prev]);
      setTimeout(() => {
        setNotifications(prev => prev.filter(item => item.id !== n.id));
      }, 5000);
    };
  }, []);

  const remove = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed bottom-8 right-8 z-[500] space-y-4 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, x: 50 }}
            className="pointer-events-auto"
          >
            <div className="arc-glass-heavy p-5 rounded-[2rem] border border-white/10 shadow-2xl flex items-start gap-4 group">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                n.type === 'success' && "bg-green-500/20 text-green-500",
                n.type === 'error' && "bg-red-500/20 text-red-500",
                n.type === 'warning' && "bg-yellow-500/20 text-yellow-500",
                n.type === 'info' && "bg-blue-500/20 text-blue-500",
              )}>
                {n.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                {n.type === 'error' && <AlertCircle className="w-5 h-5" />}
                {n.type === 'warning' && <AlertCircle className="w-5 h-5" />}
                {n.type === 'info' && <Bell className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black uppercase tracking-widest text-white mb-1">{n.title}</h4>
                <p className="text-[11px] text-white/40 leading-relaxed font-medium">{n.message}</p>
              </div>
              <button onClick={() => remove(n.id)} className="p-1 text-white/10 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function cn(...inputs: (string | boolean | undefined)[]) {
  return inputs.filter(Boolean).join(' ');
}
