"use client";

import RegulationManagementTable, { Regulation } from "./components/RegulationManagementTable";
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import RegulationFormDialog, { RegulationFormPayload } from "./components/RegulationFormDialog";

const DUMMY_REGULATIONS: Regulation[] = [
  {
    id: 1,
    name: "Chuẩn CNTT 2020",
    batches: ["44", "45", "46"],
    specializations: ["1", "2", "3"],
    min_total_credits: 120,
    min_required_credits: 90,
    min_elective_credits: 30,
    min_gpa: 2.0,
    required_certificates: ["TOEIC_550", "TIN_HOC_CƠ_BẢN"],
    cohort_ids: [44, 45, 46],
    major_ids: [1, 2, 3],
    notes: "Áp dụng từ khóa 44",
  },
];

export default function QuanLyQuyChePage() {
  const [regulations, setRegulations] = useState<Regulation[]>(DUMMY_REGULATIONS);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [editingRegulation, setEditingRegulation] = useState<Regulation | undefined>(undefined);

  const mapPayloadToRegulation = (payload: RegulationFormPayload, id: number): Regulation => ({
    id,
    name: payload.name,
    batches: payload.cohort_ids.map(String),
    specializations: payload.major_ids.map(String),
    min_total_credits: payload.min_total_credits,
    min_required_credits: payload.min_required_credits,
    min_elective_credits: payload.min_elective_credits,
    min_gpa: payload.min_gpa,
    required_certificates: payload.required_certificates,
    cohort_ids: payload.cohort_ids,
    major_ids: payload.major_ids,
    notes: payload.notes,
  });

  const handleAddClick = () => {
    setEditingRegulation(undefined);
    setOpenFormDialog(true);
  };

  const handleEditClick = (regulation: Regulation) => {
    setEditingRegulation(regulation);
    setOpenFormDialog(true);
  };

  const handleFormSubmit = (payload: RegulationFormPayload) => {
    if (editingRegulation) {
      setRegulations((prev) =>
        prev.map((regulation) =>
          regulation.id === editingRegulation.id
            ? mapPayloadToRegulation(payload, editingRegulation.id)
            : regulation
        )
      );
      return;
    }

    const nextId = regulations.length > 0 ? Math.max(...regulations.map((regulation) => regulation.id)) + 1 : 1;
    setRegulations((prev) => [...prev, mapPayloadToRegulation(payload, nextId)]);
  };

  const handleDeleteClick = (regulation: Regulation) => {
    setRegulations((prev) => prev.filter((item) => item.id !== regulation.id));
  };

  return (
    <AppLayout showSearch={false}>
      <div className="h-full flex flex-col px-8 py-5 bg-slate-50/50">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý quy chế</h1>
        </div>
        <div className="flex justify-end mb-4">
          <Button
            onClick={handleAddClick}
            className="bg-[#167FFC] hover:bg-[#1470E3] text-white h-9 gap-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            Thêm
          </Button>
        </div>
        <RegulationManagementTable
          regulations={regulations}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
        />

        <RegulationFormDialog
          open={openFormDialog}
          onOpenChange={setOpenFormDialog}
          mode={editingRegulation ? "edit" : "add"}
          regulation={editingRegulation}
          onSubmit={handleFormSubmit}
        />
      </div>
    </AppLayout>
  );
}
