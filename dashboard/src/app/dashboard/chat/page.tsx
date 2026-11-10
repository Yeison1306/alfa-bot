'use client';

import { useState } from 'react';
import { Chat } from '@/components/Chat';

export default function ChatPage() {
  return (
    <div className="h-[calc(100vh-160px)] min-h-[500px]">
      <Chat />
    </div>
  );
}