import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, User } from 'lucide-react';
import { getPostBySlug, getPublishedPosts } from '@/lib/notion';
import { formatDate } from '@/lib/date';
import { MDXRemote } from 'next-mdx-remote-client/rsc';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypePrettycode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import rehypeMdxToElement from '@/lib/rehype-mdx-to-element';
import rehypeGoogleDriveEmbed from '@/lib/rehype-google-drive-embed';
import rehypeSoftBreak from '@/lib/rehype-soft-break';
import rehypeRemoveUserContentPrefix from '@/lib/rehype-remove-user-content-prefix';
import withSlugs from 'rehype-slug';
import withToc from '@stefanprobst/rehype-extract-toc';
import withTocExport from '@stefanprobst/rehype-extract-toc/mdx';
import GiscusComments from '@/components/GiscusComments';
import TableOfContents from '@/components/TableOfContents';
import RemoveUserContentPrefix from '@/components/RemoveUserContentPrefix';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { post } = await getPostBySlug(slug);

  if (!post) {
    return {
      title: '포스트를 찾을 수 없습니다.',
      description: '포스트를 찾을 수 없습니다.',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  const postUrl = `${baseUrl}/blog/${slug}`;
  const description = post.description || `${post.title} - Joos Blog`;

  return {
    title: post.title,
    description,
    keywords: post.tags,
    authors: [{ name: post.author || 'Joo' }],
    publisher: 'Joo',
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title: post.title,
      description,
      url: postUrl,
      siteName: 'Joos Blog',
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.modifiedDate || post.date,
      authors: [post.author || 'Joo'],
      tags: post.tags,
      images: post.coverImage
        ? [
            {
              url: post.coverImage,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: post.coverImage ? [post.coverImage] : [],
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

interface TocEntry {
  value: string;
  depth: number;
  id?: string;
  children?: Array<TocEntry>;
}

export const generateStaticParams = async () => {
  const { posts } = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
};

export const revalidate = 60; // 1분마다 캐시 재검증

interface BlogPostProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPost({ params }: BlogPostProps) {
  const { slug } = await params;
  const { markdown, post } = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // TOC 추출을 위한 컴파일 - 실제 렌더링과 동일한 플러그인 설정 사용
  // remark-gfm을 추가하여 동일한 ID 생성 보장
  // Turbopack 호환성을 위해 동적 import 사용
  let tocData: any = null;
  try {
    const { compile } = await import('@mdx-js/mdx');
    const { data } = await compile(markdown, {
      remarkPlugins: [remarkGfm], // 실제 렌더링과 동일하게 remark-gfm 추가
      rehypePlugins: [
        withSlugs,
        rehypeRemoveUserContentPrefix, // user-content- 접두사 제거
        withToc,
        withTocExport,
        /** Optionally, provide a custom name for the export. */
        // [withTocExport, { name: 'toc' }],
      ],
    });
    tocData = data;
  } catch (error) {
    // TOC 추출 실패 시에도 페이지는 정상적으로 렌더링되도록 함
    console.warn('TOC 추출 실패:', error);
  }

  // 구조화된 데이터 (Schema.org JSON-LD)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  const postUrl = `${baseUrl}/blog/${slug}`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description || `${post.title} - Joos Blog`,
    image: post.coverImage ? [post.coverImage] : [],
    datePublished: post.date,
    dateModified: post.modifiedDate || post.date,
    author: {
      '@type': 'Person',
      name: post.author || 'Joo',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Joos Blog',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/og-image.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    keywords: post.tags?.join(', '),
    articleSection: 'Blog',
    inLanguage: 'ko',
  };

  return (
    <>
      {/* 구조화된 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="py-6 md:py-12 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 lg:max-w-screen-2xl lg:px-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[240px_1fr_240px] md:gap-8 lg:grid-cols-[260px_1fr_260px] lg:gap-12">
            <aside className="hidden md:block">{/* 추후콘텐츠 추가 */}</aside>
            <section className="overflow-hidden">
              {/* 블로그 헤더 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    {post.tags?.map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </div>
                  <h1 className="text-3xl font-bold md:text-4xl">{post.title}</h1>
                </div>

                {/* 메타 정보 */}
                <div className="text-muted-foreground flex gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" />
                    <span>{post.date ? formatDate(post.date) : ''}</span>
                  </div>
                </div>
              </div>

              {/* 썸네일 이미지 */}
              {post.coverImage && (
                <div className="relative mt-8 mb-8 aspect-[16/9] w-full overflow-hidden rounded-lg shadow-lg">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                    priority
                    className="object-cover"
                  />
                </div>
              )}

              <Separator className="my-8" />
              {/* 모바일 전용 목차 */}
              <div className="sticky top-[var(--sticky-top)] mb-6 md:hidden">
                <details className="bg-muted/60 rounded-lg p-4 backdrop-blur-sm">
                  <summary className="cursor-pointer text-lg font-semibold">목차</summary>
                  <div className="mt-3">
                    {tocData?.toc && <TableOfContents toc={tocData.toc as TocEntry[]} />}
                  </div>
                </details>
              </div>

              {/* 블로그 본문 */}
              <div className="prose prose-slate dark:prose-invert prose-headings:scroll-mt-[var(--header-height)] prose-lg prose-p:leading-relaxed max-w-none">
                <RemoveUserContentPrefix />
                <MDXRemote
                  source={markdown}
                  options={{
                    mdxOptions: {
                      remarkPlugins: [remarkGfm],
                      rehypePlugins: [
                        rehypeMdxToElement, // MDX 특수 노드를 일반 element로 변환 (가장 먼저 실행)
                        rehypeSoftBreak, // soft break (Shift+Enter) 처리
                        rehypeGoogleDriveEmbed, // Google Drive embed 변환
                        rehypeSlug, // 헤딩에 ID 추가
                        rehypePrettycode, // 코드 하이라이팅
                        [
                          rehypeSanitize, // XSS 방지를 위한 보안 레이어
                          {
                            ...defaultSchema,
                            tagNames: [
                              ...(defaultSchema.tagNames || []),
                              'del', // 취소선 태그
                              'u', // 밑줄 태그
                              'iframe', // Google Drive embed용
                              'br', // soft break용
                            ],
                            attributes: {
                              ...defaultSchema.attributes,
                              u: ['className', 'id'],
                              del: ['className', 'id'],
                              div: ['className', 'style'],
                              a: [...(defaultSchema.attributes?.a || []), 'target', 'rel'],
                              // 헤딩 태그에 id 속성 허용 (목차 기능을 위해 필수)
                              h1: ['id'],
                              h2: ['id'],
                              h3: ['id'],
                              h4: ['id'],
                              h5: ['id'],
                              h6: ['id'],
                              iframe: [
                                'src',
                                'width',
                                'height',
                                'allow',
                                'allowFullScreen',
                                'frameBorder',
                                'className',
                                'style',
                              ],
                            },
                            protocols: {
                              ...defaultSchema.protocols,
                              src: ['https'],
                            },
                          },
                        ],
                        rehypeRemoveUserContentPrefix, // user-content- 접두사 제거 (모든 플러그인 실행 후 마지막에 실행)
                      ],
                    },
                  }}
                />
              </div>

              <Separator className="my-16" />

              {/* 이전/다음 포스트 네비게이션 */}
              <GiscusComments />
            </section>
            <aside className="relative hidden md:block">
              <div className="sticky top-[var(--sticky-top)]">
                <div className="bg-muted/50 space-y-4 rounded-lg p-6 backdrop-blur-sm">
                  <h3 className="text-xl font-semibold">목차</h3>
                  {tocData?.toc && <TableOfContents toc={tocData.toc as TocEntry[]} />}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
