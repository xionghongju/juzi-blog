import { Navbar } from '@/components/blog/Navbar'
import { BackgroundOrbs } from '@/components/blog/BackgroundOrbs'
import { AiChat } from '@/components/blog/AiChat'

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <BackgroundOrbs />
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-10">
        {children}
      </main>
      <footer className="border-t border-border/50 py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} 橘子的博客 · 用心记录每一天</p>
      </footer>
      <AiChat />
    </div>
  )
}
