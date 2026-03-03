"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { Certificate } from "../page";

type EditCertificateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificate?: Certificate;
  onUpdate?: (data: any) => void;
};

const BATCHES = ["48K", "49K", "50K", "51K", "52K"];
export default function EditCertificateDialog({ open, onOpenChange, certificate, onUpdate }: EditCertificateDialogProps) {
  const [formData, setFormData] = useState<{ name: string; batches: string[] }>({ name: "", batches: [] });
  const [errors, setErrors] = useState<{ name?: string; batches?: string }>({});

  useEffect(() => {
    if (certificate && open) {
      setFormData({
        name: certificate.name || "",
        batches: Array.isArray((certificate as any).batches)
          ? (certificate as any).batches
          : (certificate as any).batch
            ? [(certificate as any).batch]
            : [],
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

  const handleUpdate = () => {
    const newErrors: { name?: string; batches?: string } = {};
    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập tên chứng chỉ";
    if (!formData.batches || formData.batches.length === 0) newErrors.batches = "Vui lòng chọn ít nhất một khoá áp dụng";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    if (onUpdate) onUpdate({ ...formData });
    setErrors({});
    onOpenChange(false);
  };

  const handleCancel = () => {
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
              options={BATCHES}
              value={formData.batches}
              onChange={handleBatchesChange}
              placeholder="Chọn khoá áp dụng"
            />
            {errors.batches && <p className="text-xs text-red-500 mt-1">{errors.batches}</p>}
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="h-9"
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleUpdate}
              className="bg-[#167FFC] hover:bg-[#1470E3] text-white h-9"
            >
              Lưu
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
