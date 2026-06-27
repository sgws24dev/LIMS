import { useState } from 'react'
import { Search, BookOpen, FileText, Loader2, ExternalLink } from 'lucide-react'
import { PageContainer } from '@/shared/shared/page-container'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { useToast } from '@/shared/hooks/use-toast'
import { searchFaq, type RagResultDto } from '@/services/api/ai'

export default function EquipmentFaq() {
  const { toast } = useToast()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<RagResultDto[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const data = await searchFaq(query.trim())
      setResults(data)
    } catch {
      toast({ title: 'Error', description: 'Failed to search FAQs.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const quickQuestions = [
    'How do I start the centrifuge?',
    'Safety precautions for autoclave',
    'Calibration procedure for HPLC',
    'Mass spectrometer maintenance schedule',
  ]

  return (
    <PageContainer title="Equipment FAQ" description="Search SOPs, manuals, and knowledge base articles for laboratory equipment">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search SOPs, manuals, and FAQs..."
              className="pl-9"
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
            />
          </div>
          <Button onClick={handleSearch} disabled={!query.trim() || loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Search className="h-4 w-4 mr-1" />}
            Search
          </Button>
        </div>

        {!searched && (
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Quick questions</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => { setQuery(q); setSearched(true); /* auto search would trigger here */ }}
                  className="text-xs text-muted-foreground hover:text-foreground bg-muted px-3 py-1.5 rounded-md transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </Card>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No results found. Try a different search term.</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{results.length} result{results.length !== 1 ? 's' : ''}</p>
            {results.map((result, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">{result.source}</Badge>
                      <span className="text-xs text-muted-foreground">Score: {(result.score * 100).toFixed(0)}%</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{result.chunkContent}</p>
                    {result.metadata && (
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        {result.metadata}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  )
}
