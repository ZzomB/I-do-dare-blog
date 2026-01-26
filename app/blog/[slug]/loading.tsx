import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="container py-6 md:py-8 lg:py-12">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[240px_1fr_240px] md:gap-8 lg:grid-cols-[260px_1fr_260px] lg:gap-12">
        <aside className="hidden md:block"></aside>
        <div className="space-y-8">
          {/* 헤더 */}
          <div className="space-y-4">
            <Skeleton className="h-10 w-[300px]" />
            <div className="flex gap-4">
              <Skeleton className="h-5 w-[100px]" />
              <Skeleton className="h-5 w-[120px]" />
            </div>
          </div>

          {/* 메인 이미지 */}
          <Skeleton className="aspect-[16/9] w-full rounded-lg" />

          {/* 본문 컨텐츠 */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        <aside className="hidden md:block"></aside>
      </div>
    </div>
  );
}
