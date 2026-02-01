"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppLayout from "@/components/AppLayout";
import RegulationManagementTable from "./components/RegulationManagementTable";
import AddRegulationDialog from "./components/AddRegulationDialog";
import EditRegulationDialog from "./components/EditRegulationDialog";
import DeleteRegulationDialog from "./components/DeleteRegulationDialog";

export type Regulation = {
  id: number;
  name: string;
  code: string;
  issuedDate: string;
  batches?: string[];
  specializations?: string[];
}

export type RegulationCondition = {
  id: number;
  condition: string;
  operator: string;
  value: string;
};

export const regulations: Regulation[] = [
  {
    id: 1,
    name: "Quy chế xét tốt nghiệp từ khóa 46K",
    code: "QCXTN46K",
    issuedDate: "2022-01-01",
    batches: ["46K", "47K", "48K"],
    specializations: [
      "Tin học quản lý",
      "Quản trị hệ thống thông tin",
      "Thống kê"
    ]
  }
];

const regulationConditions: Record<number, RegulationCondition[]> = {};

export default function QuanLyQuyChePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedRegulation, setSelectedRegulation] = useState<Regulation | undefined>();

  const filteredRegulations = regulations.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout showSearch={false}>
      <div className="h-full flex flex-col px-8 py-5 bg-slate-50/50">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý quy chế</h1>
        </div>
        {/* Search and Actions Bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-[250px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Nhập tên quy chế..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-white"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              onClick={() => setOpenAddDialog(true)}
              className="bg-[#167FFC] hover:bg-[#1470E3] text-white h-9 gap-2 text-sm"
            >
              <Plus className="h-4 w-4" />
              Thêm
            </Button>
          </div>
        </div>
        {/* Table */}
        <RegulationManagementTable
          regulations={filteredRegulations}
          onEditClick={(r: Regulation) => { setSelectedRegulation(r); setOpenEditDialog(true); }}
          onDeleteClick={(r: Regulation) => { setSelectedRegulation(r); setOpenDeleteDialog(true); }}
          onDetailClick={(r: Regulation) => {
            window.location.href = `/cai-dat/quan-ly-quy-che/chi-tiet/${r.id}`;
          }}
        />
      </div>
      {/* Add Regulation Dialog */}
      <AddRegulationDialog
        open={openAddDialog}
        onOpenChange={setOpenAddDialog}
      />
      {/* Edit Regulation Dialog */}
      <EditRegulationDialog
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
        regulation={selectedRegulation}
      />
      {/* Delete Regulation Dialog */}
      <DeleteRegulationDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        regulation={selectedRegulation}
      />
    </AppLayout>
  );
}
