import { useEffect, useState, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router-dom"
import { searchAssets, getFacilities, type Asset, type Facility } from "@/services/api/facilities"
import { Search, Loader2, Package, Building2, ArrowUpDown } from "lucide-react"

interface SearchResult {
  id: string
  type: "asset" | "facility" | "instrument"
  title: string
  subtitle: string
  status?: string
  href: string
}

export default function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
    if (!open) {
      setQuery("")
      setResults([])
      setSelectedIndex(0)
    }
  }, [open])

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const [assetRes, facilityRes] = await Promise.all([
        searchAssets({ q, pageSize: 5 }).catch(() => ({ items: [] as Asset[], totalCount: 0 })),
        getFacilities({ search: q, pageSize: 3 }).catch(() => ({ items: [] as Facility[], totalCount: 0 })),
      ])

      const items: SearchResult[] = [
        ...assetRes.items.map((a) => ({
          id: a.id,
          type: a.assetType === "Instrument" ? "instrument" as const : "asset" as const,
          title: a.name,
          subtitle: `${a.category} · ${a.location || "—"}`,
          status: a.status,
          href: a.assetType === "Instrument"
            ? `/facilities/instruments/${a.id}`
            : `/facilities/assets/${a.id}`,
        })),
        ...facilityRes.items.map((f) => ({
          id: f.id,
          type: "facility" as const,
          title: f.name,
          subtitle: f.type + (f.location ? ` · ${f.location}` : ""),
          href: `/facilities/${f.id}`,
        })),
      ]
      setResults(items)
      setSelectedIndex(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 300)
    return () => clearTimeout(timer)
  }, [query, doSearch])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter" && results[selectedIndex]) {
      navigate(results[selectedIndex].href)
      setOpen(false)
    }
  }

  const grouped = {
    assets: results.filter((r) => r.type === "asset"),
    instruments: results.filter((r) => r.type === "instrument"),
    facilities: results.filter((r) => r.type === "facility"),
  }

  const searchButton = (
    <button
      onClick={() => setOpen(true)}
      className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/50 transition-colors w-48"
    >
      <Search className="h-3.5 w-3.5" />
      <span>Search...</span>
      <kbd className="ml-auto hidden md:inline-flex h-5 items-center gap-0.5 rounded border bg-background px-1.5 text-[10px] font-medium text-muted-foreground/60">
        <span className="text-[9px]">⌘</span>K
      </kbd>
    </button>
  )

  const modal = open && createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-border/60 bg-background shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search assets, facilities, instruments..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          <kbd className="hidden md:inline-flex h-5 items-center rounded border bg-muted/50 px-1.5 text-[10px] font-medium text-muted-foreground/60">
            ESC
          </kbd>
        </div>

        {query.length >= 2 && results.length === 0 && !loading && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">No results for &apos;{query}&apos;</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Try checking your spelling or use different keywords</p>
          </div>
        )}

        <div className="max-h-80 overflow-y-auto p-2">
          {grouped.assets.length > 0 && (
            <div>
              <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
                Assets
              </p>
              {grouped.assets.map((item, idx) => {
                const globalIdx = results.indexOf(item)
                return (
                  <button
                    key={item.id}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      globalIdx === selectedIndex ? "bg-muted/60" : "hover:bg-muted/30"
                    }`}
                    onClick={() => { navigate(item.href); setOpen(false) }}
                    onMouseEnter={() => setSelectedIndex(globalIdx)}
                  >
                    <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                    </div>
                    {item.status && (
                      <span className="text-[10px] text-muted-foreground shrink-0">{item.status}</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {grouped.instruments.length > 0 && (
            <div className="mt-1">
              <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
                Instruments
              </p>
              {grouped.instruments.map((item) => {
                const globalIdx = results.indexOf(item)
                return (
                  <button
                    key={item.id}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      globalIdx === selectedIndex ? "bg-muted/60" : "hover:bg-muted/30"
                    }`}
                    onClick={() => { navigate(item.href); setOpen(false) }}
                    onMouseEnter={() => setSelectedIndex(globalIdx)}
                  >
                    <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                    </div>
                    {item.status && <span className="text-[10px] text-muted-foreground shrink-0">{item.status}</span>}
                  </button>
                )
              })}
            </div>
          )}

          {grouped.facilities.length > 0 && (
            <div className="mt-1">
              <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
                Facilities
              </p>
              {grouped.facilities.map((item) => {
                const globalIdx = results.indexOf(item)
                return (
                  <button
                    key={item.id}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      globalIdx === selectedIndex ? "bg-muted/60" : "hover:bg-muted/30"
                    }`}
                    onClick={() => { navigate(item.href); setOpen(false) }}
                    onMouseEnter={() => setSelectedIndex(globalIdx)}
                  >
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {results.length > 0 && (
            <div className="border-t border-border/50 mt-2 pt-2 px-2">
              <p className="text-[10px] text-muted-foreground/40 flex items-center gap-1">
                <ArrowUpDown className="h-3 w-3" />
                Navigate with ↑↓ · Enter to select · Esc to close
              </p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )

  return (
    <>
      {searchButton}
      {modal}
    </>
  )
}
