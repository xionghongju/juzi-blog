import { supabase } from '@/lib/supabase'
import { SettingsForm } from '@/components/admin/Settings/SettingsForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '网站设置 - 后台管理' }

export default async function SettingsPage() {
  const { data: settings } = await supabase.from('site_settings').select('*').single()
  if (!settings) return <p className="text-muted-foreground">设置数据不存在</p>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">网站设置</h1>
      <SettingsForm settings={settings} />
    </div>
  )
}
