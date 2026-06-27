import { useState } from 'react'
import { FileText, BookOpen, Search, Loader2 } from 'lucide-react'
import { PageContainer } from '@/shared/shared/page-container'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { useToast } from '@/shared/hooks/use-toast'
import { searchFaq, type RagResultDto } from '@/services/api/ai'

export default function SopViewer() {
  const { toast } = useToast()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<RagResultDto[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSop, setSelectedSop] = useState<RagResultDto | null>(null)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const data = await searchFaq(query.trim())
      setResults(data)
    } catch {
      toast({ title: 'Error', description: 'Failed to search SOPs.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer title="SOP Viewer" description="Browse and search Standard Operating Procedures for laboratory equipment">
      <div className="max-w-5xl mx-auto">
        {!selectedSop ? (
          <div className="space-y-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search SOPs..."
                  className="pl-9"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
                />
              </div>
              <Button onClick={handleSearch} disabled={!query.trim() || loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Search className="h-4 w-4 mr-1" />}
                Search
              </Button>
            </div>

            {loading && <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>}

            {searched && !loading && results.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No SOPs found.</p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{results.length} result{results.length !== 1 ? 's' : ''}</p>
                {results.map((result, i) => (
                  <Card
                    key={i}
                    className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setSelectedSop(result)}
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">{result.source}</Badge>
                          <span className="text-xs text-muted-foreground">Score: {(result.score * 100).toFixed(0)}%</span>
                        </div>
                        <p className="text-sm line-clamp-3">{result.chunkContent}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {!searched && !loading && (
              <Card className="p-6 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">SOP Knowledge Base</h3>
                <p className="text-sm text-muted-foreground">Search for Standard Operating Procedures by equipment name, procedure type, or keyword.</p>
              </Card>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedSop(null)}>
                Back to results
              </Button>
              <Badge variant="outline">{selectedSop.source}</Badge>
              <span className="text-xs text-muted-foreground">Relevance: {(selectedSop.score * 100).toFixed(0)}%</span>
            </div>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                SOP Content
              </h2>
              <div className="flex gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={() => window.open(`/api/v1/ai/faq/qr?sopId=${selectedSop.id}`, '_blank')}>
                  <FileText className="h-4 w-4 mr-1" />
                  View PDF
                </Button>
              </div>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{selectedSop.chunkContent}</div>
              </div>
              {selectedSop.metadata && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground">Metadata: {selectedSop.metadata}</p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </PageContainer>
  )
}
