import { Navbar } from '@/components/blog/Navbar'

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-10">
        {children}
      </main>
      <footer className="border-t border-border/50 py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} 橘子的博客 · 用心记录每一天</p>
      </footer>
    </div>
  )
}
