"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Regulation } from "./RegulationManagementTable";

export type RegulationFormPayload = {
  name: string;
  min_total_credits: number;
  min_required_credits: number;
  min_elective_credits: number;
  min_gpa: number;
  required_certificates: string[];
  cohort_ids: number[];
  major_ids: number[];
  notes: string;
};

type RegulationFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  regulation?: Regulation;
  onSubmit: (payload: RegulationFormPayload) => void;
};

type FormState = {
  name: string;
  min_total_credits: string;
  min_required_credits: string;
  min_elective_credits: string;
  min_gpa: string;
  required_certificates: string;
  cohort_ids: string;
  major_ids: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  min_total_credits: "",
  min_required_credits: "",
  min_elective_credits: "",
  min_gpa: "",
  required_certificates: "",
  cohort_ids: "",
  major_ids: "",
  notes: "",
};

const toCommaString = (values?: Array<string | number>) =>
  Array.isArray(values) ? values.map((value) => String(value)).join(", ") : "";

const parseStringList = (raw: string): string[] =>
  raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const parseNumberList = (raw: string): number[] =>
  parseStringList(raw)
    .map((item) => Number(item))
    .filter((value) => Number.isFinite(value));

export default function RegulationFormDialog({ open, onOpenChange, mode, regulation, onSubmit }: RegulationFormDialogProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && regulation) {
      setForm({
        name: regulation.name || "",
        min_total_credits: regulation.min_total_credits != null ? String(regulation.min_total_credits) : "",
        min_required_credits: regulation.min_required_credits != null ? String(regulation.min_required_credits) : "",
        min_elective_credits: regulation.min_elective_credits != null ? String(regulation.min_elective_credits) : "",
        min_gpa: regulation.min_gpa != null ? String(regulation.min_gpa) : "",
        required_certificates: toCommaString(regulation.required_certificates),
        cohort_ids: toCommaString(regulation.cohort_ids),
        major_ids: toCommaString(regulation.major_ids),
        notes: regulation.notes || "",
      });
    } else {
      setForm(EMPTY_FORM);
    }

    setError("");
  }, [open, mode, regulation]);

  const updateField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (error) setError("");
  };

  const handleSubmit = () => {
    const payload: RegulationFormPayload = {
      name: form.name.trim(),
      min_total_credits: Number(form.min_total_credits),
      min_required_credits: Number(form.min_required_credits),
      min_elective_credits: Number(form.min_elective_credits),
      min_gpa: Number(form.min_gpa),
      required_certificates: parseStringList(form.required_certificates),
      cohort_ids: parseNumberList(form.cohort_ids),
      major_ids: parseNumberList(form.major_ids),
      notes: form.notes.trim(),
    };

    if (!payload.name) {
      setError("Vui lòng nhập tên quy chế");
      return;
    }

    if (!Number.isFinite(payload.min_total_credits) || !Number.isFinite(payload.min_required_credits) || !Number.isFinite(payload.min_elective_credits) || !Number.isFinite(payload.min_gpa)) {
      setError("Vui lòng nhập đúng định dạng số cho tín chỉ và GPA");
      return;
    }

    if (payload.cohort_ids.length === 0) {
      setError("Vui lòng nhập ít nhất một cohort_id");
      return;
    }

    if (payload.major_ids.length === 0) {
      setError("Vui lòng nhập ít nhất một major_id");
      return;
    }

    onSubmit(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{mode === "add" ? "Thêm quy chế" : "Sửa quy chế"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tên quy chế</Label>
            <Input value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Chuẩn CNTT 2020" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tổng tín chỉ tối thiểu</Label>
              <Input type="number" value={form.min_total_credits} onChange={(e) => updateField("min_total_credits", e.target.value)} placeholder="120" />
            </div>
            <div className="space-y-2">
              <Label>Tín chỉ bắt buộc tối thiểu</Label>
              <Input type="number" value={form.min_required_credits} onChange={(e) => updateField("min_required_credits", e.target.value)} placeholder="90" />
            </div>
            <div className="space-y-2">
              <Label>Tín chỉ tự chọn tối thiểu</Label>
              <Input type="number" value={form.min_elective_credits} onChange={(e) => updateField("min_elective_credits", e.target.value)} placeholder="30" />
            </div>
            <div className="space-y-2">
              <Label>GPA tối thiểu</Label>
              <Input type="number" step="0.01" value={form.min_gpa} onChange={(e) => updateField("min_gpa", e.target.value)} placeholder="2.0" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Chứng chỉ bắt buộc (phân tách bằng dấu phẩy)</Label>
            <Input
              value={form.required_certificates}
              onChange={(e) => updateField("required_certificates", e.target.value)}
              placeholder="TOEIC_550, TIN_HOC_CƠ_BẢN"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cohort IDs (phân tách bằng dấu phẩy)</Label>
              <Input value={form.cohort_ids} onChange={(e) => updateField("cohort_ids", e.target.value)} placeholder="44, 45, 46" />
            </div>
            <div className="space-y-2">
              <Label>Major IDs (phân tách bằng dấu phẩy)</Label>
              <Input value={form.major_ids} onChange={(e) => updateField("major_ids", e.target.value)} placeholder="1, 2, 3" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ghi chú</Label>
            <Input value={form.notes} onChange={(e) => updateField("notes", e.target.value)} placeholder="Áp dụng từ khóa 44" />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-9">
            Hủy
          </Button>
          <Button type="button" onClick={handleSubmit} className="bg-[#167FFC] hover:bg-[#1470E3] text-white h-9">
            Lưu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
