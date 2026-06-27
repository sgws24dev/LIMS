import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Eye, Clock, Tag, ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight, List, MessageSquare } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import { PageContainer } from '@/shared/shared/page-container'
import { getHelpArticleBySlug, searchHelpArticles, type HelpArticleDto } from '@/services/api/content'

function extractHeadings(content: string): { level: number; text: string; id: string }[] {
  return content.split('\n')
    .filter(line => /^#{1,3}\s/.test(line))
    .map(line => {
      const level = line.match(/^#+/)![0].length
      const text = line.replace(/^#+\s*/, '').trim()
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      return { level, text, id }
    })
}

function renderMarkdown(line: string, i: number) {
  if (line.startsWith('## ')) return <h2 key={i} id={line.slice(3).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')} className="text-xl font-semibold mt-6 mb-3 scroll-mt-20">{line.slice(3)}</h2>
  if (line.startsWith('# ')) return <h1 key={i} id={line.slice(2).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')} className="text-2xl font-bold mt-6 mb-3 scroll-mt-20">{line.slice(2)}</h1>
  if (line.startsWith('### ')) return <h3 key={i} id={line.slice(4).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')} className="text-lg font-medium mt-4 mb-2 scroll-mt-20">{line.slice(4)}</h3>
  if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc text-muted-foreground">{line.slice(2)}</li>
  if (line.trim() === '') return <br key={i} />
  return <p key={i} className="leading-relaxed text-muted-foreground">{line}</p>
}

export default function HelpArticleDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [article, setArticle] = useState<HelpArticleDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedArticles, setRelatedArticles] = useState<HelpArticleDto[]>([])
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    getHelpArticleBySlug(slug)
      .then((a) => {
        setArticle(a)
        if (a.tags.length > 0) {
          searchHelpArticles({ tags: a.tags[0], publishedOnly: true }).then(results => {
            setRelatedArticles(results.filter(r => r.id !== a.id).slice(0, 4))
          }).catch(() => {})
        }
      })
      .catch(() => navigate('/help'))
      .finally(() => setLoading(false))
  }, [slug, navigate])

  const headings = useMemo(() => article ? extractHeadings(article.content) : [], [article])

  if (loading) {
    return (
      <PageContainer title="" description="">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48 mb-6" />
        <Skeleton className="h-96 w-full" />
      </PageContainer>
    )
  }

  if (!article) return null

  return (
    <PageContainer title={article.title}>
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <Link to="/help" className="hover:text-foreground transition-colors">Help Center</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium truncate">{article.title}</span>
      </nav>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          {article.viewCount} views
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {new Date(article.createdAt).toLocaleDateString()}
        </span>
        {article.tags.map(tag => (
          <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
            <Tag className="mr-1 h-2.5 w-2.5" />
            {tag}
          </Badge>
        ))}
      </div>

      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => navigate('/help')}>
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to Help Center
      </Button>

      <div className="flex gap-8">
        {headings.length > 0 && (
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-20 space-y-1">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-2">
                <List className="h-3 w-3" />
                On this page
              </h4>
              {headings.map((h) => (
                <a
                  key={h.id}
                  href={`#${h.id}`}
                  className={`block text-xs truncate rounded px-2 py-1 transition-colors hover:bg-accent hover:text-accent-foreground ${
                    h.level === 1 ? 'font-medium' : h.level === 2 ? 'pl-4' : 'pl-6'
                  }`}
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  {h.text}
                </a>
              ))}
            </div>
          </aside>
        )}

        <div className="flex-1 min-w-0">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {article.content.split('\n').map((line, i) => renderMarkdown(line, i))}
          </div>

          <div className="mt-8 pt-6 border-t space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Was this article helpful?</span>
              <div className="flex gap-1">
                <Button
                  variant={feedback === 'helpful' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFeedback('helpful')}
                >
                  <ThumbsUp className="mr-1 h-3 w-3" />
                  Yes
                </Button>
                <Button
                  variant={feedback === 'not-helpful' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFeedback('not-helpful')}
                >
                  <ThumbsDown className="mr-1 h-3 w-3" />
                  No
                </Button>
              </div>
            </div>

            {relatedArticles.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3">Related Articles</h4>
                <div className="space-y-2">
                  {relatedArticles.map((ra) => (
                    <Link
                      key={ra.id}
                      to={`/help/${ra.slug}`}
                      className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ChevronRight className="mr-1 h-3 w-3 inline" />
                      {ra.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <Button variant="outline" size="sm" onClick={() => navigate('/requests/submit')}>
              <MessageSquare className="mr-1 h-3 w-3" />
              Create Support Ticket
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}