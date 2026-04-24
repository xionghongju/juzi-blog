import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  if (!checkRateLimit(`unsplash:${ip}`, 30, 3_600_000)) {
    return NextResponse.json({ error: '请求过于频繁，请稍后再试' }, { status: 429 })
  }

  const rawQuery = req.nextUrl.searchParams.get('query')
  if (!rawQuery?.trim()) {
    return NextResponse.json({ error: '请输入搜索关键词' }, { status: 400 })
  }
  const query = rawQuery.trim().slice(0, 60)

  const accessKey = process.env.UNSPLASH_ACCESS_KEY
  if (!accessKey) {
    return NextResponse.json({ error: '未配置 UNSPLASH_ACCESS_KEY' }, { status: 500 })
  }

  const page = req.nextUrl.searchParams.get('page') || '1'

  const url = new URL('https://api.unsplash.com/search/photos')
  url.searchParams.set('query', query)
  url.searchParams.set('per_page', '12')
  url.searchParams.set('page', page)
  url.searchParams.set('orientation', 'landscape')

  let res: Response
  try {
    res = await fetch(url.toString(), {
      headers: { Authorization: `Client-ID ${accessKey}` },
      next: { revalidate: 60 },
    })
  } catch {
    return NextResponse.json({ error: '无法连接 Unsplash，请检查网络' }, { status: 502 })
  }

  if (!res.ok) {
    if (res.status === 401) {
      return NextResponse.json({ error: 'Unsplash API Key 无效' }, { status: 401 })
    }
    if (res.status === 403) {
      return NextResponse.json({ error: 'Unsplash 调用次数已达上限，请稍后再试' }, { status: 403 })
    }
    if (res.status === 410) {
      return NextResponse.json({ results: [] })
    }
    return NextResponse.json({ error: `Unsplash 请求失败（${res.status}）` }, { status: res.status })
  }

  const data = await res.json()

  const results = (data.results ?? []).map((photo: {
    id: string
    urls: { small: string; regular: string }
    alt_description: string | null
    user: { name: string; links: { html: string } }
    links: { html: string }
  }) => ({
    id: photo.id,
    small: photo.urls.small,
    regular: photo.urls.regular,
    alt: photo.alt_description || '',
    author: photo.user.name,
    authorUrl: photo.user.links.html,
    photoUrl: photo.links.html,
  }))

  return NextResponse.json({ results })
}
