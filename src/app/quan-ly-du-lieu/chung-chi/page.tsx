"use client"

import { Suspense, useEffect, useRef, useState, useMemo, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AppLayout from "@/components/AppLayout"
import { Award, History, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Edit,
  Trash2,
  MoreVertical,
  Search,
  Download,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Loader2,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import CertificateFormDialog from "./components/CertificateFormDialog"
import DeleteCertificateDialog from "./components/DeleteCertificateDialog"
import ImportDialog from "../sinh-vien/components/ImportDialog"
import ImportHistoryTab from "../sinh-vien/components/ImportHistoryTab"
import type { Certificate, StudentCertificateCreatePayload, FileImport } from "./types"
import { api } from "@/lib/api"

function extractBackendMessage(error: any, fallback: string): string {
  const detail = error?.response?.data?.detail
  if (typeof detail === "string" && detail.trim()) return detail
  if (Array.isArray(detail) && detail.length > 0) {
    return detail
      .map((item: any) => (typeof item === "string" ? item : item?.msg || JSON.stringify(item)))
      .join(", ")
  }

  const message = error?.response?.data?.message || error?.message
  if (typeof message === "string" && message.trim()) return message

  return fallback
}

function getTodayUploadDate(): string {
  const now = new Date()
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return localDate.toISOString().split("T")[0]
}

type ClassApiItem = {
  class_id?: number
  class_name?: string
  name?: string
  cohort_id?: number
}

type CohortApiItem = {
  cohort_id?: number
  name?: string | null
  year_start?: number
  year_end?: number
}

type ClassRequirementApiItem = {
  certificate_id?: number
  name?: string
}

type StudentCertificateSummaryItem = {
  id?: number
  student_id?: number | string
  mssv?: string
  student_code?: string
  studentId?: string
  class_name?: string
  className?: string
  lop?: string
  full_name?: string
  fullName?: string
  ho_lot?: string
  hoLot?: string
  ten?: string
  first_name?: string
  firstName?: string
  last_name?: string
  lastName?: string
  dob?: string
  date_of_birth?: string
  ngay_sinh?: string
  cc_quan_su?: boolean | number | string
  cc_the_duc?: boolean | number | string
  cc_ngoai_ngu?: boolean | number | string
  cc_tin_hoc?: boolean | number | string
  don_tn?: boolean | number | string
  application_for_graduation?: boolean | number | string
  kiem_diem?: boolean | number | string
  personal_evaluation?: boolean | number | string
  quan_su?: boolean | number | string
  military_certificate?: boolean | number | string
  the_duc?: boolean | number | string
  physical_education_certificate?: boolean | number | string
  ngoai_ngu?: boolean | number | string
  foreign_language_certificate?: boolean | number | string
  tinh_hoc?: boolean | number | string
  it_certificate?: boolean | number | string
  ghi_chu?: string
  notes?: string
}

type StudentCertificateSummaryResponse = {
  data?: StudentCertificateSummaryItem[]
  total?: number
}

type CertificateOption = {
  id: number
  label: string
}

type StudentCertificateSyncResponse = {
  total_students: number
  synced: number
  failed: number
  created?: number
  skipped?: number
  success: boolean
  message?: string
  results?: Array<{
    student_id: number
    certificate_id?: number
    detail?: string
    success?: boolean
    added: number[]
    removed: number[]
    kept: number[]
    certificate_ids: number[]
  }>
  errors?: unknown[]
}

function ChungChiContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [activeTab, setActiveTab] = useState("chung-chi")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedKhoa, setSelectedKhoa] = useState<string | undefined>()
  const [selectedLop, setSelectedLop] = useState<string | undefined>()
  const isSyncingFromUrlRef = useRef(false)
  const didInitFromUrlRef = useRef(false)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isEnglishExemptionImportOpen, setIsEnglishExemptionImportOpen] = useState(false)
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [classes, setClasses] = useState<ClassApiItem[]>([])
  const [cohorts, setCohorts] = useState<CohortApiItem[]>([])
  const [loadingCertificates, setLoadingCertificates] = useState(false)
  const [certificateError, setCertificateError] = useState("")
  const [certificateColumnHeaders, setCertificateColumnHeaders] = useState<string[]>([])
  const [certificateOptions, setCertificateOptions] = useState<CertificateOption[]>([])
  const [certificateOptionsLoaded, setCertificateOptionsLoaded] = useState(false)
  const [importHistory, setImportHistory] = useState<FileImport[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [editedCellStatus, setEditedCellStatus] = useState<Record<string, boolean>>({})
  const [baseCellStatus, setBaseCellStatus] = useState<Record<string, boolean>>({})
  const [savingTableChanges, setSavingTableChanges] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState("")
  const certificateTableScrollRef = useRef<HTMLDivElement | null>(null)
  const certificateColumnScrollRef = useRef<HTMLDivElement | null>(null)
  const isSyncingCertificateScrollRef = useRef(false)
  const [certificateColumnScrollWidth, setCertificateColumnScrollWidth] = useState(0)

  const classNameOf = (item: ClassApiItem): string => String(item.class_name || item.name || "").trim()
  const getClassByName = (className?: string) =>
    classes.find((c) => classNameOf(c) === String(className || "").trim())
  const getCertificateTableInnerScroller = () => {
    const root = certificateTableScrollRef.current
    if (!root) return null
    return (root.querySelector('[data-slot="table-container"]') as HTMLDivElement | null) || root
  }

  const getValidTab = (tab: string | null) => {
    if (tab === "import-mien-hoc-phan-tieng-anh") return "import-mien-hoc-phan-tieng-anh"
    if (tab === "lich-su-import") return "lich-su-import"
    return "chung-chi"
  }

  useEffect(() => {
    isSyncingFromUrlRef.current = true

    const tabFromUrl = getValidTab(searchParams?.get("tab"))
    const queryFromUrl = searchParams?.get("q") ?? ""
    const khoaFromUrl = searchParams?.get("khoa") ?? undefined
    const lopFromUrl = searchParams?.get("lop") ?? undefined

    setActiveTab((prev) => (prev === tabFromUrl ? prev : tabFromUrl))
    setSearchQuery((prev) => (prev === queryFromUrl ? prev : queryFromUrl))
    setSelectedKhoa((prev) => (prev === khoaFromUrl ? prev : khoaFromUrl))
    setSelectedLop((prev) => (prev === lopFromUrl ? prev : lopFromUrl))

    didInitFromUrlRef.current = true
    window.setTimeout(() => {
      isSyncingFromUrlRef.current = false
    }, 0)
  }, [searchParams])

  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    // Only fetch if a specific class is selected (not undefined and not 'all')
    if (!selectedLop || selectedLop === "all") {
      setCertificates([])
      return
    }

    const fetchCertificateSummary = async () => {
      try {
        setLoadingCertificates(true)
        setCertificateError("")

        const allItems: StudentCertificateSummaryItem[] = []
        let skip = 0

        while (true) {
          const res = await api.get<StudentCertificateSummaryResponse>("/api/v1/student-certificates/summary", {
            params: {
              skip,
              limit: API_LIMIT,
              lop: selectedLop,
            },
          })

          const pageItems = Array.isArray(res.data?.data) ? res.data.data : []
          console.log(`[DEBUG] Page ${skip/API_LIMIT + 1} raw items:`, pageItems.slice(0, 2))
          allItems.push(...pageItems)

          if (pageItems.length < API_LIMIT) {
            break
          }

          skip += API_LIMIT
        }

        const mappedCertificates = allItems.map(mapSummaryItem)
        console.log("[DEBUG] First mapped certificate:", mappedCertificates[0])
        console.log("[DEBUG] Certificate Columns:", certificateColumns)
        
        setCertificates(mappedCertificates)
      } catch (error: any) {
        setCertificateError(extractBackendMessage(error, "Không thể tải dữ liệu chứng chỉ"))
        setCertificates([])
      } finally {
        setLoadingCertificates(false)
      }
    }

    fetchCertificateSummary()
  }, [selectedLop, refreshTrigger])

  const availableClasses =
    !selectedKhoa || selectedKhoa === "all"
      ? classes.map(classNameOf).filter(Boolean)
      : classes
        .filter((c) => Number(c.cohort_id) === Number(selectedKhoa))
        .map(classNameOf)
        .filter(Boolean)

  const uniqueAvailableClasses = Array.from(new Set(availableClasses))

  const filteredCertificates = certificates.filter((certificate) => {
    if (!selectedLop || selectedLop === "all") {
      return false
    }

    // Double check on frontend to ensure only the selected class is shown
    const selectedLopName = String(selectedLop).trim()
    const certificateClassName = String(certificate.lop || "").trim()
    
    if (certificateClassName !== selectedLopName) {
      return false
    }

    const query = searchQuery.toLowerCase()
    if (!query) return true

    return (
      `${certificate.hoLot} ${certificate.ten}`.toLowerCase().includes(query)
    )
  })

  const PAGE_SIZE = 10
  const API_LIMIT = 100
  const hasData = Boolean(
    selectedKhoa &&
      selectedKhoa !== "all" &&
      selectedLop &&
      selectedLop !== "all"
  )
  const totalRecords = filteredCertificates.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE))
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages)
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE
  const visibleCertificates = filteredCertificates.slice(startIndex, startIndex + PAGE_SIZE)
  const displayCount = visibleCertificates.length
  const certificateColumns = useMemo(() => {
    if (
      selectedLop &&
      selectedLop !== "all" &&
      Array.isArray(certificateColumnHeaders) &&
      certificateColumnHeaders.length > 0
    ) {
      return certificateColumnHeaders
    }

    const allDynamicKeys = new Set<string>()
    certificates.forEach(cert => {
      for (const key of Object.keys(cert)) {
        if (!['id', 'studentId', 'mssv', 'lop', 'hoLot', 'ten', 'ngaySinh', 'ghiChu'].includes(key)) {
          allDynamicKeys.add(key)
        }
      }
    })
    const dataKeys = Array.from(allDynamicKeys)
    const numericKeys = dataKeys.filter((key) => Number.isFinite(Number(key)))
    if (numericKeys.length > 0) {
      return numericKeys.sort((a, b) => Number(a) - Number(b))
    }
    return dataKeys
  }, [certificateColumnHeaders, certificates, selectedKhoa, selectedLop])

  const certificateLabelById = useMemo(() => {
    return new Map(certificateOptions.map((option: CertificateOption) => [option.id, option.label]))
  }, [certificateOptions])

  const normalizeCertificateLabel = (label: string, id: number): string => {
    const trimmed = label.trim()
    if (!trimmed) return ""

    const suffixPattern = new RegExp(`\\s*${id}\\s*$`)
    const withoutIdSuffix = trimmed.replace(suffixPattern, "").trim()
    return withoutIdSuffix || trimmed
  }
  const getColumnLabel = (columnName: string): string => {
    const numericId = Number(columnName)
    if (Number.isFinite(numericId)) {
      if (selectedKhoa && selectedKhoa !== "all" && (!selectedLop || selectedLop === "all")) {
        return ""
      }
      if (!certificateOptionsLoaded) return ""
      const label = (certificateLabelById.get(numericId) as string) ?? ""
      const normalized = normalizeCertificateLabel(label, numericId)
      return normalized || String(numericId)
    }

    return columnName
  }
  const tableColumnCount = certificateColumns.length + 6
  const hasPendingTableChanges = Object.keys(editedCellStatus).length > 0
  const shouldShowCertificateScrollbar = !loadingCertificates && certificateColumns.length > 0

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedKhoa, selectedLop, searchQuery])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  useEffect(() => {
    const tableScroller = getCertificateTableInnerScroller()
    if (!tableScroller) return

    const updateCertificateScrollWidth = () => {
      // 590px = fixed left columns (STT, LOP, HO LOT, TEN, NGAY SINH)
      const fixedWidth = 590
      const columnContentWidth = tableScroller.scrollWidth - fixedWidth
      const columnViewportWidth = Math.max(tableScroller.clientWidth - fixedWidth, 0)

      setCertificateColumnScrollWidth(Math.max(columnContentWidth, columnViewportWidth + 2, 2))
    }

    updateCertificateScrollWidth()

    const resizeObserver = new ResizeObserver(updateCertificateScrollWidth)
    resizeObserver.observe(tableScroller)

    const tableElement = tableScroller.querySelector("table")
    if (tableElement) {
      resizeObserver.observe(tableElement)
    }

    window.addEventListener("resize", updateCertificateScrollWidth)

    return () => {
      window.removeEventListener("resize", updateCertificateScrollWidth)
      resizeObserver.disconnect()
    }
  }, [certificateColumns.length, visibleCertificates.length, loadingCertificates, selectedKhoa, selectedLop])

  useEffect(() => {
    const tableScroller = getCertificateTableInnerScroller()
    const columnScroller = certificateColumnScrollRef.current
    if (!tableScroller || !columnScroller) return

    const syncFromTable = () => {
      if (isSyncingCertificateScrollRef.current) return
      isSyncingCertificateScrollRef.current = true
      columnScroller.scrollLeft = tableScroller.scrollLeft
      isSyncingCertificateScrollRef.current = false
    }

    const syncFromColumn = () => {
      if (isSyncingCertificateScrollRef.current) return
      isSyncingCertificateScrollRef.current = true
      tableScroller.scrollLeft = columnScroller.scrollLeft
      isSyncingCertificateScrollRef.current = false
    }

    tableScroller.addEventListener("scroll", syncFromTable)
    columnScroller.addEventListener("scroll", syncFromColumn)
    columnScroller.scrollLeft = tableScroller.scrollLeft

    return () => {
      tableScroller.removeEventListener("scroll", syncFromTable)
      columnScroller.removeEventListener("scroll", syncFromColumn)
    }
  }, [certificateColumnScrollWidth, shouldShowCertificateScrollbar])

  useEffect(() => {
    const nextBaseStatus: Record<string, boolean> = {}

    certificates.forEach((certificate) => {
      certificateColumns.forEach((headerName, headerIndex) => {
        const key = getCellKey(certificate.studentId ?? certificate.id, headerIndex)
        nextBaseStatus[key] = getCertificateStatusByColumn(certificate, headerName, headerIndex)
      })
    })

    setBaseCellStatus(nextBaseStatus)
  }, [certificates, certificateColumns, certificateOptions, certificateOptionsLoaded])

  useEffect(() => {
    setEditedCellStatus({})
  }, [certificates, certificateColumns])

  const toBoolean = (value: unknown): boolean => {
    if (typeof value === "boolean") return value
    if (typeof value === "number") return value === 1
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase()
      return ["1", "true", "yes", "y", "x", "co", "có", "dat", "đạt", "checked"].includes(normalized)
    }

    return false
  }

  const normalizeText = (value: string): string => {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
  }

  const getCellKey = (studentId: number | string, columnIndex: number) => `${String(studentId)}::${columnIndex}`

  const readNestedBoolean = (value: unknown): boolean => {
    if (toBoolean(value)) return true

    if (value && typeof value === "object" && !Array.isArray(value)) {
      const nested = value as Record<string, unknown>
      const preferredKeys = ["value", "status", "checked", "is_valid", "isValid", "result"]

      for (const key of preferredKeys) {
        if (Object.prototype.hasOwnProperty.call(nested, key) && toBoolean(nested[key])) {
          return true
        }
      }

      return Object.values(nested).some((v) => toBoolean(v))
    }

    if (Array.isArray(value)) {
      return value.some((item) => toBoolean(item))
    }

    return false
  }

  const readBooleanByKeys = (item: Record<string, unknown>, keys: string[], keywordTokens: string[] = []): boolean => {
    const normalizedExplicitKeys = keys.map(normalizeText)

    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(item, key) && readNestedBoolean(item[key])) {
        return true
      }
    }

    for (const [rawKey, rawValue] of Object.entries(item)) {
      const normalizedKey = normalizeText(rawKey)

      if (normalizedExplicitKeys.includes(normalizedKey) && readNestedBoolean(rawValue)) {
        return true
      }

      if (keywordTokens.length > 0) {
        const matchedByKeyword = keywordTokens.some((token) => normalizedKey.includes(normalizeText(token)))
        if (matchedByKeyword && readNestedBoolean(rawValue)) {
          return true
        }
      }
    }

    return false
  }

  const splitName = (fullName: string) => {
    const normalized = fullName.trim().replace(/\s+/g, " ")
    if (!normalized) return { hoLot: "", ten: "" }

    const parts = normalized.split(" ")
    return {
      hoLot: parts.slice(0, -1).join(" "),
      ten: parts[parts.length - 1] || "",
    }
  }

  const getCertificateStatusByColumn = (
    certificate: Certificate,
    columnName: string,
    columnIndex: number
  ): boolean => {
    const anyCert = certificate as any;
    
    // 0. Logging for first row only to avoid noise
    const isFirstRow = certificate.studentId === certificates[0]?.studentId;
    if (isFirstRow) {
       console.log(`[DEBUG] Checking status for ${certificate.hoLot} ${certificate.ten} | Column: ${columnName}`);
    }

    // 1. First, check if we can map this column label back to a numeric ID
    const mappedId = mapHeaderToCertificateId(columnName, certificateOptions)

    // 2. Check by ID if available (either columnName is ID or it's mapped)
    const possibleIds = [Number(columnName), mappedId].filter(
      (id): id is number => id !== null && !isNaN(id)
    )

    if (possibleIds.length > 0) {
      if (Array.isArray(anyCert.certificate_ids)) {
        if (possibleIds.some((id) => anyCert.certificate_ids.includes(id))) {
          if (isFirstRow) console.log(`  -> Found in certificate_ids: ${anyCert.certificate_ids}`)
          return true
        }
      }

      // Also check for keys like "cert_123"
      for (const id of possibleIds) {
        const keyVariants = [String(id), `cert_${id}`, `certificate_${id}`]
        for (const variant of keyVariants) {
          if (variant in anyCert && toBoolean(anyCert[variant])) {
            if (isFirstRow) console.log(`  -> Found in variant key: ${variant}`)
            return true
          }
        }
      }
    }

    // 3. Exact match for property name (e.g., "cc_ngoai_ngu", "don_tn", or the label itself)
    if (columnName in anyCert && toBoolean(anyCert[columnName])) {
      if (isFirstRow) console.log(`  -> Found via exact key match: ${columnName}`);
      return true;
    }

    // 4. Normalized match for fuzzy finding (e.g., "Tin học" vs "tin_hoc")
    const normalizedTarget = normalizeText(columnName)
    for (const [key, val] of Object.entries(anyCert)) {
      if (normalizeText(key) === normalizedTarget && toBoolean(val)) {
        if (isFirstRow) console.log(`  -> Found via normalized key match: ${key}`)
        return true
      }
    }

    if (isFirstRow) console.log("  -> Not found (false)");
    return false;
  }

  const getCellStatus = (certificate: Certificate, columnName: string, columnIndex: number): boolean => {
    const key = getCellKey(certificate.studentId ?? certificate.id, columnIndex)

    if (Object.prototype.hasOwnProperty.call(editedCellStatus, key)) {
      return Boolean(editedCellStatus[key])
    }

    if (Object.prototype.hasOwnProperty.call(baseCellStatus, key)) {
      return Boolean(baseCellStatus[key])
    }

    return getCertificateStatusByColumn(certificate, columnName, columnIndex)
  }

  const getColumnCheckedState = (columnName: string, columnIndex: number): boolean | "indeterminate" => {
    if (!Array.isArray(certificates) || certificates.length === 0) return false

    let checkedCount = 0
    for (const certificate of certificates) {
      if (getCellStatus(certificate, columnName, columnIndex)) {
        checkedCount += 1
      }
    }

    if (checkedCount === 0) return false
    if (checkedCount === certificates.length) return true
    return "indeterminate"
  }

  const handleToggleColumnAll = (columnName: string, columnIndex: number, nextChecked: boolean) => {
    if (!Array.isArray(certificates) || certificates.length === 0) return

    setEditedCellStatus((prev) => {
      const next: Record<string, boolean> = { ...prev }

      for (const certificate of certificates) {
        const studentId = certificate.studentId ?? certificate.id
        const key = getCellKey(studentId, columnIndex)

        const baseChecked = Object.prototype.hasOwnProperty.call(baseCellStatus, key)
          ? Boolean(baseCellStatus[key])
          : getCertificateStatusByColumn(certificate, columnName, columnIndex)

        if (nextChecked === baseChecked) {
          if (Object.prototype.hasOwnProperty.call(next, key)) {
            delete next[key]
          }
        } else {
          next[key] = nextChecked
        }
      }

      return next
    })
  }

  const handleToggleCell = (
    certificate: Certificate,
    columnName: string,
    columnIndex: number,
    nextChecked: boolean
  ) => {
    const key = getCellKey(certificate.studentId ?? certificate.id, columnIndex)
    const baseChecked =
      Object.prototype.hasOwnProperty.call(baseCellStatus, key)
        ? Boolean(baseCellStatus[key])
        : getCertificateStatusByColumn(certificate, columnName, columnIndex)

    setEditedCellStatus((prev) => {
      if (nextChecked === baseChecked) {
        const { [key]: _removed, ...rest } = prev
        return rest
      }

      return {
        ...prev,
        [key]: nextChecked,
      }
    })
  }

  const mapHeaderToCertificateId = (headerName: string, options: CertificateOption[]): number | null => {
    const numericId = Number(headerName)
    if (Number.isFinite(numericId)) return numericId

    const normalizedHeader = normalizeText(headerName)

    const exact = options.find((option) => normalizeText(option.label) === normalizedHeader)
    if (exact) return exact.id

    const inclusive = options.find((option) => {
      const normalizedLabel = normalizeText(option.label)
      return normalizedLabel.includes(normalizedHeader) || normalizedHeader.includes(normalizedLabel)
    })

    return inclusive?.id ?? null
  }

  const fetchCertificateOptions = async (): Promise<CertificateOption[]> => {
    const all: CertificateOption[] = []
    const size = 100
    let page = 1

    while (true) {
      const res = await api.get<any>("/api/v1/certificates", { params: { page, size } })
      const payload = res.data
      const list = Array.isArray(payload)
        ? payload
        : payload.items || payload.data || payload.results || []
      const rawPageItems = Array.isArray(list) ? list : []

      const mapped: CertificateOption[] = rawPageItems
        .map((item: any) => {
          const id = Number(item.id ?? item.certificate_id)
          const label = String(item.name ?? item.code ?? item.certificate_name ?? "").trim()
          if (!Number.isFinite(id) || !label) return null
          return { id, label }
        })
        .filter((item: CertificateOption | null): item is CertificateOption => item !== null)

      all.push(...mapped)

      if (rawPageItems.length < size) {
        break
      }

      page += 1
    }

    return Array.from(new Map(all.map((item) => [item.id, item])).values())
  }

  useEffect(() => {
    const loadCertificateOptions = async () => {
      try {
        const options = await fetchCertificateOptions()
        setCertificateOptions(options)
        setCertificateOptionsLoaded(true)
      } catch {
        setCertificateOptions([])
        setCertificateOptionsLoaded(true)
      }
    }

    loadCertificateOptions()
  }, [])



  const handleSaveTableChanges = async () => {
    if (!hasPendingTableChanges) return

    try {
      setSavingTableChanges(true)
      setCertificateError("")
      setSaveSuccess("")

      const certificateOptions = await fetchCertificateOptions()
      const unresolvedHeaders: string[] = []
      const headerIdByIndex = new Map<number, number>()

      certificateColumns.forEach((headerName, columnIndex) => {
        const id = mapHeaderToCertificateId(headerName, certificateOptions)
        if (typeof id === "number") {
          headerIdByIndex.set(columnIndex, id)
        }
      })

      // Tách riêng danh sách checked (thêm) và unchecked (xóa)
      const changedStudentIds = new Set<number>()

      for (const key of Object.keys(editedCellStatus)) {
        const [rawStudentId, rawColumnIndex] = key.split("::")
        const studentId = Number(rawStudentId)
        const columnIndex = Number(rawColumnIndex)

        if (!Number.isFinite(studentId) || !Number.isInteger(columnIndex)) {
          continue
        }

        const certificateId = headerIdByIndex.get(columnIndex)
        if (!certificateId) {
          const headerName = certificateColumns[columnIndex]
          if (headerName && !unresolvedHeaders.includes(headerName)) {
            unresolvedHeaders.push(headerName)
          }
          continue
        }

        changedStudentIds.add(studentId)
      }

      if (unresolvedHeaders.length > 0) {
        throw new Error(`Không map được certificate_id cho các cột: ${unresolvedHeaders.join(", ")}`)
      }

      // Gọi batch API cho các items cần thêm
      const items = Array.from(changedStudentIds).map((studentId) => {
        const row = certificates.find((certificate) => (certificate.studentId ?? certificate.id) === studentId)
        const certificateIds = certificateColumns
          .map((headerName, columnIndex) => {
            const certificateId = headerIdByIndex.get(columnIndex)
            if (!certificateId) return null

            const checked = row
              ? getCellStatus(row, headerName, columnIndex)
              : Boolean(editedCellStatus[getCellKey(studentId, columnIndex)])

            return checked ? certificateId : null
          })
          .filter((id): id is number => typeof id === "number")

        return {
          student_id: studentId,
          certificate_ids: certificateIds,
        }
      })

      if (items.length > 0) {
        const res = await api.put<StudentCertificateSyncResponse>("/api/v1/student-certificates/students/sync", {
          upload_date: getTodayUploadDate(),
          items,
        })

        const results = res.data?.results ?? []
        const allCreated = results.length > 0 && results.every((r) => r.detail === "created")

        if (allCreated) {
          setSaveSuccess(`Thêm thành công ${res.data.created} chứng chỉ.`)
        } else {
          // Hiển thị các lỗi từ kết quả
          const errorDetails = results
            .filter((r) => r.detail !== "created")
            .map((r) => r.detail)
            .filter(Boolean)
            .join("; ")
          if (errorDetails) {
            setCertificateError(errorDetails)
          } else {
            setSaveSuccess(`Đã lưu. Thêm: ${res.data.created}, Bỏ qua: ${res.data.skipped}.`)
          }
        }
        setSaveSuccess(res.data?.message || "Da luu thay doi thanh cong.")
      } else {
        setSaveSuccess("Đã lưu thay đổi thành công.")
      }

      setBaseCellStatus((prev) => {
        const next: Record<string, boolean> = { ...prev }
        for (const [key, value] of Object.entries(editedCellStatus)) {
          next[key] = Boolean(value)
        }
        return next
      })

      if (selectedLop) {
        setRefreshTrigger(prev => prev + 1)
      }
      setEditedCellStatus({})
    } catch (error: any) {
      setCertificateError(extractBackendMessage(error, "Không thể lưu thay đổi chứng chỉ"))
    } finally {
      setSavingTableChanges(false)
    }
  }

  const mapSummaryItem = (item: StudentCertificateSummaryItem, index: number): Certificate => {
    const raw = item as any
    const fullName = String(item.full_name || item.fullName || "").trim()
    const split = splitName(fullName)

    const hoLot = String(item.ho_lot || item.hoLot || item.first_name || item.firstName || split.hoLot || "")
    const ten = String(item.ten || item.last_name || item.lastName || split.ten || "")

    const studentId = Number(item.student_id ?? item.id ?? index + 1)

    // Extract certificate IDs from various possible shapes
    let certificate_ids: number[] = []
    if (Array.isArray(raw.certificate_ids)) {
      certificate_ids = raw.certificate_ids.map((id: any) => Number(id)).filter((n: number) => !isNaN(n))
    } else if (Array.isArray(raw.certificates)) {
      certificate_ids = raw.certificates.map((c: any) => Number(c.id || c.certificate_id)).filter((n: number) => !isNaN(n))
    }

    const cert: any = {
      id: Number(item.id ?? item.student_id ?? index + 1),
      studentId,
      mssv: String(item.mssv || item.student_code || item.studentId || item.student_id || ""),
      lop: String(item.class_name || item.className || item.lop || "").trim(),
      hoLot,
      ten,
      ngaySinh: String(item.dob || item.date_of_birth || item.ngay_sinh || ""),
      ghiChu: String(item.ghi_chu || item.notes || ""),
      certificate_ids,
    }

    // Map all properties from item to cert to catch any named matching (boolean flags)
    Object.keys(raw).forEach(key => {
      const skipKeys = ['id', 'student_id', 'studentId', 'mssv', 'student_code', 'lop', 'class_name', 'className', 'ho_lot', 'hoLot', 'ten', 'first_name', 'firstName', 'last_name', 'lastName', 'dob', 'date_of_birth', 'ngay_sinh', 'ghi_chu', 'notes', 'certificate_ids', 'certificates']
      if (!skipKeys.includes(key)) {
        cert[key] = toBoolean(raw[key]);
      }
    })

    // Also look for certificate IDs inside keys if they are stored as cert_123: true
    Object.entries(raw).forEach(([key, val]) => {
      const match = key.match(/^(?:cert_|certificate_)?(\d+)$/)
      if (match && toBoolean(val)) {
        const id = Number(match[1])
        if (!certificate_ids.includes(id)) {
          certificate_ids.push(id)
        }
      }
    })

    return cert as Certificate
  }

  const fetchCertificateSummary = async () => {
    // Moved inside useEffect below
  }

  useEffect(() => {
    // Only fetch classes and cohorts once on mount
    const fetchClassAndCohortOptions = async () => {
      try {
        const [classesRes, cohortsRes] = await Promise.all([
          api.get<ClassApiItem[]>("/api/v1/classes"),
          api.get<CohortApiItem[]>("/api/v1/cohorts"),
        ])

        setClasses(Array.isArray(classesRes.data) ? classesRes.data : [])
        setCohorts(Array.isArray(cohortsRes.data) ? cohortsRes.data : [])
      } catch (error: any) {
        setCertificateError(extractBackendMessage(error, "Không thể tải danh sách lớp và khóa."))
        setClasses([])
        setCohorts([])
      }
    }

    fetchClassAndCohortOptions()
  }, [])

  useEffect(() => {
    const initOptions = async () => {
      try {
        const options = await fetchCertificateOptions()
        setCertificateOptions(options)
        setCertificateOptionsLoaded(true)
      } catch (err) {
        console.error("Failed to load certificate options", err)
      }
    }
    initOptions()
  }, [])

  const fetchImportHistory = async () => {
    try {
      const params = new URLSearchParams()
      params.append("type", "certificate")
      params.append("type", "english")

      const res = await api.get("/api/v1/upload-history", { params })
      const payload = res.data
      const data = Array.isArray(payload?.data) ? payload.data : []

      const mapped: FileImport[] = data.map((item: any, idx: number) => ({
        id: item.id || idx + 1,
        fileName: item.file_name || "",
        status: item.status || "",
        success: item.success_count || 0,
        failed: item.failure_count || 0,
        total: item.total_processed || 0,
        createdAt: item.created_at ? new Date(item.created_at).toLocaleString("vi-VN") : "",
        createdBy: item.created_by || "",
      }))

      setImportHistory(mapped)
    } catch (error) {
      console.error("Lỗi khi tải lịch sử import:", error)
      setImportHistory([])
    }
  }

  useEffect(() => {
    if (activeTab === "lich-su-import") {
      fetchImportHistory()
    }
  }, [activeTab])


  useEffect(() => {
    const fetchCertificatesByClass = async () => {
      if (!selectedLop || selectedLop === "all") {
        setCertificateColumnHeaders([])
        setCertificateOptions([])
        setCertificateOptionsLoaded(true)
        return
      }

      setCertificateOptionsLoaded(false)
      try {
        const res = await api.get<ClassRequirementApiItem[] | { data?: ClassRequirementApiItem[]; items?: ClassRequirementApiItem[] }>(
          `/api/v1/student-certificates/class-requirements/${encodeURIComponent(selectedLop)}`
        )

        const payload = res.data
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.items)
              ? payload.items
              : []

        const options = list
          .map((item) => {
            const id = Number(item?.certificate_id)
            const label = String(item?.name || "").trim()
            if (!Number.isFinite(id) || !label) return null
            return { id, label }
          })
          .filter((item): item is CertificateOption => item !== null)

        setCertificateOptions(options)
        setCertificateColumnHeaders(options.map((option) => String(option.id)))
        setCertificateOptionsLoaded(true)
      } catch {
        setCertificateColumnHeaders([])
        setCertificateOptions([])
        setCertificateOptionsLoaded(true)
      }
    }

    void fetchCertificatesByClass()
  }, [selectedLop])

  useEffect(() => {
    if (!didInitFromUrlRef.current || isSyncingFromUrlRef.current) return

    const params = new URLSearchParams(searchParams?.toString() ?? "")

    if (activeTab !== "chung-chi") params.set("tab", activeTab)
    else params.delete("tab")

    if (searchQuery.trim()) params.set("q", searchQuery.trim())
    else params.delete("q")

    if (selectedKhoa) params.set("khoa", selectedKhoa)
    else params.delete("khoa")

    if (selectedLop) params.set("lop", selectedLop)
    else params.delete("lop")

    const next = params.toString()
    const current = searchParams?.toString() ?? ""

    if (next !== current) {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
    }
  }, [activeTab, searchQuery, selectedKhoa, selectedLop, pathname, router, searchParams])

  const handleEdit = (certificate: Certificate) => {
    setSelectedCertificate(certificate)
    setIsFormOpen(true)
  }

  const handleDelete = (certificate: Certificate) => {
    setSelectedCertificate(certificate)
    setIsDeleteOpen(true)
  }

  const handleSubmitCertificate = async (payload: StudentCertificateCreatePayload) => {
    try {
      setCertificateError("")
      await api.post("/api/v1/student-certificates/", {
        upload_date: getTodayUploadDate(),
        items: [payload],
      })
      
      if (selectedLop) {
        setRefreshTrigger(prev => prev + 1)
      }
    } catch (error: any) {
      const status = Number(error?.response?.status)
      if (status === 404) {
        throw new Error("Không tìm thấy sinh viên hoặc chứng chỉ.")
      }
      if (status === 409) {
        throw new Error("Sinh viên đã có chứng chỉ này rồi.")
      }

      throw new Error(extractBackendMessage(error, "Không thể thêm chứng chỉ cho sinh viên."))
    }
  }

  const handleDeleteCertificate = useCallback(async () => {
    if (!selectedCertificate) return

    setCertificateError("")
    try {
      await api.delete(`/api/v1/certificates/${selectedCertificate.id}`)
  if (selectedLop) {
    setRefreshTrigger((prev) => prev + 1)
  }
      setSelectedCertificate(null)
    } catch (error: any) {
      setCertificateError(extractBackendMessage(error, ""))
    }
  }, [selectedCertificate])

  return (
    <AppLayout showSearch={false}>
      <div className="h-full flex flex-col px-8 py-5 bg-slate-50/50">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản lý dữ liệu
            <span className="ml-2 text-xl font-semibold text-slate-900 align-baseline">
              &gt; Chứng chỉ
            </span>
          </h1>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="border-b border-slate-200">
            <TabsList className="bg-transparent h-auto p-0 gap-8 justify-start">
              <TabsTrigger
                value="chung-chi"
                className="relative min-w-[180px] justify-center flex rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none px-0 py-3 text-sm font-semibold transition-all"
              >
                <div className="flex items-center justify-center gap-2 w-full">
                  <Award className="w-4 h-4" />
                  Chứng chỉ
                </div>
              </TabsTrigger>

              <TabsTrigger
                value="import-mien-hoc-phan-tieng-anh"
                className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none px-0 py-3 text-sm font-semibold transition-all"
              >
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Import CC miễn HP tiếng Anh
                </div>
              </TabsTrigger>

              <TabsTrigger
                value="lich-su-import"
                className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none px-0 py-3 text-sm font-semibold transition-all"
              >
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Lịch sử import
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 min-h-0 mt-5 flex flex-col">
            <TabsContent
              value="chung-chi"
              className="m-0 h-full outline-none flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-[250px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nhập tên sinh viên..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 bg-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    value={selectedKhoa}
                    onValueChange={(value) => {
                      setSelectedKhoa(value)
                      setSelectedLop(undefined)
                    }}
                  >
                    <SelectTrigger className="h-9 w-[200px] bg-white">
                      <SelectValue placeholder="Khóa" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      side="bottom"
                      align="center"
                      className="w-[var(--radix-select-trigger-width)]"
                    >
                      <SelectItem value="all">Tất cả</SelectItem>
                      {cohorts
                        .filter((cohort) => Number.isFinite(Number(cohort.cohort_id)))
                        .map((cohort) => {
                          const cohortId = String(cohort.cohort_id)
                          const cohortLabel = `Khóa ${cohortId}`

                          return (
                            <SelectItem key={cohortId} value={cohortId}>
                              {cohortLabel}
                            </SelectItem>
                          )
                        })}
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedLop}
                    onValueChange={(value) => {
                      setSelectedLop(value)

                      const selectedClass = getClassByName(value)
                      const cohortId = Number(selectedClass?.cohort_id)
                      setSelectedKhoa(Number.isFinite(cohortId) ? String(cohortId) : undefined)
                    }}
                  >
                    <SelectTrigger className="h-9 w-[130px] bg-white">
                      <SelectValue placeholder="Lớp" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      side="bottom"
                      align="center"
                      className="w-[var(--radix-select-trigger-width)]"
                    >
                      <SelectItem value="all">Tất cả</SelectItem>
                      {uniqueAvailableClasses.map((lop) => (
                        <SelectItem key={lop} value={lop}>
                          {lop}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    onClick={handleSaveTableChanges}
                    className="bg-[#167FFC] hover:bg-[#1470E3] text-white h-9 gap-2 text-sm"
                    disabled={!hasPendingTableChanges || savingTableChanges || loadingCertificates}
                  >
                    {savingTableChanges ? "Đang lưu..." : "Lưu"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 text-sm"
                  >
                    <Download className="h-4 w-4" />
                    Mẫu
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 text-sm"
                    onClick={() => setIsImportOpen(true)}
                  >
                    <Upload className="h-4 w-4" />
                    Import
                  </Button>
                </div>
              </div>

              {certificateError && (
                <p className="text-sm text-red-600 mb-3">{certificateError}</p>
              )}
              {saveSuccess && (
                <p className="text-sm text-green-600 mb-3">{saveSuccess}</p>
              )}

              <div className="flex flex-col flex-1 bg-white rounded-lg border border-slate-200 overflow-hidden min-h-0">
                <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                  <div ref={certificateTableScrollRef} className="overflow-y-auto overflow-x-hidden" style={{ scrollbarGutter: "stable" }}>
                    <Table
                      containerClassName="overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                      className="w-max min-w-full"
                    >
                      <TableHeader>
                        <TableRow className="border-b border-gray-200 bg-blue-50" style={{ position: "sticky", top: 0, zIndex: 10 }}>
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50" style={{ position: "sticky", left: 0, zIndex: 25, minWidth: "60px", width: "60px", boxShadow: "2px 0 4px rgba(0,0,0,0.1)" }}>
                            STT
                          </TableHead>
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50" style={{ position: "sticky", left: "60px", zIndex: 24, minWidth: "120px", width: "120px", boxShadow: "2px 0 4px rgba(0,0,0,0.1)" }}>
                            LỚP
                          </TableHead>
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50" style={{ position: "sticky", left: "180px", zIndex: 23, minWidth: "170px", width: "170px", maxWidth: "170px", boxShadow: "2px 0 4px rgba(0,0,0,0.1)" }}>
                            HỌ LÓT
                          </TableHead>
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50" style={{ position: "sticky", left: "350px", zIndex: 22, minWidth: "120px", width: "120px", maxWidth: "120px", boxShadow: "2px 0 4px rgba(0,0,0,0.1)" }}>
                            TÊN
                          </TableHead>
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50" style={{ position: "sticky", left: "470px", zIndex: 21, minWidth: "120px", width: "120px", boxShadow: "2px 0 4px rgba(0,0,0,0.1)" }}>
                            NGÀY SINH
                          </TableHead>
                          {certificateColumns.map((headerName, headerIndex) => (
                            <TableHead
                              key={`${headerName}-${headerIndex}`}
                              className="h-10 px-4 text-center text-sm font-semibold text-gray-700 whitespace-nowrap"
                            >
                              <div className="group flex items-center justify-center gap-2 w-full leading-tight">
                                <span
                                  className="truncate max-w-[180px]"
                                  title={getColumnLabel(headerName) || headerName}
                                >
                                  {getColumnLabel(headerName) || headerName}
                                </span>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="inline-flex items-center shrink-0">
                                      <Checkbox
                                        checked={getColumnCheckedState(headerName, headerIndex)}
                                        onCheckedChange={(checked) =>
                                          handleToggleColumnAll(headerName, headerIndex, checked === true)
                                        }
                                        aria-label={`Tick all cho cột ${getColumnLabel(headerName) || headerName}`}
                                        className="data-[state=unchecked]:bg-transparent"
                                      />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" sideOffset={6}>
                                    Tick All
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TableHead>
                          ))}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                      {certificateColumns.length > 0 ? (
                        visibleCertificates.map((certificate, index) => {
                          return (
                            <TableRow
                              key={certificate.id}
                              className="border-b border-gray-200 hover:bg-gray-50"
                            >
                              <TableCell className="h-12 px-4 text-sm text-gray-600 bg-white" style={{ position: "sticky", left: 0, zIndex: 10, minWidth: "60px", width: "60px", boxShadow: "2px 0 4px rgba(0,0,0,0.05)" }}>
                                {String(startIndex + index + 1).padStart(2, "0")}
                              </TableCell>
                              <TableCell className="h-12 px-4 text-sm text-gray-600 bg-white" style={{ position: "sticky", left: "60px", zIndex: 9, minWidth: "120px", width: "120px", boxShadow: "2px 0 4px rgba(0,0,0,0.05)" }}>
                                {certificate.lop}
                              </TableCell>
                              <TableCell className="h-12 px-4 text-sm text-gray-600 bg-white" style={{ position: "sticky", left: "180px", zIndex: 8, minWidth: "170px", width: "170px", maxWidth: "170px", boxShadow: "2px 0 4px rgba(0,0,0,0.05)" }}>
                                {certificate.hoLot}
                              </TableCell>
                              <TableCell className="h-12 px-4 text-sm text-gray-600 bg-white" style={{ position: "sticky", left: "350px", zIndex: 7, minWidth: "120px", width: "120px", maxWidth: "120px", boxShadow: "2px 0 4px rgba(0,0,0,0.05)" }}>
                                {certificate.ten}
                              </TableCell>
                              <TableCell className="h-12 px-4 text-sm text-gray-600 bg-white" style={{ position: "sticky", left: "470px", zIndex: 6, minWidth: "120px", width: "120px", boxShadow: "2px 0 4px rgba(0,0,0,0.05)" }}>
                                {certificate.ngaySinh}
                              </TableCell>
                              {certificateColumns.map((headerName, headerIndex) => (
                                <TableCell
                                  key={`${certificate.id}-${headerName}-${headerIndex}`}
                                  className="h-12 px-4 text-sm text-gray-600 text-center min-w-[80px] w-[80px] max-w-[80px]"
                                >
                                  <div className="flex justify-center">
                                    <Checkbox
                                      checked={getCellStatus(certificate, headerName, headerIndex)}
                                      onCheckedChange={(checked) =>
                                        handleToggleCell(certificate, headerName, headerIndex, checked === true)
                                      }
                                      className="data-[state=unchecked]:bg-transparent"
                                    />
                                  </div>
                                </TableCell>
                              ))}
                            </TableRow>
                          )
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={tableColumnCount} className="p-0">
                            <div className="h-120 w-full flex items-center justify-center text-gray-500 text-sm">
                              {loadingCertificates ? (
                                <span className="inline-flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Đang tải dữ liệu...
                                </span>
                              ) : !hasData ? (
                                "Vui lòng chọn khóa/lớp để xem chứng chỉ"
                              ) : (
                                "Không có dữ liệu"
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {shouldShowCertificateScrollbar && (
                <div className="ml-[590px] mb-[10px]">
                  <div
                    ref={certificateColumnScrollRef}
                    className="overflow-x-scroll overflow-y-hidden"
                    style={{ scrollbarWidth: "auto", scrollbarColor: "#A5A9B0 #F6F8FB" }}
                  >
                    <div style={{ width: certificateColumnScrollWidth, height: 2 }} />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50 sticky bottom-0 z-10">
                <div className="text-sm text-gray-600">
                  Hiển thị {displayCount}/{totalRecords} dòng
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-gray-300"
                    disabled={safeCurrentPage <= 1}
                    onClick={() => setCurrentPage(1)}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-gray-300"
                    disabled={safeCurrentPage <= 1}
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1 px-3 text-sm">
                    <span className="font-medium text-gray-700">{safeCurrentPage}</span>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-600">{totalPages}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-gray-300"
                    disabled={safeCurrentPage >= totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-gray-300"
                    disabled={safeCurrentPage >= totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
          </div>
        </TabsContent>

        <TabsContent
          value="import-mien-hoc-phan-tieng-anh"
          className="m-0 h-full outline-none"
        >
          <div className="bg-white rounded-lg border border-slate-200 p-6 max-w-2xl">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Import chứng chỉ miễn học phần tiếng Anh
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              Tải lên file CSV chứa dữ liệu chứng chỉ để cập nhật trạng thái miễn học phần tiếng Anh cho sinh viên.
            </p>
            <Button
              className="bg-[#167FFC] hover:bg-[#1470E3] text-white h-9 gap-2 text-sm"
              onClick={() => setIsEnglishExemptionImportOpen(true)}
            >
              <Upload className="h-4 w-4" />
              Chọn file và import
            </Button>
          </div>
        </TabsContent>

        <TabsContent
          value="lich-su-import"
          className="m-0 h-full outline-none flex flex-col min-h-0"
        >
          <ImportHistoryTab history={importHistory} />
        </TabsContent>
      </div>
    </Tabs>
      </div >

      <CertificateFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) {
            setSelectedCertificate(null)
          }
        }}
        certificate={selectedCertificate ?? undefined}
        onSubmit={handleSubmitCertificate}
        studentOptions={certificates}
      />
      <DeleteCertificateDialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open)
          if (!open) {
            setSelectedCertificate(null)
          }
        }}
        certificateName={selectedCertificate ? `${selectedCertificate.hoLot} ${selectedCertificate.ten}` : ""}
        onConfirm={handleDeleteCertificate}
      />
      <ImportDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onImportSuccess={() => setRefreshTrigger(prev => prev + 1)}
        isCertificateImport
        classOptions={uniqueAvailableClasses.map((lop) => ({ value: lop, label: lop }))}
      />
      <ImportDialog
        open={isEnglishExemptionImportOpen}
        onOpenChange={setIsEnglishExemptionImportOpen}
        onImportSuccess={() => setRefreshTrigger(prev => prev + 1)}
        isCertificateImport
        certificateImportFormat="csv"
        uploadTitle="Import chứng chỉ miễn học phần tiếng Anh"
        uploadDescription="Chọn file CSV chứa dữ liệu chứng chỉ miễn học phần tiếng Anh"
      />
    </AppLayout >
  )
}

export default function ChungChiPage() {
  return (
    <Suspense fallback={null}>
      <ChungChiContent />
    </Suspense>
  )
}
