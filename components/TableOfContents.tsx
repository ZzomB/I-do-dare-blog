'use client';

import { useEffect, useState } from 'react';

interface TocEntry {
  value: string;
  depth: number;
  id?: string;
  children?: Array<TocEntry>;
}

interface TableOfContentsProps {
  toc: TocEntry[];
}

function TableOfContentsLink({
  item,
  activeId,
}: {
  item: TocEntry;
  activeId: string | null;
}) {
  const isActive = activeId === item.id;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (!item.id) return;

    const element = document.getElementById(item.id);
    if (element) {
      // 헤더 높이를 고려한 오프셋 계산
      const headerHeight = 56; // --header-height: 3.5rem = 56px
      const offset = headerHeight + 20; // 추가 여백
      
      // 현재 스크롤 위치와 요소 위치 계산
      const elementTop = element.getBoundingClientRect().top;
      const currentScrollY = window.scrollY || window.pageYOffset;
      const targetScrollY = currentScrollY + elementTop - offset;

      // 스크롤 실행
      window.scrollTo({
        top: Math.max(0, targetScrollY), // 음수 방지
        behavior: 'smooth',
      });

      // URL 해시 업데이트 (스크롤 후, 원본 ID 사용)
      setTimeout(() => {
        window.history.pushState(null, '', `#${item.id}`);
        // 스크롤 후 활성화 상태 업데이트를 위해 이벤트 트리거
        window.dispatchEvent(new Event('scroll'));
      }, 300);
    } else {
      // 요소가 아직 없으면 일반 앵커 링크 동작
      window.location.hash = item.id;
    }
  };

  return (
    <div className="space-y-2">
      <a
        href={`#${item.id}`}
        onClick={handleClick}
        className={`block font-medium transition-colors cursor-pointer ${
          isActive
            ? 'text-foreground font-semibold'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {item.value}
      </a>
      {item.children && item.children.length > 0 && (
        <div className="space-y-2 pl-4">
          {item.children.map((subItem) => (
            <TableOfContentsLink
              key={subItem.id}
              item={subItem}
              activeId={activeId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TableOfContents({ toc }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    // 모든 헤딩 요소의 ID 수집 (재귀적으로)
    const collectIds = (items: TocEntry[]): string[] => {
      const ids: string[] = [];
      items.forEach((item) => {
        if (item.id) {
          ids.push(item.id);
        }
        if (item.children) {
          ids.push(...collectIds(item.children));
        }
      });
      return ids;
    };

    const headings = collectIds(toc).filter(Boolean);

    if (headings.length === 0) return;

    // 헤더 높이를 고려한 오프셋
    // 화면 상단에서 이 거리 내에 있는 헤딩을 "활성"으로 간주
    const headerHeight = 56; // --header-height: 3.5rem = 56px
    const activationOffset = headerHeight + 100; // 헤더 + 여백 (더 넓은 범위로 조정)

    let observer: IntersectionObserver | null = null;
    let handleScroll: (() => void) | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    let retryCount = 0;
    const maxRetries = 10;

    // DOM이 완전히 렌더링될 때까지 대기
    const init = () => {
      // 모든 헤딩 요소가 DOM에 존재하는지 확인
      type HeadingElement = { id: string; element: HTMLElement };
      const headingElements: HeadingElement[] = headings
        .map((id) => {
          const element = document.getElementById(id);
          return element ? { id, element } : null;
        })
        .filter((item): item is HeadingElement => item !== null);

      if (headingElements.length === 0) {
        // 요소가 아직 없으면 잠시 후 다시 시도
        retryCount++;
        if (retryCount < maxRetries) {
          timeoutId = setTimeout(init, 100);
        }
        return;
      }

      // IntersectionObserver는 보조적으로 사용하고, 주로 스크롤 이벤트로 처리
      // 실제 화면 상단(헤더 아래 100px)을 기준으로 관찰
      const observerOptions = {
        rootMargin: `-${headerHeight + 100}px 0px -70% 0px`, // 헤더 + 100px 기준
        threshold: [0, 0.25, 0.5, 0.75, 1],
      };

      observer = new IntersectionObserver((entries) => {
        // 현재 뷰포트에 보이는 헤딩들을 찾음
        const viewportTop = headerHeight + 100;
        const visibleHeadings = entries
          .filter((entry) => entry.isIntersecting && entry.target.id)
          .map((entry) => ({
            id: entry.target.id,
            top: entry.boundingClientRect.top,
            intersectionRatio: entry.intersectionRatio,
          }))
          .sort((a, b) => {
            // 화면 상단 기준점에 더 가까운 것 우선
            const distanceA = Math.abs(a.top - viewportTop);
            const distanceB = Math.abs(b.top - viewportTop);
            if (distanceA < distanceB) return -1;
            if (distanceA > distanceB) return 1;
            return b.intersectionRatio - a.intersectionRatio;
          });

        if (visibleHeadings.length > 0) {
          // 화면 상단 기준점에 가장 가까운 헤딩을 활성화
          setActiveId(visibleHeadings[0].id);
        }
      }, observerOptions);

      // 모든 헤딩 요소 관찰 시작
      headingElements.forEach(({ element }) => {
        observer!.observe(element);
      });

      // 현재 활성 헤딩을 찾는 함수 (스크롤 이벤트에서 사용)
      // 실제로 화면에 보이는 헤딩을 정확하게 선택
      const updateActiveHeading = () => {
        // 화면 상단 기준점: 헤더 아래 사용자가 실제로 보는 영역
        // 사용자가 보고 있는 화면의 상단 부분을 기준으로 함
        const viewportTop = headerHeight + 100; // 헤더 + 100px (실제 콘텐츠가 보이는 영역)
        
        interface BestMatch {
          id: string;
          distance: number;
        }
        let bestMatch: BestMatch | null = null;
        
        for (const heading of headingElements) {
          const { id, element } = heading;
          const rect = element.getBoundingClientRect();
          const top = rect.top;
          
          // 화면 상단 기준점보다 위에 있거나, 기준점 근처에 있는 헤딩
          // 기준점에서 150px 이내에 있는 헤딩을 고려
          if (top <= viewportTop + 150) {
            // 기준점에 가까울수록 좋은 매치
            // 단, 기준점보다 위에 있는 헤딩을 우선 선택 (이미 읽은 내용)
            const distance = top <= viewportTop 
              ? viewportTop - top // 기준점 위: 작을수록 좋음
              : (top - viewportTop) * 1.5; // 기준점 아래: 더 큰 패널티
            
            if (!bestMatch || distance < bestMatch.distance) {
              bestMatch = { id, distance };
            }
          }
        }

        if (bestMatch) {
          setActiveId(bestMatch.id);
        } else if (headingElements.length > 0) {
          // 아무것도 찾지 못했고 스크롤이 맨 위에 있으면 첫 번째 헤딩 활성화
          if (window.scrollY < 100) {
            setActiveId(headingElements[0].id);
          }
        }
      };

      // 초기 활성화
      updateActiveHeading();

      // 스크롤 이벤트 리스너 추가 (throttle 적용)
      let ticking = false;
      handleScroll = () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            updateActiveHeading();
            ticking = false;
          });
          ticking = true;
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
    };

    // 초기화 실행 (다음 프레임에서 실행하여 DOM이 완전히 렌더링된 후 실행)
    timeoutId = setTimeout(init, 0);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (observer) {
        observer.disconnect();
      }
      if (handleScroll) {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [toc]);

  return (
    <nav className="space-y-3 text-base">
      {toc.map((item) => (
        <TableOfContentsLink key={item.id} item={item} activeId={activeId} />
      ))}
    </nav>
  );
}
