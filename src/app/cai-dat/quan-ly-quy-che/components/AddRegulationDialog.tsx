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
    const { name, value } = e.target;
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
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const applications = formData.batches.flatMap((batch) => {
      const cohortId = Number(batch);
      if (!Number.isFinite(cohortId)) return [];

      const selectedMajorNames = batchMajors[batch] ?? [];
      const majorOptions = majorOptionsByCohort[batch] ?? [];

      return selectedMajorNames
        .map((majorName) => {
          const major = majorOptions.find((m) => m.name === majorName);
          if (!major || !Number.isFinite(major.id)) return null;

          return {
            cohort_id: cohortId,
            major_id: major.id,
          };
        })
        .filter((item): item is { cohort_id: number; major_id: number } => Boolean(item));
    });

    if (applications.length === 0) {
      setErrors((prev) => ({ ...prev, detail: "Không tạo được dữ liệu cặp khóa/chuyên ngành hợp lệ" }));
      return;
    }

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
                type="number"
                value={formData.minTotalCredits}
                placeholder="120"
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-800">Tín chỉ bắt buộc tối thiểu</Label>
              <Input name="minRequiredCredits" type="number" value={formData.minRequiredCredits} onChange={handleInputChange} placeholder="90" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-800">Tín chỉ tự chọn tối thiểu</Label>
              <Input name="minElectiveCredits" type="number" value={formData.minElectiveCredits} onChange={handleInputChange} placeholder="30" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-800">GPA tối thiểu</Label>
              <Input name="minGpa" type="number" step="0.01" value={formData.minGpa} onChange={handleInputChange} placeholder="2.0" />
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
