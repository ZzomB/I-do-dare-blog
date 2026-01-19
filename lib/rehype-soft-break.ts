/**
 * soft break (Shift+Enter)를 <br /> 태그로 변환하는 rehype 플러그인
 * 
 * 노션에서 Shift+Enter로 만든 줄바꿈이 마크다운에서 제대로 렌더링되도록 처리합니다.
 * 마크다운에서 두 개의 공백 + 줄바꿈, 또는 trailing backslash를 <br />로 변환합니다.
 */
import { visit } from 'unist-util-visit';

export default function rehypeSoftBreak() {
  return (tree: any) => {
    visit(tree, 'text', (node: any, index: number | undefined, parent: any) => {
      if (!parent || index === undefined || !node.value) {
        return;
      }

      // 텍스트 노드 내에서 줄바꿈을 찾아서 <br />로 변환
      // 마크다운의 두 개의 공백 + 줄바꿈 패턴 또는 trailing backslash 패턴 처리
      const text = node.value;
      
      // 두 개의 공백 + 줄바꿈 패턴 찾기 (마크다운 soft break)
      if (text.includes('  \n') || text.includes('  \r\n') || text.includes('\\\n') || text.includes('\\\r\n')) {
        const parts = text.split(/(  \n|  \r\n|\\\n|\\\r\n)/);
        const newChildren: any[] = [];

        parts.forEach((part: string, i: number) => {
          if (part.match(/^(  \n|  \r\n|\\\n|\\\r\n)$/)) {
            // 줄바꿈 패턴을 <br /> 태그로 변환
            newChildren.push({
              type: 'element',
              tagName: 'br',
              properties: {},
              children: [],
            });
          } else if (part) {
            // 일반 텍스트
            newChildren.push({
              type: 'text',
              value: part,
            });
          }
        });

        // 부모의 children 배열에서 현재 노드를 새 children으로 교체
        if (newChildren.length > 1) {
          parent.children.splice(index, 1, ...newChildren);
        }
      }
      // 단일 줄바꿈이 paragraph나 다른 블록 요소 내부에 있는 경우도 처리
      else if (text.includes('\n') && parent.type === 'element' && ['p', 'li', 'td', 'th'].includes(parent.tagName)) {
        const parts = text.split(/\n/);
        
        // 단락 내부의 단일 줄바꿈만 처리 (단락 끝의 줄바꿈은 무시)
        if (parts.length > 1 && !text.endsWith('\n')) {
          const newChildren: any[] = [];

          parts.forEach((part: string, i: number) => {
            if (part) {
              newChildren.push({
                type: 'text',
                value: part,
              });
            }
            
            // 마지막 부분이 아니면 <br /> 추가
            if (i < parts.length - 1) {
              newChildren.push({
                type: 'element',
                tagName: 'br',
                properties: {},
                children: [],
              });
            }
          });

          if (newChildren.length > 1) {
            parent.children.splice(index, 1, ...newChildren);
          }
        }
      }
    });

    // 코드 블록 내부의 줄바꿈은 처리하지 않도록 방지
    visit(tree, 'element', (node: any) => {
      if (node.tagName === 'pre' || node.tagName === 'code') {
        // 코드 블록 내부는 처리하지 않음
        return;
      }
    });
  };
}
