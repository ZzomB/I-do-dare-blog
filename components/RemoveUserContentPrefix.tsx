'use client';

import { useEffect } from 'react';

/**
 * 클라이언트 사이드에서 헤딩 요소의 ID에서 'user-content-' 접두사를 제거하는 컴포넌트
 * 
 * 서버 사이드 플러그인이 제대로 작동하지 않는 경우를 대비한 백업 처리
 */
export default function RemoveUserContentPrefix() {
  useEffect(() => {
    // 모든 헤딩 요소를 찾아서 ID에서 'user-content-' 접두사 제거
    const headings = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
    
    headings.forEach((heading) => {
      const id = heading.getAttribute('id');
      if (id && id.startsWith('user-content-')) {
        const newId = id.replace(/^user-content-/, '');
        heading.setAttribute('id', newId);
      }
    });
  }, []);

  return null;
}
