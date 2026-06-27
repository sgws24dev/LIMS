import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, ExternalLink, CheckCircle2, Clock, BookOpen, FileText } from 'lucide-react'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import { PageContainer } from '@/shared/shared/page-container'
import { searchPublications, deletePublication, type PublicationDto } from '@/services/api/content'

const TYPE_COLORS: Record<string, string> = {
  ResearchPaper: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Conference: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Poster: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Thesis: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

export default function PublicationsList() {
  const navigate = useNavigate()
  const [publications, setPublications] = useState<PublicationDto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [yearFilter, setYearFilter] = useState<number | null>(null)

  useEffect(() => {
    setLoading(true)
    searchPublications({ searchTerm: searchTerm || undefined, type: typeFilter || undefined, year: yearFilter || undefined })
      .then(setPublications)
      .finally(() => setLoading(false))
  }, [searchTerm, typeFilter, yearFilter])

  const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i)

  return (
    <PageContainer
      title="Publications"
      description="Track research publications linked to instruments"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-xs"
        >
          <option value="">All Types</option>
          <option value="ResearchPaper">Research Paper</option>
          <option value="Conference">Conference</option>
          <option value="Poster">Poster</option>
          <option value="Thesis">Thesis</option>
        </select>
        <select
          value={yearFilter ?? ''}
          onChange={(e) => setYearFilter(e.target.value ? Number(e.target.value) : null)}
          className="h-9 rounded-md border border-input bg-background px-3 text-xs"
        >
          <option value="">All Years</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <Button size="sm" onClick={() => navigate('/publications/add')}>
          <Plus className="mr-1 h-4 w-4" />
          Add Publication
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ) : publications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="mb-3 h-12 w-12 text-muted-foreground/30" />
          <p className="text-lg font-medium">No publications found</p>
          <p className="text-sm text-muted-foreground">Add your first publication to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {publications.map((pub) => (
            <Card key={pub.id} className="cursor-pointer transition-colors hover:bg-accent/50" onClick={() => navigate(`/publications/${pub.id}`)}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm leading-tight truncate">{pub.title}</h3>
                      {pub.isVerified && (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mb-1.5">
                      {pub.authors.join(', ')}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {pub.journal && (
                        <span className="text-[11px] text-muted-foreground/70 italic">{pub.journal}</span>
                      )}
                      {pub.publicationDate && (
                        <span className="text-[11px] text-muted-foreground/70 flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />
                          {new Date(pub.publicationDate).getFullYear()}
                        </span>
                      )}
                      <Badge className={`text-[10px] px-1.5 py-0 ${TYPE_COLORS[pub.type] || ''}`}>
                        {pub.type.replace(/([a-z])([A-Z])/g, '$1 $2')}
                      </Badge>
                      {pub.doi && (
                        <a
                          href={`https://doi.org/${pub.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] text-primary hover:underline inline-flex items-center gap-0.5"
                        >
                          DOI <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  )
}
