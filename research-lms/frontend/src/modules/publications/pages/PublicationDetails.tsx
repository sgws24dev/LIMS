import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, CheckCircle2, Clock, Pencil, Trash2, FileText } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import { Card, CardContent } from '@/shared/ui/card'
import { PageContainer } from '@/shared/shared/page-container'
import { useToast } from '@/shared/hooks/use-toast'
import { getPublicationById, deletePublication, type PublicationDto } from '@/services/api/content'

const TYPE_LABELS: Record<string, string> = {
  ResearchPaper: 'Research Paper',
  Conference: 'Conference',
  Poster: 'Poster',
  Thesis: 'Thesis',
}

export default function PublicationDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [pub, setPub] = useState<PublicationDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getPublicationById(id)
      .then(setPub)
      .catch(() => navigate('/publications'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleDelete = async () => {
    if (!pub || !confirm('Delete this publication?')) return
    try {
      await deletePublication(pub.id)
      toast({ title: 'Deleted', description: 'Publication removed.' })
      navigate('/publications')
    } catch {
      toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <PageContainer title="" description="">
        <Skeleton className="h-8 w-96 mb-2" />
        <Skeleton className="h-4 w-64 mb-6" />
        <Skeleton className="h-48 w-full" />
      </PageContainer>
    )
  }

  if (!pub) return null

  return (
    <PageContainer title={pub.title}>
      <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
        {pub.authors.join(', ')}
      </div>
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/publications')}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate(`/publications/${pub.id}/edit`)}>
          <Pencil className="mr-1 h-4 w-4" />
          Edit
        </Button>
        <Button variant="outline" size="sm" className="text-destructive" onClick={handleDelete}>
          <Trash2 className="mr-1 h-4 w-4" />
          Delete
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {pub.abstract && (
            <Card>
              <CardContent className="py-4">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  Abstract
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{pub.abstract}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-3">
          <Card>
            <CardContent className="py-4 space-y-3">
              <div>
                <span className="text-[10px] font-semibold uppercase text-muted-foreground">Type</span>
                <Badge variant="outline" className="ml-2 text-xs">{TYPE_LABELS[pub.type] || pub.type}</Badge>
              </div>
              {pub.journal && (
                <div>
                  <span className="text-[10px] font-semibold uppercase text-muted-foreground">Journal</span>
                  <p className="text-xs italic mt-0.5">{pub.journal}</p>
                </div>
              )}
              {pub.publicationDate && (
                <div>
                  <span className="text-[10px] font-semibold uppercase text-muted-foreground">Published</span>
                  <p className="text-xs mt-0.5 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(pub.publicationDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              {pub.doi && (
                <div>
                  <span className="text-[10px] font-semibold uppercase text-muted-foreground">DOI</span>
                  <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5">
                    {pub.doi} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {pub.pmId && (
                <div>
                  <span className="text-[10px] font-semibold uppercase text-muted-foreground">PMID</span>
                  <p className="text-xs mt-0.5">{pub.pmId}</p>
                </div>
              )}
              {pub.link && (
                <div>
                  <span className="text-[10px] font-semibold uppercase text-muted-foreground">Link</span>
                  <a href={pub.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5">
                    Open <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {pub.isVerified ? (
                  <><CheckCircle2 className="h-3 w-3 text-green-500" /> Verified</>
                ) : (
                  <><Clock className="h-3 w-3" /> Pending verification</>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
