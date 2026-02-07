
"use client";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import { RegulationCondition, regulations } from "../../page";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

// Dữ liệu mẫu điều kiện giống màn hình trong thiết kế
const demoConditions: RegulationCondition[] = [
  { id: 1, condition: "Tổng số tín chỉ", operator: ">=", value: "134" },
  { id: 2, condition: "Tín chỉ bắt buộc", operator: ">=", value: "120" },
  { id: 3, condition: "Tín chỉ tự chọn", operator: ">=", value: "34" },
  { id: 4, condition: "GPA", operator: ">=", value: "2.0" },
  { id: 5, condition: "Chứng chỉ đầu ra", operator: "-", value: "Đủ theo khoá" },
];

export default function RegulationDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const regulationId = Number(params?.id);
  const regulation = regulations.find((r) => r.id === regulationId);
  const regulationTitle = regulation?.name ?? "Quy chế đào tạo";

  // Phân trang cho bảng điều kiện
  const PAGE_SIZE = 10;
  const [conditions, setConditions] = useState<RegulationCondition[]>(demoConditions);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const totalRecords = conditions.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));
  const pagedConditions = conditions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const displayCount = pagedConditions.length;
  const goToPage = (p: number) => setPage(Math.max(1, Math.min(totalPages, p)));

  const handleConditionChange = (
    id: number,
    changes: Partial<Pick<RegulationCondition, "operator" | "value">>
  ) => {
    setConditions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...changes } : c))
    );
  };

  return (
    <AppLayout showSearch={false}>
      <div className="h-full flex flex-col px-8 py-5 bg-slate-50/50">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Cài đặt
            <span className="ml-2 text-xl font-semibold text-slate-900 align-baseline">
              &gt;{' '}
              <button
                type="button"
                onClick={() => router.push("/cai-dat/quan-ly-quy-che")}
                className="text-blue-700 hover:underline"
              >
                Quản lý quy chế
              </button>
              {regulationTitle && (
                <>
                  <span className="mx-1">&gt;</span>
                  {regulationTitle}
                </>
              )}
            </span>
          </h1>
        </div>
        {/* Spacer giữ vị trí bảng giống trước, không hiển thị tiêu đề */}
        <div className="mb-6 h-9" />
        <div className="flex flex-col flex-1 bg-white rounded-lg border border-slate-200 overflow-hidden min-h-0">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-auto min-h-0">
              <table className="w-full table-fixed" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr className="border-b border-gray-200 bg-blue-50" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                    <th className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50 uppercase w-[6%]">STT</th>
                    <th className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50 uppercase w-[44%]">ĐIỀU KIỆN</th>
                    <th className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50 uppercase w-[15%]">TOÁN TỬ</th>
                    <th className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50 uppercase w-[25%]">GIÁ TRỊ</th>
                    <th className="h-10 px-4 text-right text-sm font-semibold text-gray-700 bg-blue-50 w-[10%]"></th>
                  </tr>
                </thead>
                <tbody>
                  {pagedConditions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-gray-500 py-6">Không có điều kiện nào</td>
                    </tr>
                  ) : (
                    pagedConditions.map((cond, idx) => (
                      <tr key={cond.id} className="border-b last:border-b-0 group">
                        <td className="px-4 py-2 text-sm text-gray-700">{String((page - 1) * PAGE_SIZE + idx + 1).padStart(2, "0")}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{cond.condition}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">
                          {editingId === cond.id ? (
                            <select
                              className="h-8 px-2 rounded border border-gray-300 text-sm bg-white"
                              value={cond.operator}
                              onChange={(e) =>
                                handleConditionChange(cond.id, { operator: e.target.value })
                              }
                            >
                              <option value=">">&gt;</option>
                              <option value=">=">&gt;=</option>
                              <option value="<">&lt;</option>
                              <option value="<=">&lt;=</option>
                              <option value="=">=</option>
                            </select>
                          ) : (
                            cond.operator
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700">
                          {editingId === cond.id ? (
                            <input
                              className="h-8 px-2 rounded border border-gray-300 text-sm w-full"
                              value={cond.value}
                              onChange={(e) =>
                                handleConditionChange(cond.id, { value: e.target.value })
                              }
                            />
                          ) : (
                            cond.value
                          )}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {cond.id !== 5 ? (
                            <div className="flex justify-end items-center gap-1">
                              <button
                                type="button"
                                className={
                                  "h-7 w-7 flex items-center justify-center rounded transition border " +
                                  (editingId === cond.id
                                    ? "hover:bg-green-50 text-green-600 hover:text-green-700 border-green-200"
                                    : "opacity-0 pointer-events-none border-transparent")
                                }
                                title={editingId === cond.id ? "Lưu thay đổi" : ""}
                                onClick={() => {
                                  if (editingId === cond.id) {
                                    setEditingId(null);
                                  }
                                }}
                              >
                                <SaveIcon size={16} />
                              </button>
                              <button
                                type="button"
                                className="h-7 w-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
                                title={editingId === cond.id ? "Đóng chỉnh sửa" : "Chỉnh sửa điều kiện"}
                                onClick={() =>
                                  setEditingId((current) =>
                                    current === cond.id ? null : cond.id
                                  )
                                }
                              >
                                <EditIcon size={16} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50" style={{ minHeight: 56 }}>
              <div className="text-sm text-gray-600">
                Hiển thị {displayCount}/{totalRecords} dòng
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-gray-300"
                  onClick={() => goToPage(1)}
                  disabled={page === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-gray-300"
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1 px-3">
                  <span className="text-sm font-medium text-gray-700">{page}</span>
                  <span className="text-sm text-gray-400">/</span>
                  <span className="text-sm text-gray-600">{totalPages}</span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-gray-300"
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-gray-300"
                  onClick={() => goToPage(totalPages)}
                  disabled={page === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
