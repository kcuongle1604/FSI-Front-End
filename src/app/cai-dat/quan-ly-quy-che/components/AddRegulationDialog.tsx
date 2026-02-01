"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";

const BATCHES = ["48K", "49K", "50K", "51K", "52K"];
const SPECIALIZATIONS = [
  "Tin học quản lý",
  "Quản trị hệ thống thông tin",
  "Thống kê và kinh tế"
];

type AddRegulationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (data: any) => void;
};

export default function AddRegulationDialog({ open, onOpenChange, onAdd }: AddRegulationDialogProps) {
  const [formData, setFormData] = useState({ name: "", batches: [] as string[], specializations: [] as string[] });
  const [errors, setErrors] = useState<{ name?: string; batches?: string; specializations?: string }>({});

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
  const handleSpecializationsChange = (specializations: string[]) => {
    setFormData(prev => ({ ...prev, specializations }));
    if (errors.specializations) setErrors(prev => ({ ...prev, specializations: undefined }));
  };

  const handleAdd = () => {
    const newErrors: { name?: string; batches?: string; specializations?: string } = {};
    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập tên quy chế";
    if (!formData.batches || formData.batches.length === 0) newErrors.batches = "Vui lòng chọn ít nhất một khoá áp dụng";
    if (!formData.specializations || formData.specializations.length === 0) newErrors.specializations = "Vui lòng chọn ít nhất một chuyên ngành áp dụng";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    if (onAdd) onAdd(formData);
    setFormData({ name: "", batches: [], specializations: [] });
    setErrors({});
    onOpenChange(false);
  };

  const handleCancel = () => {
    setFormData({ name: "", batches: [], specializations: [] });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
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
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-800">
              Chuyên ngành áp dụng <span className="text-red-500">*</span>
            </Label>
            <MultiSelect
              options={SPECIALIZATIONS}
              value={formData.specializations}
              onChange={handleSpecializationsChange}
              placeholder="Chọn chuyên ngành áp dụng"
            />
            {errors.specializations && <p className="text-xs text-red-500 mt-1">{errors.specializations}</p>}
          </div>
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
            onClick={handleAdd}
            className="bg-[#167FFC] hover:bg-[#1470E3] text-white h-9"
          >
            Lưu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
