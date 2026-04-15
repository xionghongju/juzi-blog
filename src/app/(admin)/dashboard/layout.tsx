import { Sidebar } from '@/components/admin/Sidebar'
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </AdminAuthGuard>
  )
}
