
"use client";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type RegulationCondition = {
  id: number;
  condition: string;
  operator: string;
  value: string;
};

type RegulationApplicationApiItem = {
  cohort_id?: number;
  major_id?: string | number;
};

type GraduationRequirementDetail = {
  requirement_id?: number;
  id?: number;
  name?: string;
  min_total_credits?: number;
  min_required_credits?: number;
  min_elective_credits?: number;
  min_gpa?: number;
  required_certificates?: string[];
  applications?: RegulationApplicationApiItem[];
  notes?: string;
};

type GraduationRequirementDetailResponse =
  | GraduationRequirementDetail
  | { data?: GraduationRequirementDetail; item?: GraduationRequirementDetail; result?: GraduationRequirementDetail };

const defaultConditions: RegulationCondition[] = [
  { id: 1, condition: "Tổng số tín chỉ", operator: ">=", value: "-" },
  { id: 2, condition: "Tín chỉ bắt buộc", operator: ">=", value: "-" },
  { id: 3, condition: "Tín chỉ tự chọn", operator: ">=", value: "-" },
  { id: 4, condition: "GPA", operator: ">=", value: "-" },
  { id: 5, condition: "Chứng chỉ đầu ra", operator: "-", value: "Đủ theo khoá" },
];

const toDisplayValue = (value: unknown): string => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return "-";
};

const toNormalizedMajorId = (value: unknown): string | null => {
  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized ? normalized : null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
};

const mapDetailToConditions = (detail?: GraduationRequirementDetail): RegulationCondition[] => {
  if (!detail) return defaultConditions;

  return [
    { id: 1, condition: "Tổng số tín chỉ", operator: ">=", value: toDisplayValue(detail.min_total_credits) },
    { id: 2, condition: "Tín chỉ bắt buộc", operator: ">=", value: toDisplayValue(detail.min_required_credits) },
    { id: 3, condition: "Tín chỉ tự chọn", operator: ">=", value: toDisplayValue(detail.min_elective_credits) },
    { id: 4, condition: "GPA", operator: ">=", value: toDisplayValue(detail.min_gpa) },
    { id: 5, condition: "Chứng chỉ đầu ra", operator: "-", value: "Đủ theo khoá" },
  ];
};

