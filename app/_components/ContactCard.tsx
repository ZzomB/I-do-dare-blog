'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Instagram, Mail, Youtube, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';

// 연락처 항목 정의 (링크는 나중에 추가 예정)
const contactItems = [
  {
    name: 'Instagram',
    icon: Instagram,
    href: '#', // 나중에 추가
  },
  {
    name: 'Email',
    icon: Mail,
    href: '#', // 나중에 추가
  },
  {
    name: 'YouTube',
    icon: Youtube,
    href: '#', // 나중에 추가
  },
];

export default function ContactCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Card className={`${!isOpen ? 'pb-2 gap-2 md:pb-6 md:gap-6' : ''}`}>
      <CardHeader
        className="cursor-pointer md:cursor-default"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="flex items-center justify-between">
          <span>📩 Contacts</span>
          <span className="md:hidden">
            {isOpen ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent
        className={`overflow-hidden md:block ${
          isMounted ? 'transition-all duration-300 ease-in-out' : ''
        } ${
          isOpen ? 'max-h-[500px] opacity-100 pb-0' : 'max-h-0 opacity-0 pb-0 md:max-h-[500px] md:opacity-100'
        }`}
      >
        <div className="flex flex-wrap gap-3">
          {contactItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="group flex cursor-pointer items-center gap-2 rounded-md p-1.5 text-base transition-colors text-muted-foreground hover:bg-muted-foreground/10"
              >
                <Icon className="h-4 w-4 transition-colors" />
                <span className="font-medium">{item.name}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

