"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { api } from "@/lib/api";

type CohortItem = {
  cohort_id?: number;
};

type MajorByCohort = {
  major_id: number;
  major_name?: string;
  name?: string;
};

const normalizeText = (value: unknown) => String(value ?? "").trim().toLowerCase();

type AddRegulationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (data: any) => void;
};

const DEFAULT_MIN_TOTAL_CREDITS = 120;
const DEFAULT_MIN_REQUIRED_CREDITS = 90;
const DEFAULT_MIN_ELECTIVE_CREDITS = 30;
const DEFAULT_MIN_GPA = 2.0;

const toNumberWithDefault = (raw: string, fallback: number): number | null => {
  if (!raw.trim()) return fallback;

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};

const sanitizeNonNegativeNumberInput = (raw: string, allowDecimal: boolean, maxValue?: number): string => {
  let cleaned = raw.replace(/-/g, "").replace(/[^\d.]/g, "");

  if (!allowDecimal) {
    const normalized = cleaned.replace(/\./g, "");
    if (!normalized || maxValue == null) return normalized;

    const parsed = Number(normalized);
    if (!Number.isFinite(parsed)) return "";
    return parsed > maxValue ? String(maxValue) : normalized;
  }

  const [integerPart, ...decimalParts] = cleaned.split(".");
  const normalized = decimalParts.length === 0 ? cleaned : `${integerPart}.${decimalParts.join("")}`;
  if (!normalized || normalized === ".") return normalized === "." ? "" : normalized;
  if (maxValue == null) return normalized;

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return "";
  return parsed > maxValue ? String(maxValue) : normalized;
};

const calculateMinTotalCredits = (requiredRaw: string, electiveRaw: string): string => {
  if (!requiredRaw.trim() && !electiveRaw.trim()) return "";

  const requiredValue = requiredRaw.trim() ? Number(requiredRaw) : 0;
  const electiveValue = electiveRaw.trim() ? Number(electiveRaw) : 0;

  if (!Number.isFinite(requiredValue) || !Number.isFinite(electiveValue)) return "";

  return String(requiredValue + electiveValue);
};