export default function RegulationDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const regulationId = Number(params?.id);
  const [conditions, setConditions] = useState<RegulationCondition[]>(defaultConditions);
  const [regulationTitle, setRegulationTitle] = useState("Quy chế đào tạo");
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [savingConditionId, setSavingConditionId] = useState<number | null>(null);
  const [detailError, setDetailError] = useState("");
  const [requirementDetail, setRequirementDetail] = useState<GraduationRequirementDetail | null>(null);

  const validRegulationId = useMemo(
    () => (Number.isFinite(regulationId) && regulationId > 0 ? regulationId : null),
    [regulationId]
  );

  useEffect(() => {
    const fetchRequirementDetail = async () => {
      if (!validRegulationId) {
        setDetailError("ID quy chế không hợp lệ.");
        setConditions(defaultConditions);
        setRequirementDetail(null);
        return;
      }

      try {
        setLoadingDetail(true);
        setDetailError("");

        const res = await api.get<GraduationRequirementDetailResponse>(
          `/api/v1/graduation-requirements/${validRegulationId}`
        );

        const payload = res.data;
        const detail = (payload && !Array.isArray(payload)
          ? (payload as { data?: GraduationRequirementDetail; item?: GraduationRequirementDetail; result?: GraduationRequirementDetail }).data
            || (payload as { data?: GraduationRequirementDetail; item?: GraduationRequirementDetail; result?: GraduationRequirementDetail }).item
            || (payload as { data?: GraduationRequirementDetail; item?: GraduationRequirementDetail; result?: GraduationRequirementDetail }).result
            || (payload as GraduationRequirementDetail)
          : undefined);

        setRegulationTitle(detail?.name?.trim() || "Quy chế đào tạo");
        setConditions(mapDetailToConditions(detail));
        setRequirementDetail(detail || null);
      } catch (error: any) {
        setRegulationTitle("Quy chế đào tạo");
        setConditions(defaultConditions);
        setRequirementDetail(null);
        setDetailError(error?.response?.data?.detail || error?.message || "Không thể tải chi tiết quy chế.");
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchRequirementDetail();
  }, [validRegulationId]);

  // Phân trang cho bảng điều kiện
  const PAGE_SIZE = 10;
  const [editingId, setEditingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const totalRecords = conditions.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));
  const pagedConditions = conditions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const displayCount = pagedConditions.length;
  const goToPage = (p: number) => setPage(Math.max(1, Math.min(totalPages, p)));

  const handleConditionChange = (
    id: number,
    changes: Partial<Pick<RegulationCondition, "value">>
  ) => {
    setConditions((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, ...changes } : c));

      if (id !== 2 && id !== 3) {
        return next;
      }

      const requiredValue = Number(next.find((c) => c.id === 2)?.value);
      const electiveValue = Number(next.find((c) => c.id === 3)?.value);
      const totalValue =
        Number.isFinite(requiredValue) && Number.isFinite(electiveValue)
          ? String(requiredValue + electiveValue)
          : "-";

      return next.map((c) => (c.id === 1 ? { ...c, value: totalValue } : c));
    });
  };

  const getConditionValueAsNumber = (id: number): number | null => {
    const rawValue = conditions.find((c) => c.id === id)?.value;
    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed)) {
      return null;
    }
    return parsed;
  };

  const handleSaveCondition = async (conditionId: number) => {
    if (!validRegulationId || !requirementDetail) {
      setDetailError("Không đủ dữ liệu quy chế để lưu thay đổi.");
      return;
    }

    const minRequiredCredits = getConditionValueAsNumber(2);
    const minElectiveCredits = getConditionValueAsNumber(3);
    const minGpa = getConditionValueAsNumber(4);
    const minTotalCredits =
      minRequiredCredits !== null && minElectiveCredits !== null
        ? minRequiredCredits + minElectiveCredits
        : null;

    if (
      minTotalCredits === null
      || minRequiredCredits === null
      || minElectiveCredits === null
      || minGpa === null
    ) {
      setDetailError("Giá trị điều kiện phải là số hợp lệ.");
      return;
    }

    const payload = {
      name: (requirementDetail.name || regulationTitle || "").trim(),
      min_total_credits: minTotalCredits,
      min_required_credits: minRequiredCredits,
      min_elective_credits: minElectiveCredits,
      min_gpa: minGpa,
      required_certificates: Array.isArray(requirementDetail.required_certificates)
        ? requirementDetail.required_certificates
        : [],
      applications: Array.isArray(requirementDetail.applications)
        ? requirementDetail.applications
            .map((item) => ({
              cohort_id: Number(item.cohort_id),
              major_id: toNormalizedMajorId(item.major_id),
            }))
            .filter((item): item is { cohort_id: number; major_id: string } => (
              Number.isFinite(item.cohort_id) && typeof item.major_id === "string"
            ))
        : [],
      notes: requirementDetail.notes || "",
    };

    if (!payload.name) {
      setDetailError("Thiếu tên quy chế, không thể lưu thay đổi.");
      return;
    }

    try {
      setSavingConditionId(conditionId);
      setDetailError("");

      const res = await api.put<GraduationRequirementDetailResponse>(
        `/api/v1/graduation-requirements/${validRegulationId}`,
        payload
      );

      const updatedPayload = res.data;
      const updatedDetail = (updatedPayload && !Array.isArray(updatedPayload)
        ? (updatedPayload as { data?: GraduationRequirementDetail; item?: GraduationRequirementDetail; result?: GraduationRequirementDetail }).data
          || (updatedPayload as { data?: GraduationRequirementDetail; item?: GraduationRequirementDetail; result?: GraduationRequirementDetail }).item
          || (updatedPayload as { data?: GraduationRequirementDetail; item?: GraduationRequirementDetail; result?: GraduationRequirementDetail }).result
          || (updatedPayload as GraduationRequirementDetail)
        : undefined);

      if (updatedDetail) {
        setRequirementDetail(updatedDetail);
        setRegulationTitle(updatedDetail.name?.trim() || "Quy chế đào tạo");
        setConditions(mapDetailToConditions(updatedDetail));
      }

      setEditingId(null);
    } catch (error: any) {
      setDetailError(error?.response?.data?.detail || error?.response?.data?.message || error?.message || "Không thể lưu thay đổi.");
    } finally {
      setSavingConditionId(null);
    }
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
        {loadingDetail && <p className="text-sm text-gray-600 mb-3">Đang tải chi tiết quy chế...</p>}
        {detailError && <p className="text-sm text-red-600 mb-3">{detailError}</p>}
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
                          {cond.operator}
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
                          {cond.id !== 1 && cond.id !== 5 ? (
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
                                disabled={savingConditionId !== null}
                                onClick={() => {
                                  if (editingId === cond.id) {
                                    handleSaveCondition(cond.id);
                                  }
                                }}
                              >
                                <SaveIcon size={16} />
                              </button>
                              <button
                                type="button"
                                className="h-7 w-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
                                title={editingId === cond.id ? "Đóng chỉnh sửa" : "Chỉnh sửa điều kiện"}
                                disabled={savingConditionId !== null}
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
