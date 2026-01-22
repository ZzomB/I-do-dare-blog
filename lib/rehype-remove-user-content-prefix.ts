/**
 * rehype 플러그인: 헤딩 요소의 ID에서 'user-content-' 접두사를 제거
 * 
 * 이 플러그인은 remark-gfm이나 다른 플러그인이 추가한 'user-content-' 접두사를 제거하여
 * 목차와 실제 DOM의 ID를 일치시킵니다.
 */
import { visit } from 'unist-util-visit';
import type { Element } from 'hast';

export default function rehypeRemoveUserContentPrefix() {
  return (tree: any) => {
    visit(tree, 'element', (node: Element) => {
      // 헤딩 태그 (h1 ~ h6)인지 확인
      if (node.tagName && /^h[1-6]$/.test(node.tagName)) {
        const properties = node.properties || {};
        
        if (!properties) {
          return;
        }

        // ID가 배열인 경우 첫 번째 요소 사용, 문자열인 경우 그대로 사용
        let id: string | undefined;
        if (Array.isArray(properties.id)) {
          id = properties.id[0] as string;
        } else if (typeof properties.id === 'string') {
          id = properties.id;
        }

        // ID가 있고 'user-content-' 접두사로 시작하는 경우 제거
        if (id && typeof id === 'string' && id.startsWith('user-content-')) {
          const newId = id.replace(/^user-content-/, '');
          
          // 배열인 경우 배열로, 문자열인 경우 문자열로 저장
          if (Array.isArray(properties.id)) {
            if (properties.id.length > 0) {
              properties.id[0] = newId;
            } else {
              properties.id = [newId];
            }
          } else {
            properties.id = newId;
          }
        }
      }
    });
  };
}