export default function AddRegulationDialog({ open, onOpenChange, onAdd }: AddRegulationDialogProps) {
  const [cohortOptions, setCohortOptions] = useState<string[]>([]);
  const [majorOptionsByCohort, setMajorOptionsByCohort] = useState<Record<string, { id: number; name: string }[]>>({});
  const [loadingCohorts, setLoadingCohorts] = useState(false);
  const [loadingMajorsByCohort, setLoadingMajorsByCohort] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    name: "",
    minTotalCredits: "",
    minRequiredCredits: "",
    minElectiveCredits: "",
    minGpa: "",
    notes: "",
    batches: [] as string[],
  });
  const [batchMajors, setBatchMajors] = useState<Record<string, string[]>>({});
  const [errors, setErrors] = useState<{ name?: string; batches?: string; batchMajors?: string; detail?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchCohorts = async () => {
      try {
        setLoadingCohorts(true);
        const res = await api.get<CohortItem[]>("/api/v1/cohorts");
        const list = Array.isArray(res.data) ? res.data : [];
        const options = list
          .map((item) => Number(item.cohort_id))
          .filter((value) => Number.isFinite(value))
          .map((value) => String(value));

        setCohortOptions(Array.from(new Set(options)));
      } catch (error) {
        console.error("Load cohorts failed", error);
        setCohortOptions([]);
      } finally {
        setLoadingCohorts(false);
      }
    };

    fetchCohorts();
  }, [open]);

  useEffect(() => {
    if (!open || formData.batches.length === 0) return;

    const needFetch = formData.batches.filter((cohortId) => !majorOptionsByCohort[cohortId]);
    if (needFetch.length === 0) return;

    needFetch.forEach((cohortId) => {
      const fetchMajors = async () => {
        try {
          setLoadingMajorsByCohort((prev) => ({ ...prev, [cohortId]: true }));
          const res = await api.get<MajorByCohort[]>(`/api/v1/majors/by-cohort/${cohortId}`);
          const majors = Array.isArray(res.data) ? res.data : [];
          setMajorOptionsByCohort((prev) => ({
            ...prev,
            [cohortId]: majors.map((m) => ({
              id: m.major_id,
              name: m.major_name || m.name || String(m.major_id),
            })),
          }));
        } catch (error) {
          console.error(`Load majors failed for cohort ${cohortId}`, error);
          setMajorOptionsByCohort((prev) => ({ ...prev, [cohortId]: [] }));
        } finally {
          setLoadingMajorsByCohort((prev) => ({ ...prev, [cohortId]: false }));
        }
      };

      fetchMajors();
    });
  }, [open, formData.batches, majorOptionsByCohort]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    let { value } = e.target;

    if (name === "minRequiredCredits" || name === "minElectiveCredits") {
      value = sanitizeNonNegativeNumberInput(value, false);
    }

    if (name === "minGpa") {
      value = sanitizeNonNegativeNumberInput(value, true, 4.0);
    }

    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "minRequiredCredits" || name === "minElectiveCredits") {
        next.minTotalCredits = calculateMinTotalCredits(next.minRequiredCredits, next.minElectiveCredits);
      }

      return next;
    });

    if (errors[e.target.name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const handleBatchesChange = (batches: string[]) => {
    setFormData((prev) => ({ ...prev, batches }));
    if (errors.batches) setErrors((prev) => ({ ...prev, batches: undefined }));

    setBatchMajors((prev) => {
      const next: Record<string, string[]> = {};
      batches.forEach((batch) => {
        next[batch] = prev[batch] ?? [];
      });
      return next;
    });

    if (errors.batchMajors) setErrors((prev) => ({ ...prev, batchMajors: undefined }));
  };

  const handleBatchMajorsChange = (batch: string, majors: string[]) => {
    setBatchMajors((prev) => ({ ...prev, [batch]: majors }));
    if (errors.batchMajors) setErrors((prev) => ({ ...prev, batchMajors: undefined }));
  };

  const handleAdd = async () => {
    const minRequiredCredits = toNumberWithDefault(formData.minRequiredCredits, DEFAULT_MIN_REQUIRED_CREDITS);
    const minElectiveCredits = toNumberWithDefault(formData.minElectiveCredits, DEFAULT_MIN_ELECTIVE_CREDITS);
    const minGpa = toNumberWithDefault(formData.minGpa, DEFAULT_MIN_GPA);
    const minTotalCredits =
      minRequiredCredits !== null && minElectiveCredits !== null
        ? minRequiredCredits + minElectiveCredits
        : null;

    const newErrors: { name?: string; batches?: string; batchMajors?: string; detail?: string } = {};
    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập tên quy chế";
    if (!formData.batches || formData.batches.length === 0) newErrors.batches = "Vui lòng chọn ít nhất một khoá áp dụng";
    const hasInvalidBatch = formData.batches.some((batch) => (batchMajors[batch] ?? []).length === 0);
    if (hasInvalidBatch) newErrors.batchMajors = "Vui lòng chọn chuyên ngành cho từng khóa áp dụng";
    if (minTotalCredits === null || minRequiredCredits === null || minElectiveCredits === null || minGpa === null) {
      newErrors.detail = "Vui lòng nhập đúng định dạng số cho tín chỉ và GPA";
    }
    if (
      minTotalCredits != null && minRequiredCredits != null && minElectiveCredits != null && minGpa != null &&
      (minTotalCredits < 0 || minRequiredCredits < 0 || minElectiveCredits < 0 || minGpa < 0)
    ) {
      newErrors.detail = "Tín chỉ tối thiểu và GPA tối thiểu không được âm";
    }
    if (minGpa != null && minGpa > 4.0) {
      newErrors.detail = "GPA tối thiểu không được vượt quá 4.0";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const applications = formData.batches.flatMap((batch) => {
      const cohortId = Number(batch);
      if (!Number.isFinite(cohortId)) return [];

      const selectedMajorValues = batchMajors[batch] ?? [];
      const majorOptions = majorOptionsByCohort[batch] ?? [];

      return selectedMajorValues
        .map((majorValue) => {
          const majorById = majorOptions.find((m) => String(m.id) === String(majorValue).trim());
          const majorByName = majorOptions.find((m) => normalizeText(m.name) === normalizeText(majorValue));
          const matchedMajor = majorById ?? majorByName;

          const resolvedMajorId = Number(matchedMajor?.id ?? majorValue);
          if (!Number.isFinite(resolvedMajorId)) return null;

          return {
            cohort_id: cohortId,
            major_id: String(resolvedMajorId),
          };
        })
        .filter((item): item is { cohort_id: number; major_id: string } => Boolean(item));
    });

    const payload = {
      name: formData.name.trim(),
      min_total_credits: minTotalCredits,
      min_required_credits: minRequiredCredits,
      min_elective_credits: minElectiveCredits,
      min_gpa: minGpa,
      applications,
      notes: formData.notes.trim(),
    };

    try {
      setSubmitting(true);
      const res = await api.post("/api/v1/graduation-requirements", payload);
      if (onAdd) onAdd(res.data);

      setFormData({
        name: "",
        minTotalCredits: "",
        minRequiredCredits: "",
        minElectiveCredits: "",
        minGpa: "",
        notes: "",
        batches: [],
      });
      setBatchMajors({});
      setMajorOptionsByCohort({});
      setLoadingMajorsByCohort({});
      setErrors({});
      onOpenChange(false);
    } catch (error: any) {
      const message =
        typeof error?.response?.data === "string"
          ? error.response.data
          : error?.response?.data?.detail || error?.response?.data?.message || "Không thể tạo quy chế. Vui lòng thử lại.";
      setErrors((prev) => ({ ...prev, detail: message }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (submitting) return;
    setFormData({
      name: "",
      minTotalCredits: "",
      minRequiredCredits: "",
      minElectiveCredits: "",
      minGpa: "",
      notes: "",
      batches: [],
    });
    setBatchMajors({});
    setMajorOptionsByCohort({});
    setLoadingMajorsByCohort({});
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Thêm quy chế</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-800">
              Tên quy chế <span className="text-red-500">*</span>
            </Label>
            <Input
              name="name"
              placeholder="Nhập tên quy chế"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-800">Tổng tín chỉ tối thiểu</Label>
              <Input
                name="minTotalCredits"
                type="text"
                inputMode="numeric"
                value={formData.minTotalCredits}
                placeholder="120"
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-800">Tín chỉ bắt buộc tối thiểu</Label>
              <Input
                name="minRequiredCredits"
                type="text"
                inputMode="numeric"
                value={formData.minRequiredCredits}
                onChange={handleInputChange}
                placeholder="90"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-800">Tín chỉ tự chọn tối thiểu</Label>
              <Input
                name="minElectiveCredits"
                type="text"
                inputMode="numeric"
                value={formData.minElectiveCredits}
                onChange={handleInputChange}
                placeholder="30"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-800">GPA tối thiểu</Label>
              <Input
                name="minGpa"
                type="text"
                inputMode="decimal"
                value={formData.minGpa}
                onChange={handleInputChange}
                placeholder="2.0"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-800">Ghi chú</Label>
            <Input name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Áp dụng từ khóa 44" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-800">
              Khóa áp dụng <span className="text-red-500">*</span>
            </Label>
            <MultiSelect
              options={cohortOptions}
              value={formData.batches}
              onChange={handleBatchesChange}
              placeholder={loadingCohorts ? "Đang tải khóa..." : "Chọn khoá áp dụng"}
              disabled={loadingCohorts}
            />
            {errors.batches && <p className="text-xs text-red-500 mt-1">{errors.batches}</p>}
          </div>

          <div className="pt-2 border-t border-gray-200 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Cấu hình chuyên ngành theo khóa</h3>

            {formData.batches.length === 0 ? (
              <p className="text-sm text-gray-500">Chọn khóa áp dụng để cấu hình chuyên ngành theo từng khóa.</p>
            ) : (
              <div className="space-y-4">
                {formData.batches.map((batch) => (
                  <div key={batch} className="rounded-md border border-gray-200 p-3 bg-gray-50/50 space-y-2">
                    <p className="text-sm font-semibold text-gray-900">Khóa {batch}</p>
                    <Label className="text-sm font-medium text-gray-800">Chuyên ngành áp dụng:</Label>
                    <MultiSelect
                      options={(majorOptionsByCohort[batch] ?? []).map((major) => major.name)}
                      value={batchMajors[batch] ?? []}
                      onChange={(majors) => handleBatchMajorsChange(batch, majors)}
                      placeholder={loadingMajorsByCohort[batch] ? "Đang tải chuyên ngành..." : "Chọn chuyên ngành áp dụng"}
                      disabled={Boolean(loadingMajorsByCohort[batch])}
                    />
                  </div>
                ))}
              </div>
            )}

            {errors.batchMajors && <p className="text-xs text-red-500 mt-1">{errors.batchMajors}</p>}
          </div>

          {errors.detail && <p className="text-xs text-red-500 mt-1">{errors.detail}</p>}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="h-9"
            disabled={submitting}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleAdd}
            className="bg-[#167FFC] hover:bg-[#1470E3] text-white h-9"
            disabled={submitting}
          >
            {submitting ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
