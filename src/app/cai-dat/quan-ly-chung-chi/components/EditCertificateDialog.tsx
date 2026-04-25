"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { api } from "@/lib/api";
import axios from "axios";
import { Certificate } from "../page";

type EditCertificateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificate?: Certificate;
  onUpdate?: (data: any) => void;
};

type Cohort = {
  cohort_id: number;
};

export default function EditCertificateDialog({ open, onOpenChange, certificate, onUpdate }: EditCertificateDialogProps) {
  const [formData, setFormData] = useState<{ name: string; batches: string[] }>({ name: "", batches: [] });
  const [cohortOptions, setCohortOptions] = useState<string[]>([]);
  const [loadingCohorts, setLoadingCohorts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; batches?: string; submit?: string }>({});

  const normalizeBatchValue = (value: string): string => {
    const raw = String(value || "").trim();
    if (!raw) return "";

    const asNumber = Number(raw);
    if (Number.isFinite(asNumber)) return String(asNumber);

    const digits = raw.match(/\d+/)?.[0];
    return digits || "";
  };

  useEffect(() => {
    if (!open) return;

    const fetchCohorts = async () => {
      try {
        setLoadingCohorts(true);
        const res = await api.get<Cohort[]>("/api/v1/cohorts");
        const cohorts = Array.isArray(res.data) ? res.data : [];
        setCohortOptions(
          cohorts
            .map((cohort) => Number(cohort.cohort_id))
            .filter((id) => Number.isFinite(id))
            .map((id) => String(id))
        );
      } catch (err) {
        console.error("Load cohorts failed", err);
        setCohortOptions([]);
      } finally {
        setLoadingCohorts(false);
      }
    };

    fetchCohorts();
  }, [open]);

  useEffect(() => {
    if (certificate && open) {
      const normalizedBatches = (Array.isArray((certificate as any).batches)
        ? (certificate as any).batches
        : (certificate as any).batch
          ? [(certificate as any).batch]
          : [])
        .map((value: string) => normalizeBatchValue(value))
        .filter(Boolean);

      setFormData({
        name: certificate.name || "",
        batches: normalizedBatches,
      });
    }
  }, [certificate, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const handleBatchesChange = (batches: string[]) => {
    setFormData(prev => ({ ...prev, batches }));
    if (errors.batches) setErrors(prev => ({ ...prev, batches: undefined }));
  };

  const handleUpdate = async () => {
    const newErrors: { name?: string; batches?: string; submit?: string } = {};
    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập tên chứng chỉ";
    if (!formData.batches || formData.batches.length === 0) newErrors.batches = "Vui lòng chọn ít nhất một khoá áp dụng";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (!certificate?.id) {
      setErrors((prev) => ({ ...prev, submit: "Không tìm thấy chứng chỉ cần cập nhật" }));
      return;
    }

    const payload = {
      name: formData.name.trim(),
      cohort_ids: formData.batches
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id)),
    };

    if (payload.cohort_ids.length === 0) {
      setErrors((prev) => ({ ...prev, submit: "Khóa áp dụng không hợp lệ" }));
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.put(`/api/v1/certificates/${certificate.id}/apply`, payload);
      if (onUpdate) onUpdate(res.data);
      setErrors({});
      onOpenChange(false);
    } catch (err) {
      console.error("Update certificate apply failed", err);
      const backendMessage = axios.isAxiosError(err)
        ? (typeof err.response?.data === "string"
          ? err.response.data
          : (err.response?.data?.message || err.response?.data?.detail || err.message))
        : "";

      setErrors((prev) => ({
        ...prev,
        submit: backendMessage
          ? `Không thể cập nhật chứng chỉ: ${backendMessage}`
          : "Không thể cập nhật chứng chỉ. Vui lòng thử lại.",
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (submitting) return;
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Sửa chứng chỉ</DialogTitle>
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
              value={formData.batches}
              onChange={handleBatchesChange}
              placeholder={loadingCohorts ? "Đang tải danh sách khóa..." : "Chọn khoá áp dụng"}
              disabled={loadingCohorts || submitting}
            />
            {errors.batches && <p className="text-xs text-red-500 mt-1">{errors.batches}</p>}
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
              onClick={handleUpdate}
              className="bg-[#167FFC] hover:bg-[#1470E3] text-white h-9"
              disabled={submitting}
            >
              {submitting ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
