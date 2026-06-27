import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, BookOpen, ChevronRight, ChevronDown, FileText, Eye, Clock } from 'lucide-react'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import { PageContainer } from '@/shared/shared/page-container'
import { searchHelpArticles, getHelpCategories, type HelpArticleDto, type HelpCategoryDto } from '@/services/api/content'

export default function HelpCenter() {
  const navigate = useNavigate()
  const [articles, setArticles] = useState<HelpArticleDto[]>([])
  const [categories, setCategories] = useState<HelpCategoryDto[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      searchHelpArticles({ publishedOnly: true }),
      getHelpCategories()
    ]).then(([articlesData, categoriesData]) => {
      setArticles(articlesData)
      setCategories(categoriesData)
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const results = await searchHelpArticles({
          searchTerm: searchTerm || undefined,
          categoryId: selectedCategory || undefined,
          publishedOnly: true
        })
        setArticles(results)
      } catch { /* ignore */ }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm, selectedCategory])

  const rootCategories = categories.filter(c => !c.parentCategoryId)

  const getChildCategories = (parentId: string) =>
    categories.filter(c => c.parentCategoryId === parentId)

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const renderCategoryItem = (cat: { id: string; name: string; parentCategoryId: string | null }, depth: number = 0) => {
    const children = getChildCategories(cat.id)
    const hasChildren = children.length > 0
    const isExpanded = expandedCategories.has(cat.id)

    return (
      <div key={cat.id}>
        <Button
          variant={selectedCategory === cat.id ? 'secondary' : 'ghost'}
          size="sm"
          className="w-full justify-start"
          style={{ paddingLeft: `${12 + depth * 16}px` }}
          onClick={() => {
            setSelectedCategory(cat.id)
            if (hasChildren) toggleCategory(cat.id)
          }}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown className="mr-2 h-3 w-3 shrink-0" /> : <ChevronRight className="mr-2 h-3 w-3 shrink-0" />
          ) : (
            <span className="mr-2 w-3 shrink-0" />
          )}
          {cat.name}
        </Button>
        {hasChildren && isExpanded && (
          <div>
            {children.map(child => renderCategoryItem(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <PageContainer title="Help Center" description="Find documentation and guides">
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search help articles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 h-11"
        />
      </div>

      <div className="flex gap-6">
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav className="space-y-1">
            <Button
              variant={selectedCategory === null ? 'secondary' : 'ghost'}
              size="sm"
              className="w-full justify-start"
              onClick={() => setSelectedCategory(null)}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              All Articles
            </Button>
            {rootCategories.map(cat => renderCategoryItem(cat, 0))}
          </nav>
        </aside>

        <div className="flex-1">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="mb-3 h-12 w-12 text-muted-foreground/30" />
              <p className="text-lg font-medium">No articles found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="space-y-3">
              {articles.map((article) => (
                <Card
                  key={article.id}
                  className="cursor-pointer transition-colors hover:bg-accent/50"
                  onClick={() => navigate(`/help/${article.slug}`)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium leading-tight">{article.title}</h3>
                      <Badge variant="outline" className="shrink-0 ml-2">
                        {categories.find(c => c.id === article.categoryId)?.name || 'General'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
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
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}