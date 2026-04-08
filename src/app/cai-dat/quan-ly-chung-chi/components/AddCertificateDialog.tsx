"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { api } from "@/lib/api";

type AddCertificateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (data: any) => void;
};

type Cohort = {
  cohort_id: number;
};
export default function AddCertificateDialog({ open, onOpenChange, onAdd }: AddCertificateDialogProps) {
  const [formData, setFormData] = useState({ name: "", cohortIds: [] as string[] });
  const [cohortOptions, setCohortOptions] = useState<string[]>([]);
  const [loadingCohorts, setLoadingCohorts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; cohort_ids?: string; submit?: string }>({});

  useEffect(() => {
    if (!open) return;

    const fetchCohorts = async () => {
      try {
        setLoadingCohorts(true);
        const res = await api.get<Cohort[]>("/api/v1/cohorts");
        const cohorts = Array.isArray(res.data) ? res.data : [];
        setCohortOptions(cohorts.map((cohort) => String(cohort.cohort_id)));
      } catch (err) {
        console.error("Load cohorts failed", err);
        setCohortOptions([]);
      } finally {
        setLoadingCohorts(false);
      }
    };

    fetchCohorts();
  }, [open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const handleCohortChange = (cohortIds: string[]) => {
    setFormData((prev) => ({ ...prev, cohortIds }));
    if (errors.cohort_ids) setErrors((prev) => ({ ...prev, cohort_ids: undefined }));
  };

  const normalizeCohortIds = (values: string[]) => {
    return Array.from(
      new Set(
        values
          .map((value) => Number(value))
          .filter((id) => Number.isInteger(id) && id > 0)
      )
    );
  };

  const handleAdd = async () => {
    const newErrors: { name?: string; cohort_ids?: string; submit?: string } = {};
    const normalizedCohortIds = normalizeCohortIds(formData.cohortIds);

    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập tên chứng chỉ";
    if (normalizedCohortIds.length === 0) newErrors.cohort_ids = "Vui lòng chọn ít nhất một khoá áp dụng";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const payload = {
      name: formData.name.trim(),
      cohort_ids: normalizedCohortIds,
    };

    try {
      setSubmitting(true);
      const res = await api.post("/api/v1/certificates", payload);
      if (onAdd) onAdd(res.data);
      setFormData({ name: "", cohortIds: [] });
      setErrors({});
      onOpenChange(false);
    } catch (err) {
      console.error("Create certificate failed", err);
      setErrors((prev) => ({ ...prev, submit: "Không thể tạo chứng chỉ. Vui lòng thử lại." }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (submitting) return;
    setFormData({ name: "", cohortIds: [] });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Thêm chứng chỉ</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-800">
              Tên chứng chỉ <span className="text-red-500">*</span>
            </Label>
            <Input
              name="name"
              placeholder="Nhập tên chứng chỉ"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-800">
              Khóa áp dụng <span className="text-red-500">*</span>
            </Label>
            <MultiSelect
              options={cohortOptions}
              value={formData.cohortIds}
              onChange={handleCohortChange}
              placeholder={loadingCohorts ? "Đang tải danh sách khóa..." : "Chọn khoá áp dụng"}
              disabled={loadingCohorts || submitting}
            />
            {errors.cohort_ids && <p className="text-xs text-red-500 mt-1">{errors.cohort_ids}</p>}
          </div>
          {errors.submit && <p className="text-xs text-red-500 mt-1">{errors.submit}</p>}
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
              disabled={submitting || loadingCohorts}
            >
              {submitting ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
