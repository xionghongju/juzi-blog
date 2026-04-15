'use client'

import { useState, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { all, createLowlight } from 'lowlight'
import { Button } from '@/components/ui/button'
import {
  Bold, Italic, Heading2, Heading3, List,
  ListOrdered, Quote, Code, Link2, ImageIcon, Undo, Redo, FileCode, ClipboardPaste
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AiWritingToolbar } from './AiWritingToolbar'

const lowlight = createLowlight(all)

interface Props {
  content: string
  onChange: (html: string) => void
}

function looksLikeMarkdown(text: string): boolean {
  return /^#{1,6}\s|^```|^\*\s|^-\s|\*\*|^\d+\.\s|^>/m.test(text)
}

interface ToolbarState {
  rect: DOMRect
  from: number
  to: number
  text: string
}

export function Editor({ content, onChange }: Props) {
  const [aiToolbar, setAiToolbar] = useState<ToolbarState | null>(null)

  const handleSelectionUpdate = useCallback(({ editor }: { editor: import('@tiptap/react').Editor }) => {
    const { from, to, empty } = editor.state.selection
    if (empty) { setAiToolbar(null); return }

    const text = editor.state.doc.textBetween(from, to, '\n')
    if (!text.trim() || text.length < 5) { setAiToolbar(null); return }

    const domSel = window.getSelection()
    if (!domSel || !domSel.rangeCount) { setAiToolbar(null); return }
    const rect = domSel.getRangeAt(0).getBoundingClientRect()
    if (!rect.width) { setAiToolbar(null); return }

    setAiToolbar({ rect, from, to, text })
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight }),
      Image.configure({ HTMLAttributes: { class: 'rounded-xl max-w-full' } }),
      Link.configure({ openOnClick: false }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onSelectionUpdate: handleSelectionUpdate,
    editorProps: {
      attributes: {
        class: 'prose prose-neutral dark:prose-invert max-w-none min-h-[400px] focus:outline-none p-4',
      },
    },
  })

  if (!editor) return null

  // 从剪贴板读取 Markdown 并转为富文本插入
  const pasteMarkdown = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (!text.trim()) return
      
      let html: string
      if (looksLikeMarkdown(text)) {
        // 动态导入 marked，避免在编译时失败
        const { marked } = await import('marked')
        html = await marked.parse(text)
      } else {
        html = `<p>${text}</p>`
      }
      
      editor.chain().focus().insertContent(html).run()
    } catch (error) {
      // 转换失败时的降级处理
      console.error('粘贴 Markdown 失败:', error)
      alert('粘贴失败，请检查 Markdown 格式')
    }
  }

  const ToolbarBtn = ({
    onClick, active, children, title
  }: { onClick: () => void; active?: boolean; children: React.ReactNode; title: string }) => (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      title={title}
      onClick={onClick}
      className={cn('h-8 w-8', active && 'bg-muted text-primary')}
    >
      {children}
    </Button>
  )

  const addImage = () => {
    const url = prompt('输入图片 URL')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  const setLink = () => {
    const url = prompt('输入链接 URL')
    if (url) editor.chain().focus().setLink({ href: url }).run()
  }

  return (
    <div className="rounded-xl border border-border/50 overflow-hidden bg-card">
      {/* 工具栏 */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-border/50 bg-muted/30">
        <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} title="撤销">
          <Undo className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} title="重做">
          <Redo className="h-4 w-4" />
        </ToolbarBtn>
        <div className="w-px h-5 bg-border mx-1" />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="加粗">
          <Bold className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="斜体">
          <Italic className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="行内代码">
          <Code className="h-4 w-4" />
        </ToolbarBtn>
        <div className="w-px h-5 bg-border mx-1" />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="H2 标题">
          <Heading2 className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="H3 标题">
          <Heading3 className="h-4 w-4" />
        </ToolbarBtn>
        <div className="w-px h-5 bg-border mx-1" />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="无序列表">
          <List className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="有序列表">
          <ListOrdered className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="引用">
          <Quote className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="代码块">
          <FileCode className="h-4 w-4" />
        </ToolbarBtn>
        <div className="w-px h-5 bg-border mx-1" />
        <ToolbarBtn onClick={setLink} active={editor.isActive('link')} title="插入链接">
          <Link2 className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={addImage} title="插入图片">
          <ImageIcon className="h-4 w-4" />
        </ToolbarBtn>
        <div className="w-px h-5 bg-border mx-1" />
        {/* Markdown 粘贴按钮 */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          title="将剪贴板中的 Markdown 内容转为富文本插入"
          onClick={pasteMarkdown}
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2"
        >
          <ClipboardPaste className="h-3.5 w-3.5" />
          粘贴 MD
        </Button>
      </div>

      <EditorContent editor={editor} />

      {/* AI 写作工具栏：选中文字时浮现 */}
      {aiToolbar && (
        <AiWritingToolbar
          editor={editor}
          selectionRect={aiToolbar.rect}
          from={aiToolbar.from}
          to={aiToolbar.to}
          selectedText={aiToolbar.text}
          onDone={() => setAiToolbar(null)}
        />
      )}
    </div>
  )
}
