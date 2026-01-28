import PostListSuspense from '@/components/features/blog/PostListSuspense';
import ContactCard from '@/app/_components/ContactCard';
import { getTagList } from '@/lib/notion';
import HeaderSection from '@/app/_components/HeaderSection';
import { Suspense } from 'react';
import TagSectionClient from '@/app/_components/TagSection.client';
import PostListSkeleton from '@/components/features/blog/PostListSkeleton';
import TagSectionSkeleton from '@/app/_components/TagSectionSkeleton';
import { getPublishedPosts } from '@/lib/notion';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.idodareblog.com';
  
  return {
    title: 'I do dare',
    description: '나를 이루는 작은 도전들 - 여행, 의료, 음악 등 다양한 분야의 도전과 경험을 공유하는 블로그',
    keywords: ['challenges', 'dare', 'travel', 'medical', 'disease', 'sing', 'vocal', '블로그', '도전', '여행', '의료'],
    authors: [{ name: 'Joo', url: 'https://github.com/ZzomB' }],
    creator: 'Joo',
    publisher: 'Joo',
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: 'I do dare - 나를 이루는 작은 도전들',
      description: '나를 이루는 작은 도전들 - 여행, 의료, 음악 등 다양한 분야의 도전과 경험을 공유하는 블로그',
      url: baseUrl,
      siteName: 'I do dare',
      type: 'website',
      locale: 'ko_KR',
      images: [
        {
          url: `${baseUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: 'I do dare',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'I do dare - 나를 이루는 작은 도전들',
      description: '나를 이루는 작은 도전들 - 여행, 의료, 음악 등 다양한 분야의 도전과 경험을 공유하는 블로그',
      images: [`${baseUrl}/opengraph-image`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

interface HomeProps {
  searchParams: Promise<{ tag?: string; sort?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { tag, sort } = await searchParams;
  const selectedTag = tag || '전체';
  const selectedSort = sort || 'latest';

  // 서버사이드에서 필터링된 포스트 가져오기
  const tags = getTagList();
  const postsPromise = getPublishedPosts({ tag: selectedTag, sort: selectedSort });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.idodareblog.com';
  
  // 구조화된 데이터 (Schema.org JSON-LD) - 블로그 사이트임을 명확히 표시
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'I do dare',
    description: '나를 이루는 작은 도전들 - 여행, 의료, 음악 등 다양한 분야의 도전과 경험을 공유하는 블로그',
    url: baseUrl,
    author: {
      '@type': 'Person',
      name: 'Joo',
      url: 'https://github.com/ZzomB',
    },
    publisher: {
      '@type': 'Organization',
      name: 'I do dare',
      url: baseUrl,
    },
    inLanguage: 'ko-KR',
  };

  return (
    <>
      {/* 구조화된 데이터 추가 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* min-h-screen으로 전체 높이 보장, grid로 3개 영역 분할 */}
      <div className="container py-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr_220px]">
        {/* 좌측사이드바 */}
        <aside className="order-2 md:order-0">
          <Suspense fallback={<TagSectionSkeleton />}>
            <TagSectionClient tags={tags} selectedTag={selectedTag} />
          </Suspense>
        </aside>
        <div className="order-3 space-y-8 md:order-0">
          {/* 섹션 제목 */}
          <HeaderSection selectedTag={selectedTag} />
          {/* 블로그 카드 그리드 */}
          <Suspense fallback={<PostListSkeleton />}>
            <PostListSuspense postsPromise={postsPromise} />
          </Suspense>
        </div>
        {/* 우측 사이드바 */}
        <aside className="order-1 md:order-0">
          <ContactCard />
        </aside>
      </div>
    </div>
    </>
  );
}
