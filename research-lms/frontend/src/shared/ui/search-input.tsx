"use client"

import {
  forwardRef,
  useState,
  useEffect,
  useCallback,
  type InputHTMLAttributes,
} from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value?: string
  onSearch?: (value: string) => void
  debounceMs?: number
  placeholder?: string
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      value: externalValue = "",
      onSearch,
      debounceMs = 300,
      placeholder = "Search...",
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(externalValue)

    useEffect(() => {
      setInternalValue(externalValue)
    }, [externalValue])

    const debouncedSearch = useCallback(
      debounce((val: string) => {
        onSearch?.(val)
      }, debounceMs),
      [onSearch, debounceMs]
    )

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInternalValue(newValue)
      debouncedSearch(newValue)
    }

    return (
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          ref={ref}
          type="text"
          value={internalValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent pl-8 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
SearchInput.displayName = "SearchInput"

function debounce<T extends (...args: any[]) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), ms)
  }
}

export { SearchInput }
