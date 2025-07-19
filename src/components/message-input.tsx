"use client";

import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Paperclip, Send } from 'lucide-react';
import { useChatStore } from '@/lib/store';

interface MessageInputProps {
  roomId: string;
}

export function MessageInput({ roomId }: MessageInputProps) {
  const [inputValue, setInputValue] = useState('');
  const { sendMessage, setTyping } = useChatStore();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (e.target.value) {
      setTyping(roomId, true);
    } else {
      setTyping(roomId, false);
    }
  };
  
  const handleBlur = () => {
    setTyping(roomId, false);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(roomId, inputValue);
      setInputValue('');
      setTyping(roomId, false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Button type="button" variant="ghost" size="icon" className="shrink-0">
        <Paperclip className="w-5 h-5" />
        <span className="sr-only">Attach file</span>
      </Button>
      <Input
        type="text"
        placeholder="Type a message..."
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        autoComplete="off"
        className="flex-1"
      />
      <Button type="submit" variant="default" size="icon" className="shrink-0" disabled={!inputValue.trim()}>
        <Send className="w-5 h-5" />
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  );
}
