"use client";

import { useEffect, useState } from "react";
import { Plus, Search, BadgeCheck, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AppLayout from "@/components/AppLayout";
import { api } from "@/lib/api";
import axios from "axios";
import CertificateManagementTableWithStatusDialog from "./CertificateManagementTableWithStatusDialog";
import ExemptCertificateManagementTable from "./components/ExemptCertificateManagementTable";
import AddCertificateDialog from "./components/AddCertificateDialog";
import EditCertificateDialog from "./components/EditCertificateDialog";
import ExemptCertificateDialog from "./components/ExemptCertificateDialog";
import DeleteCertificateDialog from "./components/DeleteCertificateDialog";


// Kiểu dữ liệu mẫu
export type Certificate = {
  id: number;
  name: string;
  code: string;
  issuedBy: string;
  status: 'Đang áp dụng' | 'Ngừng áp dụng';
  batches?: string[];
};

export type ExemptCertificate = {
  id: number;
  types: string[];
  batches: string[];
  majors: string[];
  exemptionPairs?: Array<{ cohort_id: number; major_id: number }>;
};

const certificates: Certificate[] = [
  { id: 1, name: "Chứng chỉ tiếng Anh", code: "CC-TA", issuedBy: "Bộ GD", status: 'Đang áp dụng', batches: ["48K", "49K", "50K", "51K"] },
  { id: 2, name: "Chứng chỉ tin học", code: "CC-TH", issuedBy: "Bộ GD", status: 'Đang áp dụng', batches: ["48K", "49K", "50K", "51K"] },
  { id: 3, name: "Chứng chỉ quốc phòng", code: "CC-QP", issuedBy: "Bộ GD", status: 'Đang áp dụng', batches: ["48K", "49K", "50K", "51K"] },
  { id: 4, name: "Chứng chỉ thể dục", code: "CC-TD", issuedBy: "Bộ GD", status: 'Đang áp dụng', batches: ["48K", "49K", "50K", "51K"] },
];

type CertificateApiItem = {
  certificate_id?: number;
  id?: number;
  name?: string;
  status?: string;
  is_active?: boolean;
  cohort_ids?: number[];
  cohorts?: Array<{ cohort_id?: number; name?: string }>;
};

type CertificateListResponse =
  | CertificateApiItem[]
  | { items?: CertificateApiItem[]; data?: CertificateApiItem[]; results?: CertificateApiItem[] };

type CertificateCohortItem = {
  cohort_id?: number;
  name?: string;
  cohort_name?: string;
  year_start?: number;
  year_end?: number;
};

type CertificateCohortsResponse = {
  certificate_id?: number;
  certificate_name?: string;
  cohorts?: CertificateCohortItem[];
};

type ExemptionApiItem = {
  certificate_id?: number;
  certificate_name?: string;
  cohort_id?: number;
  cohort_name?: string;
  major_id?: number;
  major_name?: string;
};

type ExemptionListResponse = {
  data?: ExemptionApiItem[];
  total?: number;
};

export default function QuanLyChungChiPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [exemptCertificates, setExemptCertificates] = useState<ExemptCertificate[]>([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  const [loadingExemptions, setLoadingExemptions] = useState(false);
  const [certificateError, setCertificateError] = useState<string>("");
  const [exemptionError, setExemptionError] = useState<string>("");
  const [activeTab, setActiveTab] = useState("quan-ly-chung-chi");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | undefined>();
  // For Miễn chứng chỉ tab
  const [openExemptAddDialog, setOpenExemptAddDialog] = useState(false);
  const [openExemptEditDialog, setOpenExemptEditDialog] = useState(false);
  const [selectedExemptCertificate, setSelectedExemptCertificate] = useState<ExemptCertificate | undefined>();

  const parseCohortId = (value: string): number | null => {
    const trimmed = String(value || "").trim();
    if (!trimmed) return null;

    const direct = Number(trimmed);
    if (Number.isFinite(direct)) return direct;

    const digits = trimmed.match(/\d+/)?.[0];
    const parsed = digits ? Number(digits) : NaN;
    return Number.isFinite(parsed) ? parsed : null;
  };

  const mapApiCertificate = (item: CertificateApiItem, index: number): Certificate => {
    const batchesFromCohorts = Array.isArray(item.cohorts)
      ? item.cohorts.map((c) => c?.name || String(c?.cohort_id ?? "")).filter(Boolean)
      : [];
    const batchesFromIds = Array.isArray(item.cohort_ids)
      ? item.cohort_ids.map((id) => String(id))
      : [];

    const statusByFlag = typeof item.is_active === "boolean"
      ? (item.is_active ? "Đang áp dụng" : "Ngừng áp dụng")
      : undefined;

    return {
      id: item.certificate_id ?? item.id ?? index + 1,
      name: item.name || "-",
      code: "-",
      issuedBy: "-",
      status: (statusByFlag || item.status || "Đang áp dụng") as Certificate["status"],
      batches: batchesFromCohorts.length > 0 ? batchesFromCohorts : batchesFromIds,
    };
  };

  const mapCohortLabels = (cohorts: CertificateCohortItem[] | undefined): string[] => {
    if (!Array.isArray(cohorts)) return [];

    const values = cohorts
      .map((cohort) => (cohort.cohort_id != null ? String(cohort.cohort_id) : (cohort.name || cohort.cohort_name || "")))
      .filter(Boolean);

    return Array.from(new Set(values));
  };

  const fetchCertificates = async () => {
    try {
      setLoadingCertificates(true);
      setCertificateError("");
      const res = await api.get<CertificateListResponse>("/api/v1/certificates", {
        params: {
          page: 1,
          size: 100,
        },
      });

      const payload = res.data;
      const list = Array.isArray(payload)
        ? payload
        : payload.items || payload.data || payload.results || [];

      const mappedResults = await Promise.allSettled(
        (list || []).map(async (item, index) => {
          const mappedItem = mapApiCertificate(item, index);
          const certificateId = item.certificate_id ?? item.id;

          if (!certificateId) return mappedItem;

          try {
            const cohortsRes = await api.get<CertificateCohortsResponse>(`/api/v1/certificates/${certificateId}/cohorts`);
            const detailBatches = mapCohortLabels(cohortsRes.data?.cohorts);
            return {
              ...mappedItem,
              batches: detailBatches.length > 0 ? detailBatches : mappedItem.batches,
            };
          } catch {
            return mappedItem;
          }
        })
      );

      const mapped = mappedResults.map((result, index) => {
        if (result.status === "fulfilled") return result.value;
        return mapApiCertificate((list || [])[index], index);
      });

      setCertificates(mapped);
    } catch (err) {
      console.error("Load certificates failed", err);
      setCertificateError("Không thể tải danh sách chứng chỉ");
      setCertificates([]);
    } finally {
      setLoadingCertificates(false);
    }
  };

  const fetchExemptions = async () => {
    try {
      setLoadingExemptions(true);
      setExemptionError("");

      const res = await api.get<ExemptionListResponse>("/api/v1/certificates/exemptions", {
        params: {
          page: 1,
          size: 1000,
        },
      });

      const rows = Array.isArray(res.data?.data) ? res.data.data : [];
      const grouped = new Map<number, ExemptCertificate>();

      rows.forEach((row, index) => {
        const certificateId = Number(row.certificate_id);
        if (!Number.isFinite(certificateId)) return;

        const current = grouped.get(certificateId) || {
          id: certificateId || index + 1,
          types: [],
          batches: [],
          majors: [],
          exemptionPairs: [],
        };

        const certificateName = row.certificate_name?.trim();
        const cohortLabel = (row.cohort_name?.trim() || (row.cohort_id != null ? String(row.cohort_id) : "")).trim();
        const majorLabel = (row.major_name?.trim() || (row.major_id != null ? String(row.major_id) : "")).trim();

        if (certificateName && !current.types.includes(certificateName)) current.types.push(certificateName);
        if (cohortLabel && !current.batches.includes(cohortLabel)) current.batches.push(cohortLabel);
        if (majorLabel && !current.majors.includes(majorLabel)) current.majors.push(majorLabel);

        const cohortId = Number(row.cohort_id);
        const majorId = Number(row.major_id);
        if (Number.isFinite(cohortId) && Number.isFinite(majorId)) {
          const exists = current.exemptionPairs?.some((pair) => pair.cohort_id === cohortId && pair.major_id === majorId);
          if (!exists) {
            current.exemptionPairs = [...(current.exemptionPairs || []), { cohort_id: cohortId, major_id: majorId }];
          }
        }

        grouped.set(certificateId, current);
      });

      setExemptCertificates(Array.from(grouped.values()));
    } catch (err) {
      console.error("Load certificate exemptions failed", err);
      setExemptionError("Không thể tải danh sách miễn chứng chỉ");
      setExemptCertificates([]);
    } finally {
      setLoadingExemptions(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
    fetchExemptions();
  }, []);

  const filteredCertificates = certificates.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredExemptCertificates = exemptCertificates.filter((item) =>
    item.types.some((type) => type.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDeleteSelected = async () => {
    if (activeTab === "mien-chung-chi") {
      if (!selectedExemptCertificate?.id) {
        throw new Error("Không xác định được chứng chỉ miễn cần xóa");
      }

      const certificateId = selectedExemptCertificate.id;
      const pairs = selectedExemptCertificate.exemptionPairs || [];

      if (pairs.length === 0) {
        throw new Error("Không tìm thấy cặp khóa/chuyên ngành để xóa miễn chứng chỉ");
      }

      await Promise.all(
        pairs.map((pair) =>
          api.delete(`/api/v1/certificates/${certificateId}/exemptions`, {
            data: {
              certificate_id: certificateId,
              cohort_id: pair.cohort_id,
              major_id: pair.major_id,
            },
          })
        )
      );

      setOpenDeleteDialog(false);
      setSelectedExemptCertificate(undefined);
      await fetchExemptions();
      return true;
    }

    if (!selectedCertificate?.id) {
      throw new Error("Không xác định được chứng chỉ áp dụng cần xóa");
    }

    const certificateId = selectedCertificate.id;
    const cohortIds = Array.from(
      new Set(
        (selectedCertificate.batches || [])
          .map(parseCohortId)
          .filter((id): id is number => id != null)
      )
    );

    if (cohortIds.length === 0) {
      throw new Error("Không tìm thấy khóa áp dụng hợp lệ để xóa");
    }

    const majorsByCohort = await Promise.all(
      cohortIds.map(async (cohortId) => {
        const res = await api.get<Array<{ major_id?: number }>>(`/api/v1/majors/by-cohort/${cohortId}`);
        const majorIds = (Array.isArray(res.data) ? res.data : [])
          .map((item) => Number(item.major_id))
          .filter((majorId) => Number.isFinite(majorId));

        return { cohortId, majorIds: Array.from(new Set(majorIds)) };
      })
    );

    const deleteRequests = majorsByCohort.flatMap(({ cohortId, majorIds }) =>
      majorIds.map((majorId) =>
        api.delete(`/api/v1/certificates/${certificateId}/applications`, {
          data: {
            cohort_id: cohortId,
            major_id: majorId,
          },
        })
      )
    );

    if (deleteRequests.length === 0) {
      throw new Error("Không tìm thấy chuyên ngành theo khóa để xóa áp dụng");
    }

    try {
      await Promise.all(deleteRequests);
    } catch (error) {
      const backendMessage = axios.isAxiosError(error)
        ? (typeof error.response?.data === "string"
          ? error.response.data
          : (error.response?.data?.message || error.response?.data?.detail || error.message))
        : "";

      throw new Error(backendMessage || "Không thể xóa áp dụng chứng chỉ");
    }

    setOpenDeleteDialog(false);
    setSelectedCertificate(undefined);
    await fetchCertificates();
    return true;
  };

  return (
    <AppLayout showSearch={false}>
      <div className="h-full flex flex-col px-8 py-5 bg-slate-50/50">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Cài đặt
            <span className="ml-2 text-xl font-semibold text-slate-900 align-baseline">
              &gt; Quản lý chứng chỉ
            </span>
          </h1>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <div className="border-b border-slate-200">
            <TabsList className="bg-transparent h-auto p-0 gap-8 justify-start">
              <TabsTrigger
                value="quan-ly-chung-chi"
                className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none px-0 py-3 text-sm font-semibold transition-all"
              >
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4" />
                  Quản lý chứng chỉ
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="mien-chung-chi"
                className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none px-0 py-3 text-sm font-semibold transition-all"
              >
                <div className="flex items-center gap-2">
                  <ShieldOff className="w-4 h-4" />
                  Miễn chứng chỉ
                </div>
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="flex-1 min-h-0 mt-5 flex flex-col">
            {/* Tab Quản lý chứng chỉ */}
            <TabsContent value="quan-ly-chung-chi" className="m-0 h-full outline-none flex flex-col">
              {/* Search and Actions Bar */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-[250px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Nhập tên chứng chỉ..."
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
              {certificateError && (
                <p className="text-sm text-red-600 mb-3">{certificateError}</p>
              )}
              {loadingCertificates && (
                <p className="text-sm text-gray-600 mb-3">Đang tải danh sách chứng chỉ...</p>
              )}
              {/* Table */}
              <CertificateManagementTableWithStatusDialog
                certificates={filteredCertificates}
                onEditClick={(c: Certificate) => { setSelectedCertificate(c); setOpenEditDialog(true); }}
                onDeleteClick={(c: Certificate) => {
                  setSelectedExemptCertificate(undefined);
                  setSelectedCertificate(c);
                  setOpenDeleteDialog(true);
                }}
              />
            </TabsContent>
            <TabsContent value="mien-chung-chi" className="m-0 h-full outline-none flex flex-col">
              {/* Search and Actions Bar */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-[250px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Nhập tên chứng chỉ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 bg-white"
                  />
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    onClick={() => setOpenExemptAddDialog(true)}
                    className="bg-[#167FFC] hover:bg-[#1470E3] text-white h-9 gap-2 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Thêm
                  </Button>
                </div>
              </div>
              {exemptionError && (
                <p className="text-sm text-red-600 mb-3">{exemptionError}</p>
              )}
              {loadingExemptions && (
                <p className="text-sm text-gray-600 mb-3">Đang tải danh sách miễn chứng chỉ...</p>
              )}
              {/* Table có thêm chuyên ngành */}
              <ExemptCertificateManagementTable
                certificates={filteredExemptCertificates}
                onEditClick={(c: ExemptCertificate) => { setSelectedExemptCertificate(c); setOpenExemptEditDialog(true); }}
                onDeleteClick={(c: ExemptCertificate) => {
                  setSelectedCertificate(undefined);
                  setSelectedExemptCertificate(c);
                  setOpenDeleteDialog(true);
                }}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
      {/* Add Certificate Dialog */}
      <AddCertificateDialog
        open={openAddDialog}
        onOpenChange={setOpenAddDialog}
        onAdd={fetchCertificates}
      />
      {/* Edit Certificate Dialog */}
      <EditCertificateDialog
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
        certificate={selectedCertificate}
        onUpdate={() => {
          setOpenEditDialog(false);
          fetchCertificates();
        }}
      />
      {/* Add/Edit Exempt Certificate Dialog (tab miễn chứng chỉ) */}
      <ExemptCertificateDialog
        open={openExemptAddDialog || openExemptEditDialog}
        onOpenChange={openExemptAddDialog ? setOpenExemptAddDialog : setOpenExemptEditDialog}
        certificate={selectedExemptCertificate}
        isEdit={openExemptEditDialog}
        onUpdate={() => {
          setOpenExemptAddDialog(false);
          setOpenExemptEditDialog(false);
          fetchExemptions();
        }}
      />
      {/* Delete Certificate Dialog */}
      <DeleteCertificateDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        certificate={
          activeTab === "mien-chung-chi"
            ? (selectedExemptCertificate
              ? {
                id: selectedExemptCertificate.id,
                name: selectedExemptCertificate.types?.[0] || `#${selectedExemptCertificate.id}`,
                code: "-",
                issuedBy: "-",
                status: "Đang áp dụng",
                batches: selectedExemptCertificate.batches,
              }
              : undefined)
            : selectedCertificate
        }
        onConfirm={handleDeleteSelected}
      />
    </AppLayout>
  );
}
