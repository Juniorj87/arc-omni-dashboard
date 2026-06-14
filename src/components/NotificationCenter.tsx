'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
}

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
    <div className="fixed bottom-6 right-6 z-[500] space-y-2 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="pointer-events-auto"
          >
            <div className="bg-[#0f0f0f] border border-[#1a1a1a] p-3 flex items-start gap-3">
              <div className={cn(
                "w-5 h-5 flex items-center justify-center shrink-0 mt-0.5",
                n.type === 'success' && "text-[#00ff41]",
                n.type === 'error' && "text-[#ff3333]",
                n.type === 'warning' && "text-[#ffb000]",
                n.type === 'info' && "text-[#00d4ff]",
              )}>
                {n.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
                {n.type === 'error' && <AlertCircle className="w-4 h-4" />}
                {n.type === 'warning' && <AlertCircle className="w-4 h-4" />}
                {n.type === 'info' && <Bell className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#e0e0e0]">{n.title}</h4>
                <p className="font-mono text-[9px] text-[#4a4a4a] mt-0.5">{n.message}</p>
              </div>
              <button onClick={() => remove(n.id)} className="p-0.5 text-[#2a2a2a] hover:text-[#4a4a4a]">
                <X className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
