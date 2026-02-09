"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Certificate } from "../page";
import { CERTIFICATE_TYPES } from "./certificate-types";

const BATCHES = ["48K", "49K", "50K", "51K", "52K"];
const MAJORS = [
  "Quản trị hệ thống thông tin",
  "Tin học quản lý",
  "Thống kê"
];

export default function ExemptCertificateDialog({ open, onOpenChange, certificate, onUpdate, isEdit }: any) {
  const [formData, setFormData] = useState<{ type: string; batches: string[]; majors: string[] }>({ type: "", batches: [], majors: [] });
  const [errors, setErrors] = useState<{ types?: string; batches?: string; majors?: string }>({});

  useEffect(() => {
    if (certificate && open) {
      setFormData({
        type: (certificate as any).type || ((certificate as any).types && (certificate as any).types[0]) || "",
        batches: Array.isArray((certificate as any).batches)
          ? (certificate as any).batches
          : (certificate as any).batch
            ? [(certificate as any).batch]
            : [],
        majors: Array.isArray((certificate as any).majors)
          ? (certificate as any).majors
          : (certificate as any).major
            ? [(certificate as any).major]
            : [],
      });
    } else if (!open) {
      setFormData({ type: "", batches: [], majors: [] });
    }
  }, [certificate, open]);

  const handleTypeChange = (type: string) => {
    setFormData(prev => ({ ...prev, type }));
    if (errors.types) setErrors(prev => ({ ...prev, types: undefined }));
  };

  const handleBatchesChange = (batches: string[]) => {
    setFormData(prev => ({ ...prev, batches }));
    if (errors.batches) setErrors(prev => ({ ...prev, batches: undefined }));
  };

  const handleMajorsChange = (majors: string[]) => {
    setFormData(prev => ({ ...prev, majors }));
    if (errors.majors) setErrors(prev => ({ ...prev, majors: undefined }));
  };

  const handleSubmit = () => {
    const newErrors: { types?: string; batches?: string; majors?: string } = {};
    if (!formData.type) newErrors.types = "Vui lòng chọn loại chứng chỉ";
    if (!formData.batches || formData.batches.length === 0) newErrors.batches = "Vui lòng chọn ít nhất một khoá miễn";
    if (!formData.majors || formData.majors.length === 0) newErrors.majors = "Vui lòng chọn ít nhất một chuyên ngành miễn";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    if (onUpdate) onUpdate({ ...formData, types: [formData.type] });
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
          <DialogTitle className="text-lg font-bold">{isEdit ? "Sửa" : "Thêm"} miễn chứng chỉ</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-800">
              Loại chứng chỉ <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại chứng chỉ" />
              </SelectTrigger>
              <SelectContent>
                {CERTIFICATE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.types && <p className="text-xs text-red-500 mt-1">{errors.types}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-800">
              Khóa miễn <span className="text-red-500">*</span>
            </Label>
            <MultiSelect
              options={BATCHES}
              value={formData.batches}
              onChange={handleBatchesChange}
              placeholder="Chọn khóa miễn"
            />
            {errors.batches && <p className="text-xs text-red-500 mt-1">{errors.batches}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-800">
              Chuyên ngành miễn <span className="text-red-500">*</span>
            </Label>
            <MultiSelect
              options={MAJORS}
              value={formData.majors}
              onChange={handleMajorsChange}
              placeholder="Chọn chuyên ngành miễn"
            />
            {errors.majors && <p className="text-xs text-red-500 mt-1">{errors.majors}</p>}
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
              onClick={handleSubmit}
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
