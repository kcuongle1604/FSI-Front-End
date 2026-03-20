"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { Regulation } from "../page";
import { api } from "@/lib/api";
import axios from "axios";

type CohortItem = {
  cohort_id?: number;
};

type MajorByCohort = {
  major_id: number;
  major_name?: string;
  name?: string;
};

type EditRegulationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  regulation?: Regulation;
  onUpdate?: (data: any) => void;
};

export default function EditRegulationDialog({ open, onOpenChange, regulation, onUpdate }: EditRegulationDialogProps) {
  const [certificateOptions, setCertificateOptions] = useState<string[]>([]);
  const [cohortOptions, setCohortOptions] = useState<string[]>([]);
  const [majorOptionsByCohort, setMajorOptionsByCohort] = useState<Record<string, { id: number; name: string }[]>>({});
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  const [loadingCohorts, setLoadingCohorts] = useState(false);
  const [loadingMajorsByCohort, setLoadingMajorsByCohort] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    name: "",
    minTotalCredits: "",
    minRequiredCredits: "",
    minElectiveCredits: "",
    minGpa: "",
    requiredCertificates: [] as string[],
    notes: "",
    batches: [] as string[],
  });
  const [batchMajors, setBatchMajors] = useState<Record<string, string[]>>({});
  const [errors, setErrors] = useState<{ name?: string; batches?: string; batchMajors?: string; detail?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchCertificates = async () => {
      try {
        setLoadingCertificates(true);
        const mappedOptions: string[] = [];
        const size = 100;
        let page = 1;

        while (true) {
          const res = await api.get<any>("/api/v1/certificates", { params: { page, size } });
          const payload = res.data;
          const list = Array.isArray(payload)
            ? payload
            : payload.items || payload.data || payload.results || [];

          const pageOptions = (Array.isArray(list) ? list : [])
            .map((item: any) => String(item.code || item.name || item.certificate_id || "").trim())
            .filter(Boolean);

          mappedOptions.push(...pageOptions);

          if (pageOptions.length < size) break;
          page += 1;
        }

        setCertificateOptions(Array.from(new Set(mappedOptions)));
      } catch (error) {
        console.error("Load certificates failed", error);
        setCertificateOptions([]);
      } finally {
        setLoadingCertificates(false);
      }
    };

    fetchCertificates();
  }, [open]);

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

  useEffect(() => {
    if (regulation && open) {
      const batches = Array.isArray((regulation as any).batches)
        ? (regulation as any).batches.map((value: unknown) => String(value))
        : [];
      const specializations = Array.isArray((regulation as any).specializations)
        ? (regulation as any).specializations.map((value: unknown) => String(value))
        : [];

      const nextBatchMajors: Record<string, string[]> = {};
      batches.forEach((batch: string) => {
        nextBatchMajors[batch] = [...specializations];
      });

      setFormData({
        name: regulation.name || "",
        minTotalCredits: regulation.min_total_credits != null ? String(regulation.min_total_credits) : "",
        minRequiredCredits: regulation.min_required_credits != null ? String(regulation.min_required_credits) : "",
        minElectiveCredits: regulation.min_elective_credits != null ? String(regulation.min_elective_credits) : "",
        minGpa: regulation.min_gpa != null ? String(regulation.min_gpa) : "",
        requiredCertificates: Array.isArray(regulation.required_certificates)
          ? regulation.required_certificates.map((value) => String(value))
          : [],
        notes: regulation.notes || "",
        batches,
      });
      setBatchMajors(nextBatchMajors);
    }
  }, [regulation, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  const handleRequiredCertificatesChange = (requiredCertificates: string[]) => {
    setFormData((prev) => ({ ...prev, requiredCertificates }));
  };

  const handleBatchMajorsChange = (batch: string, majors: string[]) => {
    setBatchMajors((prev) => ({ ...prev, [batch]: majors }));
    if (errors.batchMajors) setErrors((prev) => ({ ...prev, batchMajors: undefined }));
  };

  const handleUpdate = async () => {
    const newErrors: { name?: string; detail?: string } = {};
    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập tên quy chế";
    if (!Number.isFinite(Number(formData.minTotalCredits)) || !Number.isFinite(Number(formData.minRequiredCredits)) || !Number.isFinite(Number(formData.minElectiveCredits)) || !Number.isFinite(Number(formData.minGpa))) {
      newErrors.detail = "Vui lòng nhập đúng định dạng số cho tín chỉ và GPA";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (!regulation?.id) {
      setErrors((prev) => ({ ...prev, detail: "Không xác định được quy chế cần cập nhật" }));
      return;
    }

    const payload = {
      name: formData.name.trim(),
      min_total_credits: Number(formData.minTotalCredits),
      min_required_credits: Number(formData.minRequiredCredits),
      min_elective_credits: Number(formData.minElectiveCredits),
      min_gpa: Number(formData.minGpa),
      required_certificates: formData.requiredCertificates,
      notes: formData.notes.trim(),
    };

    try {
      setSubmitting(true);
      const res = await api.put(`/api/v1/graduation-requirements/${regulation.id}`, payload);
      if (onUpdate) onUpdate(res.data);
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      const backendMessage = axios.isAxiosError(error)
        ? (typeof error.response?.data === "string"
          ? error.response.data
          : (error.response?.data?.detail || error.response?.data?.message || error.message))
        : "";

      setErrors((prev) => ({
        ...prev,
        detail: backendMessage || "Không thể cập nhật quy chế. Vui lòng thử lại.",
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Sửa quy chế</DialogTitle>
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
              <Input name="minTotalCredits" type="number" value={formData.minTotalCredits} onChange={handleInputChange} placeholder="120" />
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
            <Label className="text-sm font-medium text-gray-800">Chứng chỉ bắt buộc</Label>
            <MultiSelect
              options={certificateOptions}
              value={formData.requiredCertificates}
              onChange={handleRequiredCertificatesChange}
              placeholder={loadingCertificates ? "Đang tải chứng chỉ..." : "Chọn chứng chỉ bắt buộc"}
              disabled={loadingCertificates}
            />
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
              disabled={loadingCohorts || submitting}
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
                      disabled={Boolean(loadingMajorsByCohort[batch]) || submitting}
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
            onClick={handleUpdate}
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
