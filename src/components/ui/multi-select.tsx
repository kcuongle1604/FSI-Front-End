"use client"

import * as React from "react"
import { ChevronDown, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface MultiSelectProps {
  options: string[]
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
  placeholder?: string
}

export function MultiSelect({ 
  options, 
  value, 
  onChange, 
  disabled = false,
  placeholder = "Chọn..."
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const wrapperRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleToggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter(v => v !== option))
    } else {
      onChange([...value, option])
    }
  }

  const handleRemove = (option: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(value.filter(v => v !== option))
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between text-sm transition-colors ${
          disabled 
            ? "opacity-50 cursor-not-allowed bg-gray-100" 
            : "hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        }`}
      >
        <div className="flex items-center gap-2 flex-wrap">
          {value.length === 0 ? (
            <span className="text-gray-500">{placeholder}</span>
          ) : (
            value.map(v => (
              <span 
                key={v}
                className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded"
              >
                {v}
                {!disabled && (
                  <button
                    onClick={(e) => handleRemove(v, e)}
                    className="hover:text-blue-900"
                  >
                    <X size={12} />
                  </button>
                )}
              </span>
            ))
          )}
        </div>
        <ChevronDown 
          size={16} 
          className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-56 overflow-y-auto">
          <div className="p-2 space-y-1">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleToggle(option)}
                className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-100 rounded text-left text-sm transition-colors"
              >
                <Checkbox
                  checked={value.includes(option)}
                  onCheckedChange={() => handleToggle(option)}
                />
                <span className="text-gray-700">{option}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
