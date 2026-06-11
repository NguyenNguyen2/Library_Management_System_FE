'use client'
import '@ant-design/v5-patch-for-react-19'
import React from 'react'
import { useServerInsertedHTML } from 'next/navigation'
import { StyleProvider, createCache, extractStyle } from '@ant-design/cssinjs'
import { ConfigProvider, App } from 'antd'
import viVN from 'antd/locale/vi_VN'
import { COLORS } from '@/lib/constants/colors'

export default function AntdProvider({ children }: { children: React.ReactNode }) {
  const [cache] = React.useState(() => createCache())

  useServerInsertedHTML(() => (
    <style id="antd" dangerouslySetInnerHTML={{ __html: extractStyle(cache, true) }} />
  ))

  return (
    <StyleProvider cache={cache}>
      <ConfigProvider
        locale={viVN}
        theme={{
          token: {
            // Global AntD design tokens — áp dụng cho toàn bộ components
            // Màu: dùng hex thực (không dùng var(--...)) để AntD tính đúng derived colors (hover, active…)
            colorPrimary: COLORS.primaryBlue,
            borderRadius: 8,          // bo góc mặc định cho Button, Input, Card…
            fontFamily: 'Inter, sans-serif',
          },
        }}
      >
        <App>
          {children}
        </App>
      </ConfigProvider>
    </StyleProvider>
  )
}
