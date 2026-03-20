"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppLayout from "@/components/AppLayout";
import RegulationManagementTable from "./components/RegulationManagementTable";
import AddRegulationDialog from "./components/AddRegulationDialog";
import EditRegulationDialog from "./components/EditRegulationDialog";
import DeleteRegulationDialog from "./components/DeleteRegulationDialog";
import { api } from "@/lib/api";
import axios from "axios";

export type Regulation = {
  id: number;
  name: string;
  code: string;
  issuedDate: string;
  batches?: string[];
  specializations?: string[];
  min_total_credits?: number;
  min_required_credits?: number;
  min_elective_credits?: number;
  min_gpa?: number;
  required_certificates?: string[];
  cohort_ids?: number[];
  major_ids?: number[];
  notes?: string;
}

export type RegulationCondition = {
  id: number;
  condition: string;
  operator: string;
  value: string;
};

type RegulationApplicationApiItem = {
  cohort_id?: number;
  cohort_name?: string;
  major_id?: number;
  major_name?: string;
};

type GraduationRequirementApiItem = {
  requirement_id?: number;
  id?: number;
  name?: string;
  min_total_credits?: number;
  min_required_credits?: number;
  min_elective_credits?: number;
  min_gpa?: number;
  required_certificates?: string[];
  applications?: RegulationApplicationApiItem[];
  notes?: string;
};

type GraduationRequirementListResponse =
  | GraduationRequirementApiItem[]
  | { items?: GraduationRequirementApiItem[]; data?: GraduationRequirementApiItem[]; results?: GraduationRequirementApiItem[]; total?: number };

// Kept for compatibility with detail page import.
export const regulations: Regulation[] = [];

export default function QuanLyQuyChePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [loadingRegulations, setLoadingRegulations] = useState(false);
  const [regulationError, setRegulationError] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedRegulation, setSelectedRegulation] = useState<Regulation | undefined>();

  const mapRegulationItem = (item: GraduationRequirementApiItem, index: number): Regulation => {
    const applications = Array.isArray(item.applications) ? item.applications : [];
    const batches = Array.from(new Set(applications
      .map((app) => String(app.cohort_name || app.cohort_id || "").trim())
      .filter(Boolean)));
    const specializations = Array.from(new Set(applications
      .map((app) => String(app.major_name || app.major_id || "").trim())
      .filter(Boolean)));

    return {
      id: item.requirement_id ?? item.id ?? index + 1,
      name: item.name || "-",
      code: "-",
      issuedDate: "-",
      batches,
      specializations,
      min_total_credits: item.min_total_credits,
      min_required_credits: item.min_required_credits,
      min_elective_credits: item.min_elective_credits,
      min_gpa: item.min_gpa,
      required_certificates: Array.isArray(item.required_certificates) ? item.required_certificates : [],
      cohort_ids: Array.from(new Set(applications.map((app) => app.cohort_id).filter((v): v is number => Number.isFinite(v as number)))),
      major_ids: Array.from(new Set(applications.map((app) => app.major_id).filter((v): v is number => Number.isFinite(v as number)))),
      notes: item.notes,
    };
  };

  const fetchRegulations = async () => {
    try {
      setLoadingRegulations(true);
      setRegulationError("");

      const allItems: GraduationRequirementApiItem[] = [];
      const size = 100;
      let page = 1;

      while (true) {
        const res = await api.get<GraduationRequirementListResponse>("/api/v1/graduation-requirements", {
          params: { page, size },
        });

        const payload = res.data;
        const pageItems = Array.isArray(payload)
          ? payload
          : payload.items || payload.data || payload.results || [];

        allItems.push(...pageItems);

        if (pageItems.length < size) break;
        page += 1;
      }

      setRegulations(allItems.map(mapRegulationItem));
    } catch (error) {
      console.error("Load graduation requirements failed", error);
      setRegulationError("Không thể tải danh sách quy chế");
      setRegulations([]);
    } finally {
      setLoadingRegulations(false);
    }
  };

  useEffect(() => {
    fetchRegulations();
  }, []);

  const filteredRegulations = regulations.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteRegulation = async () => {
    if (!selectedRegulation?.id) {
      throw new Error("Không xác định được quy chế cần xóa");
    }

    try {
      await api.delete(`/api/v1/graduation-requirements/${selectedRegulation.id}`);
      setOpenDeleteDialog(false);
      setSelectedRegulation(undefined);
      await fetchRegulations();
      return true;
    } catch (error) {
      const backendMessage = axios.isAxiosError(error)
        ? (typeof error.response?.data === "string"
          ? error.response.data
          : (error.response?.data?.detail || error.response?.data?.message || error.message))
        : "";

      throw new Error(backendMessage || "Không thể xóa quy chế. Vui lòng thử lại.");
    }
  };

  return (
    <AppLayout showSearch={false}>
      <div className="h-full flex flex-col px-8 py-5 bg-slate-50/50">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Cài đặt
            <span className="ml-2 text-xl font-semibold text-slate-900 align-baseline">
              &gt; Quản lý quy chế
            </span>
          </h1>
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
        {regulationError && <p className="text-sm text-red-600 mb-3">{regulationError}</p>}
        {loadingRegulations && <p className="text-sm text-gray-600 mb-3">Đang tải danh sách quy chế...</p>}
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
        onAdd={fetchRegulations}
      />
      {/* Edit Regulation Dialog */}
      <EditRegulationDialog
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
        regulation={selectedRegulation}
        onUpdate={() => {
          setOpenEditDialog(false);
          fetchRegulations();
        }}
      />
      {/* Delete Regulation Dialog */}
      <DeleteRegulationDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        regulation={selectedRegulation}
        onConfirm={handleDeleteRegulation}
      />
    </AppLayout>
  );
}
