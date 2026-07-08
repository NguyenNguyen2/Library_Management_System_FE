'use client'

import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'
import { useNotificationSync } from '@/features/notifications/hooks/useNotifications'
import Footer from '@/features/private/components/Footer'

// dynamic ssr:false — getCookie dùng document.cookie, không chạy được trên server
const HeaderWithSideBar = dynamic(
  () => import('@/features/private/components/HeaderWithSideBar'),
  { ssr: false }
)

const ChatWidget = dynamic(
  () => import('@/features/ai-chat/components/ChatWidget'),
  { ssr: false }
)

function NotificationSyncMount() {
  useNotificationSync()
  return null
}

const PrivateLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className='flex flex-col min-h-screen w-full bg-(--grayLightest)'>
      <NotificationSyncMount />
      <HeaderWithSideBar />
      {/* 25px padding on every edge for all private pages; individual pages
          only control their inner layout, no outer padding needed. */}
      <main className='flex-1 p-6.25'>{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  )
}

export default PrivateLayout
