import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Search, Loader2, ExternalLink, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { Switch } from '@/shared/ui/switch'
import { PageContainer } from '@/shared/shared/page-container'
import { useToast } from '@/shared/hooks/use-toast'
import {
  createPublication,
  updatePublication,
  getPublicationById,
  searchDoi,
  type CreatePublicationRequest,
} from '@/services/api/content'

export default function AddPublication() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const isEdit = !!id

  const [form, setForm] = useState<CreatePublicationRequest>({
    title: '',
    authors: [],
    journal: null,
    doi: null,
    pmId: null,
    publicationDate: null,
    type: 'ResearchPaper',
    link: null,
    abstract: null,
    isVerified: false,
    instrumentIds: null,
  })
  const [authorInput, setAuthorInput] = useState('')
  const [instrumentInput, setInstrumentInput] = useState('')
  const [linkedInstruments, setLinkedInstruments] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [doiLoading, setDoiLoading] = useState(false)

  const handleDoiLookup = async () => {
    if (!form.doi?.trim()) return
    setDoiLoading(true)
    try {
      const result = await searchDoi(form.doi.trim())
      if (result) {
        setForm(prev => ({
          ...prev,
          title: result.title || prev.title,
          authors: result.authors?.length ? result.authors : prev.authors,
          journal: result.journal || prev.journal,
          publicationDate: result.publicationDate || prev.publicationDate,
          link: result.link || prev.link,
          abstract: result.abstract || prev.abstract,
          type: result.type || prev.type,
        }))
        toast({ title: 'DOI found', description: 'Publication metadata auto-filled from CrossRef.' })
      } else {
        toast({ title: 'DOI not found', description: 'Could not retrieve metadata for this DOI.', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to lookup DOI.', variant: 'destructive' })
    } finally {
      setDoiLoading(false)
    }
  }

  return (
    <PageContainer
      title={isEdit ? 'Edit Publication' : 'Add Publication'}
      description={isEdit ? 'Update publication metadata' : 'Record a new research publication'}
    >
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => navigate('/publications')}>
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to Publications
      </Button>

      <div className="max-w-2xl space-y-5">
        <div>
          <Label className="text-xs">Title *</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="mt-1"
            placeholder="Publication title"
          />
        </div>

        <div>
          <Label className="text-xs">Authors</Label>
          <div className="flex gap-2 mt-1">
            <Input
              value={authorInput}
              onChange={(e) => setAuthorInput(e.target.value)}
              placeholder="Add author and press Enter"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && authorInput.trim()) {
                  e.preventDefault()
                  setForm({ ...form, authors: [...form.authors, authorInput.trim()] })
                  setAuthorInput('')
                }
              }}
            />
          </div>
          {form.authors.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {form.authors.map((author, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs"
                >
                  {author}
                  <button
                    onClick={() => setForm({ ...form, authors: form.authors.filter((_, j) => j !== i) })}
                    className="text-muted-foreground hover:text-foreground ml-0.5"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Journal</Label>
            <Input
              value={form.journal || ''}
              onChange={(e) => setForm({ ...form, journal: e.target.value || null })}
              className="mt-1"
              placeholder="Journal name"
            />
          </div>
          <div>
            <Label className="text-xs">Type *</Label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="ResearchPaper">Research Paper</option>
              <option value="Conference">Conference</option>
              <option value="Poster">Poster</option>
              <option value="Thesis">Thesis</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <Label className="text-xs">DOI</Label>
            <div className="flex gap-1 mt-1">
              <Input
                value={form.doi || ''}
                onChange={(e) => setForm({ ...form, doi: e.target.value || null })}
                placeholder="10.1000/..."
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon-sm"
                onClick={handleDoiLookup}
                disabled={doiLoading || !form.doi?.trim()}
                title="Auto-fill from DOI"
              >
                {doiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ExternalLink className="h-3 w-3" />}
              </Button>
            </div>
          </div>
          <div>
            <Label className="text-xs">PMID</Label>
            <Input
              value={form.pmId || ''}
              onChange={(e) => setForm({ ...form, pmId: e.target.value || null })}
              className="mt-1"
              placeholder="PMID"
            />
          </div>
          <div>
            <Label className="text-xs">Publication Date</Label>
            <Input
              type="date"
              value={form.publicationDate || ''}
              onChange={(e) => setForm({ ...form, publicationDate: e.target.value || null })}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs">Link (URL)</Label>
          <Input
            value={form.link || ''}
            onChange={(e) => setForm({ ...form, link: e.target.value || null })}
            className="mt-1"
            placeholder="https://..."
          />
        </div>

        <div>
          <Label className="text-xs">Abstract</Label>
          <Textarea
            value={form.abstract || ''}
            onChange={(e) => setForm({ ...form, abstract: e.target.value || null })}
            className="mt-1 min-h-[120px]"
            placeholder="Publication abstract..."
          />
        </div>

        <div>
          <Label className="text-xs">Linked Instruments</Label>
          <div className="flex gap-2 mt-1">
            <Input
              value={instrumentInput}
              onChange={(e) => setInstrumentInput(e.target.value)}
              placeholder="Type instrument name and press Enter"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && instrumentInput.trim()) {
                  e.preventDefault()
                  if (!linkedInstruments.includes(instrumentInput.trim())) {
                    setLinkedInstruments([...linkedInstruments, instrumentInput.trim()])
                    setForm({ ...form, instrumentIds: [...(form.instrumentIds || []), crypto.randomUUID()] })
                  }
                  setInstrumentInput('')
                }
              }}
            />
          </div>
          {linkedInstruments.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {linkedInstruments.map((name, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs"
                >
                  {name}
                  <button
                    onClick={() => {
                      setLinkedInstruments(prev => prev.filter((_, j) => j !== i))
                      setForm(prev => ({
                        ...prev,
                        instrumentIds: prev.instrumentIds?.filter((_, j) => j !== i) ?? null
                      }))
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <p className="text-[11px] text-muted-foreground mt-1">
            Type instrument names to link (full instrument search from Facilities service coming soon)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={form.isVerified}
            onCheckedChange={(checked) => setForm({ ...form, isVerified: checked })}
          />
          <Label className="text-xs">Verified</Label>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={async () => {
            if (!form.title.trim()) {
              toast({ title: 'Validation error', description: 'Title is required.', variant: 'destructive' })
              return
            }
            setSaving(true)
            try {
              if (isEdit && id) {
                await updatePublication(id, form)
                toast({ title: 'Updated', description: 'Publication updated successfully.' })
              } else {
                const newId = await createPublication(form)
                toast({ title: 'Created', description: 'Publication created successfully.' })
                navigate(`/publications/${newId}`)
              }
            } catch {
              toast({ title: 'Error', description: 'Failed to save publication.', variant: 'destructive' })
            } finally {
              setSaving(false)
            }
          }} disabled={saving}>
            {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
            <Save className="mr-1 h-4 w-4" />
            {isEdit ? 'Update' : 'Create'} Publication
          </Button>
          <Button variant="outline" onClick={() => navigate('/publications')}>Cancel</Button>
        </div>
      </div>
    </PageContainer>
  )
}