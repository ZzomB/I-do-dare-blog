'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { TagFilterItem } from '@/types/blog';
import { use, useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TagSectionProps {
  tags: Promise<TagFilterItem[]>;
  selectedTag?: string;
}

export default function TagSection({ tags, selectedTag }: TagSectionProps) {
  const allTags = use(tags);
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
          <span>태그목록</span>
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
          isOpen ? 'max-h-[1000px] opacity-100 pb-0' : 'max-h-0 opacity-0 pb-0 md:max-h-[1000px] md:opacity-100'
        }`}
      >
        <div className="flex flex-col gap-3">
          {allTags.map((tag) => {
            const isSelected = tag.name === selectedTag;
            const href = tag.name === '전체' ? '/' : `?tag=${encodeURIComponent(tag.name)}`;

            return (
              <Link href={href} key={tag.id}>
                <div
                  className={`flex items-center justify-between rounded-md p-1.5 text-base transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted-foreground/10'
                  }`}
                >
                  <span>{tag.name}</span>
                  <span>{tag.count}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
