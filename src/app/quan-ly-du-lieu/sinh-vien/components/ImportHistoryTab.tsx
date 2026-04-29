// Nội dung Tab "Lịch sử import"
"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileImport } from "../types"

interface ImportHistoryTabProps {
  history: FileImport[]
}

export default function ImportHistoryTab({ history }: ImportHistoryTabProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredHistory = history.filter(doc =>
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full">
      {/* Search Bar – giống tab Thông tin sinh viên */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative w-[250px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Nhập tên file..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-9"
          />
        </div>
      </div>

      {/* Card bảng – giống UserManagementTable & tab Thông tin sinh viên */}
      <div className="flex flex-col bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          {/* Header cố định */}
          <div>
            <table className="w-full table-fixed" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr className="border-b border-gray-200 bg-blue-50">
                  <th className="h-10 px-4 text-center text-sm font-semibold text-gray-700 bg-blue-50 uppercase w-[6%]">
                    STT
                  </th>
                  <th className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50 uppercase w-[24%]">
                    TÊN FILE
                  </th>
                  <th className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50 uppercase w-[12%]">
                    TRẠNG THÁI
                  </th>
                  <th className="h-10 px-4 text-center text-sm font-semibold text-gray-700 bg-blue-50 uppercase w-[10%]">
                    THÀNH CÔNG
                  </th>
                  <th className="h-10 px-4 text-center text-sm font-semibold text-gray-700 bg-blue-50 uppercase w-[10%]">
                    THẤT BẠI
                  </th>
                  <th className="h-10 px-4 text-center text-sm font-semibold text-gray-700 bg-blue-50 uppercase w-[10%]">
                    TỔNG
                  </th>
                  <th className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50 uppercase w-[15%]">
                    NGÀY TẠO
                  </th>
                  <th className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50 uppercase w-[13%]">
                    NGƯỜI TẠO
                  </th>
                </tr>
              </thead>
            </table>
          </div>

          {/* Body có thể cuộn, giới hạn 10 dòng (h-12 * 10 = 30rem) */}
          <div className="h-[30rem] overflow-y show-scrollbar">
            <table className="w-full table-fixed" style={{ borderCollapse: "collapse" }}>
              <tbody>
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="h-120 p-0">
                      <div className="h-full w-full flex items-center justify-center text-gray-500 text-sm">
                        Chưa có lịch sử import
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((doc, index) => (
                    <tr
                      key={doc.id}
                      className="border-b border-gray-200 hover:bg-gray-50 last:border-b-0"
                    >
                      <td className="h-12 px-4 text-center text-sm text-gray-700 whitespace-nowrap w-[6%]">
                        {String(index + 1).padStart(2, "0")}
                      </td>
                      <td className="h-12 px-4 text-sm font-medium text-gray-900 w-[24%]">
                        <div className="truncate">{doc.fileName}</div>
                      </td>
                      <td className="h-12 px-4 text-sm text-gray-700 w-[12%]">
                        <div className="truncate">{doc.status}</div>
                      </td>
                      <td className="h-12 px-4 text-center text-sm text-gray-700 w-[10%]">
                        {doc.success}
                      </td>
                      <td className="h-12 px-4 text-center text-sm text-gray-700 w-[10%]">
                        {doc.failed}
                      </td>
                      <td className="h-12 px-4 text-center text-sm text-gray-700 w-[10%]">
                        {doc.total}
                      </td>
                      <td className="h-12 px-4 text-sm text-gray-700 w-[15%]">
                        <div className="truncate">{doc.createdAt}</div>
                      </td>
                      <td className="h-12 px-4 text-sm text-gray-700 w-[13%]">
                        <div className="truncate">{doc.createdBy}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer hiển thị số dòng */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50" style={{ minHeight: 56 }}>
          <div className="text-sm text-gray-600">
            Hiển thị {filteredHistory.length}/{filteredHistory.length} dòng
          </div>
        </div>
      </div>
    </div>
  )
}