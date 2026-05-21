/// <reference types="vite/client" />
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { QueryClient } from '@tanstack/react-query'
import '@/app/styles/index.css'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        title: 'mekook · 포트폴리오 리밸런싱 계산기',
      },
      {
        name: 'description',
        content:
          '보유 자산과 목표 비중을 입력하면 리밸런싱 매매 금액을 자동으로 계산해 주는 무료 포트폴리오 도구. 데이터는 브라우저에 안전하게 저장됩니다.',
      },
      {
        name: 'keywords',
        content:
          '포트폴리오, 리밸런싱, 자산배분, 투자, 주식, 계산기, 포트폴리오 관리, rebalancing, portfolio',
      },
      { name: 'author', content: 'mekook' },
      { name: 'robots', content: 'index, follow' },
      { name: 'theme-color', content: '#863bff' },
      { name: 'color-scheme', content: 'light dark' },

      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'mekook' },
      { property: 'og:title', content: 'mekook · 포트폴리오 리밸런싱 계산기' },
      {
        property: 'og:description',
        content:
          '보유 자산과 목표 비중을 입력하면 리밸런싱 매매 금액을 자동으로 계산해 주는 무료 포트폴리오 도구.',
      },
      { property: 'og:locale', content: 'ko_KR' },
      { property: 'og:image', content: '/favicon.svg' },

      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: 'mekook · 포트폴리오 리밸런싱 계산기' },
      {
        name: 'twitter:description',
        content:
          '보유 자산과 목표 비중을 입력하면 리밸런싱 매매 금액을 자동으로 계산해 주는 무료 포트폴리오 도구.',
      },
      { name: 'twitter:image', content: '/favicon.svg' },
    ],
    links: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <html lang="ko">
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <footer className="text-muted-foreground flex items-center justify-center gap-2 px-6 py-8 text-sm">
          <span>made by jijiseong</span>
          <a
            href="https://github.com/jijiseong"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="hover:text-foreground transition-colors"
          >
            <svg
              role="img"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          </a>
        </footer>
        <ReactQueryDevtools buttonPosition="bottom-left" />
        <Scripts />
      </body>
    </html>
  )
}
