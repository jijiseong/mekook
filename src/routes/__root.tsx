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
        <ReactQueryDevtools buttonPosition="bottom-left" />
        <Scripts />
      </body>
    </html>
  )
}
