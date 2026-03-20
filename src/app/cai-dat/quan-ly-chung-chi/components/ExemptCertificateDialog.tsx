"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { api } from "@/lib/api";
import axios from "axios";

type CertificateOption = {
  certificate_id: number;
  name: string;
};

type CertificateListResponse =
  | CertificateOption[]
  | { items?: CertificateOption[]; data?: CertificateOption[]; results?: CertificateOption[] };

type CertificateCohort = {
  cohort_id: number;
  name: string | null;
  year_start?: number;
  year_end?: number;
};

type CertificateCohortResponse = {
  cohorts?: CertificateCohort[];
};

type MajorByCohort = {
  major_id: number;
  major_name?: string;
  name?: string;
};

export default function ExemptCertificateDialog({ open, onOpenChange, certificate, onUpdate, isEdit }: any) {
  const [formData, setFormData] = useState<{ certificateId: string; batches: string[] }>({ certificateId: "", batches: [] });
  const [certificateOptions, setCertificateOptions] = useState<CertificateOption[]>([]);
  const [cohortOptions, setCohortOptions] = useState<string[]>([]);
  const [majorOptionsByCohort, setMajorOptionsByCohort] = useState<Record<string, { id: number; name: string }[]>>({});
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  const [loadingCohorts, setLoadingCohorts] = useState(false);
  const [loadingMajorsByCohort, setLoadingMajorsByCohort] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [batchMajors, setBatchMajors] = useState<Record<string, string[]>>({});
  const [errors, setErrors] = useState<{ certificateId?: string; batches?: string; batchMajors?: string; submit?: string }>({});

  useEffect(() => {
    if (!open) return;

    const fetchCertificates = async () => {
      try {
        setLoadingCertificates(true);
        const res = await api.get<CertificateListResponse>("/api/v1/certificates", {
          params: { page: 1, size: 100 },
        });

        const payload = res.data;
        const list = Array.isArray(payload)
          ? payload
          : payload.items || payload.data || payload.results || [];

        setCertificateOptions(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Load certificates failed", err);
        setCertificateOptions([]);
      } finally {
        setLoadingCertificates(false);
      }
    };

    fetchCertificates();
  }, [open]);

  useEffect(() => {
    if (certificate && open) {
      setFormData({
        certificateId: String(certificate.id || ""),
        batches: Array.isArray(certificate.batches) ? certificate.batches : [],
      });
      setBatchMajors({});
      setCohortOptions(Array.isArray(certificate.batches) ? certificate.batches : []);
    } else if (!open) {
      setFormData({ certificateId: "", batches: [] });
      setBatchMajors({});
      setCohortOptions([]);
      setMajorOptionsByCohort({});
    }
  }, [certificate, open]);

  useEffect(() => {
    if (!open || !formData.certificateId) return;

    const fetchCertificateCohorts = async () => {
      try {
        setLoadingCohorts(true);
        const res = await api.get<CertificateCohortResponse>(`/api/v1/certificates/${formData.certificateId}/cohorts`);
        const cohorts = Array.isArray(res.data?.cohorts) ? res.data.cohorts : [];
        setCohortOptions(
          cohorts
            .map((c) => Number(c.cohort_id))
            .filter((id) => Number.isFinite(id))
            .map((id) => String(id))
        );
      } catch (err) {
        console.error("Load certificate cohorts failed", err);
        setCohortOptions([]);
      } finally {
        setLoadingCohorts(false);
      }
    };

    fetchCertificateCohorts();
  }, [open, formData.certificateId]);

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
        } catch (err) {
          console.error(`Load majors failed for cohort ${cohortId}`, err);
          setMajorOptionsByCohort((prev) => ({ ...prev, [cohortId]: [] }));
        } finally {
          setLoadingMajorsByCohort((prev) => ({ ...prev, [cohortId]: false }));
        }
      };

      fetchMajors();
    });
  }, [open, formData.batches, majorOptionsByCohort]);

  const handleTypeChange = (certificateId: string) => {
    setFormData({ certificateId, batches: [] });
    setBatchMajors({});
    setCohortOptions([]);
    if (errors.certificateId) setErrors(prev => ({ ...prev, certificateId: undefined }));
  };

  const handleBatchesChange = (batches: string[]) => {
    setFormData(prev => ({ ...prev, batches }));
    if (errors.batches) setErrors(prev => ({ ...prev, batches: undefined }));

    setBatchMajors((prev) => {
      const next: Record<string, string[]> = {};
      batches.forEach((batch) => {
        next[batch] = prev[batch] ?? [];
      });
      return next;
    });

    if (errors.batchMajors) setErrors(prev => ({ ...prev, batchMajors: undefined }));
  };

  const handleBatchMajorsChange = (batch: string, majors: string[]) => {
    setBatchMajors((prev) => ({ ...prev, [batch]: majors }));
    if (errors.batchMajors) setErrors(prev => ({ ...prev, batchMajors: undefined }));
  };

  const handleSubmit = async () => {
    const newErrors: { certificateId?: string; batches?: string; batchMajors?: string; submit?: string } = {};
    if (!formData.certificateId) newErrors.certificateId = "Vui lòng chọn loại chứng chỉ";
    if (!formData.batches || formData.batches.length === 0) newErrors.batches = "Vui lòng chọn ít nhất một khoá miễn";
    const hasInvalidBatch = formData.batches.some((batch) => (batchMajors[batch] ?? []).length === 0);
    if (hasInvalidBatch) newErrors.batchMajors = "Vui lòng chọn chuyên ngành cho từng khóa miễn";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const pairs = formData.batches.flatMap((batch) => {
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
    }) as Array<{ cohort_id: number; major_id: number }>;

    if (pairs.length === 0) {
      setErrors((prev) => ({ ...prev, submit: "Không tạo được dữ liệu miễn chứng chỉ hợp lệ" }));
      return;
    }

    try {
      setSubmitting(true);
      if (isEdit) {
        const exemptions = pairs.reduce<Array<{ cohort_id: number; major_ids: number[] }>>((acc, item) => {
          const existed = acc.find((x) => x.cohort_id === item.cohort_id);
          if (existed) {
            if (!existed.major_ids.includes(item.major_id)) existed.major_ids.push(item.major_id);
            return acc;
          }

          acc.push({
            cohort_id: item.cohort_id,
            major_ids: [item.major_id],
          });
          return acc;
        }, []);

        const selectedCertificate = certificateOptions.find((item) => String(item.certificate_id) === formData.certificateId);
        const fallbackName = Array.isArray(certificate?.types) ? certificate.types[0] : "";

        await api.put(`/api/v1/certificates/${formData.certificateId}/exemption`, {
          name: selectedCertificate?.name || fallbackName || "",
          exemptions,
        });
      } else {
        await api.post(`/api/v1/certificates/${formData.certificateId}/exemptions`, { pairs });
      }

      if (onUpdate) onUpdate({ certificate_id: Number(formData.certificateId), pairs });
      setErrors({});
      onOpenChange(false);
    } catch (err) {
      console.error(isEdit ? "Update certificate exemptions failed" : "Create certificate exemptions failed", err);
      const backendMessage = axios.isAxiosError(err)
        ? (typeof err.response?.data === "string"
          ? err.response.data
          : (err.response?.data?.message || err.response?.data?.detail || err.message))
        : "";

      setErrors((prev) => ({
        ...prev,
        submit: backendMessage
          ? `Không thể ${isEdit ? "cập nhật" : "thêm"} miễn chứng chỉ: ${backendMessage}`
          : `Không thể ${isEdit ? "cập nhật" : "thêm"} miễn chứng chỉ. Vui lòng thử lại.`,
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
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{isEdit ? "Sửa" : "Thêm"} miễn chứng chỉ</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-800">
              Loại chứng chỉ <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.certificateId} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại chứng chỉ" />
              </SelectTrigger>
              <SelectContent>
                {certificateOptions.map((item) => (
                  <SelectItem key={item.certificate_id} value={String(item.certificate_id)}>{item.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {loadingCertificates && <p className="text-xs text-gray-500 mt-1">Đang tải loại chứng chỉ...</p>}
            {errors.certificateId && <p className="text-xs text-red-500 mt-1">{errors.certificateId}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-800">
              Khóa miễn <span className="text-red-500">*</span>
            </Label>
            <MultiSelect
              options={cohortOptions}
              value={formData.batches}
              onChange={handleBatchesChange}
              placeholder={loadingCohorts ? "Đang tải khóa miễn..." : "Chọn khóa miễn"}
              disabled={!formData.certificateId || loadingCohorts || submitting}
            />
            {errors.batches && <p className="text-xs text-red-500 mt-1">{errors.batches}</p>}
          </div>
          <div className="pt-2 border-t border-gray-200 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Cấu hình miễn theo khóa</h3>

            {formData.batches.length === 0 ? (
              <p className="text-sm text-gray-500">Chọn khóa miễn để cấu hình chuyên ngành theo từng khóa.</p>
            ) : (
              <div className="space-y-4">
                {formData.batches.map((batch) => (
                  <div key={batch} className="rounded-md border border-gray-200 p-3 bg-gray-50/50 space-y-2">
                    <p className="text-sm font-semibold text-gray-900">Khóa {batch}</p>
                    <Label className="text-sm font-medium text-gray-800">Chuyên ngành được miễn:</Label>
                    <MultiSelect
                      options={(majorOptionsByCohort[batch] ?? []).map((major) => major.name)}
                      value={batchMajors[batch] ?? []}
                      onChange={(majors) => handleBatchMajorsChange(batch, majors)}
                      placeholder={loadingMajorsByCohort[batch] ? "Đang tải chuyên ngành..." : "Chọn chuyên ngành được miễn"}
                      disabled={Boolean(loadingMajorsByCohort[batch]) || submitting}
                    />
                  </div>
                ))}
              </div>
            )}

            {errors.batchMajors && <p className="text-xs text-red-500 mt-1">{errors.batchMajors}</p>}
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
              onClick={handleSubmit}
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
