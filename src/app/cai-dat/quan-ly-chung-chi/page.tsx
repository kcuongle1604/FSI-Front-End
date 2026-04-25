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

type CertificateRelationApiItem = {
  certificate_id?: number;
  certificate_name?: string;
  cohort_id?: number;
  cohort_name?: string;
  major_id?: number;
  major_name?: string;
};

type CertificateRelationResponse =
  | CertificateRelationApiItem[]
  | {
    items?: CertificateRelationApiItem[];
    data?: CertificateRelationApiItem[];
    results?: CertificateRelationApiItem[];
    applications?: CertificateRelationApiItem[];
    exemptions?: CertificateRelationApiItem[];
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

  const getListFromPayload = <T,>(payload: T[] | { items?: T[]; data?: T[]; results?: T[] } | null | undefined): T[] => {
    if (Array.isArray(payload)) return payload;
    if (!payload) return [];
    if (Array.isArray(payload.items)) return payload.items;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.results)) return payload.results;
    return [];
  };

  const getRelationRows = (payload: CertificateRelationResponse): CertificateRelationApiItem[] => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.applications)) return payload.applications;
    if (Array.isArray(payload?.exemptions)) return payload.exemptions;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.results)) return payload.results;
    return [];
  };

  const fetchCertificateList = async () => {
    const res = await api.get<CertificateListResponse>("/api/v1/certificates", {
      params: {
        page: 1,
        size: 100,
      },
    });

    return getListFromPayload<CertificateApiItem>(res.data);
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

  const fetchCertificates = async () => {
    try {
      setLoadingCertificates(true);
      setCertificateError("");
      const list = await fetchCertificateList();

      const mappedResults = await Promise.allSettled(
        (list || []).map(async (item, index) => {
          const mappedItem = mapApiCertificate(item, index);
          const certificateId = item.certificate_id ?? item.id;

          if (!certificateId) return mappedItem;

          try {
            const applicationsRes = await api.get<CertificateRelationResponse>(`/api/v1/certificates/${certificateId}/applications`);
            const detailRows = getRelationRows(applicationsRes.data);
            const detailBatches = Array.from(
              new Set(
                detailRows
                  .map((row) => row.cohort_name?.trim() || (row.cohort_id != null ? String(row.cohort_id) : ""))
                  .filter(Boolean)
              )
            );

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
      const list = await fetchCertificateList();
      const exemptionResults = await Promise.allSettled(
        (list || []).map(async (item, index) => {
          const certificateId = Number(item.certificate_id ?? item.id);
          if (!Number.isFinite(certificateId)) return null;

          const certificateName = String(item.name || "").trim() || `#${certificateId}`;

          try {
            const res = await api.get<CertificateRelationResponse>(`/api/v1/certificates/${certificateId}/exemptions`);
            const rows = getRelationRows(res.data);

            if (rows.length === 0) return null;

            const batches = Array.from(
              new Set(
                rows
                  .map((row) => row.cohort_name?.trim() || (row.cohort_id != null ? String(row.cohort_id) : ""))
                  .filter(Boolean)
              )
            );

            const majors = Array.from(
              new Set(
                rows
                  .map((row) => row.major_name?.trim() || (row.major_id != null ? String(row.major_id) : ""))
                  .filter(Boolean)
              )
            );

            const exemptionPairs = Array.from(
              new Set(
                rows
                  .map((row) => {
                    const cohortId = Number(row.cohort_id);
                    const majorId = Number(row.major_id);
                    if (!Number.isFinite(cohortId) || !Number.isFinite(majorId)) return null;
                    return `${cohortId}-${majorId}`;
                  })
                  .filter((value): value is string => !!value)
              )
            ).map((value) => {
              const [cohortId, majorId] = value.split("-").map(Number);
              return { cohort_id: cohortId, major_id: majorId };
            });

            return {
              id: certificateId || index + 1,
              types: [certificateName],
              batches,
              majors,
              exemptionPairs,
            } as ExemptCertificate;
          } catch {
            return null;
          }
        })
      );

      const mapped = exemptionResults
        .filter((result): result is PromiseFulfilledResult<ExemptCertificate | null> => result.status === "fulfilled")
        .map((result) => result.value)
        .filter((item): item is ExemptCertificate => item != null);

      setExemptCertificates(mapped);
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

    const getKnownRelationPairs = async (relation: "applications" | "exemptions") => {
      try {
        const relationRes = await api.get<CertificateRelationResponse>(`/api/v1/certificates/${certificateId}/${relation}`);
        const rows = getRelationRows(relationRes.data);
        return Array.from(
          new Set(
            rows
              .map((row) => {
                const cohortId = Number(row.cohort_id);
                const majorId = Number(row.major_id);
                if (!Number.isFinite(cohortId) || !Number.isFinite(majorId)) return null;
                return `${cohortId}-${majorId}`;
              })
              .filter((value): value is string => Boolean(value))
          )
        ).map((value) => {
          const [cohortId, majorId] = value.split("-").map(Number);
          return { cohort_id: cohortId, major_id: majorId };
        });
      } catch {
        return [] as Array<{ cohort_id: number; major_id: number }>;
      }
    };

    const deleteRelationPairs = async (
      relation: "applications" | "exemptions",
      pairs: Array<{ cohort_id: number; major_id: number }>
    ) => {
      if (pairs.length === 0) return;

      await Promise.all(
        pairs.map((pair) =>
          api.delete(`/api/v1/certificates/${certificateId}/${relation}`, {
            data: {
              certificate_id: certificateId,
              cohort_id: pair.cohort_id,
              major_id: pair.major_id,
            },
          })
        )
      );
    };

    const deleteStudentCertificateLinks = async () => {
      const candidates: Array<() => Promise<unknown>> = [
        () => api.delete(`/api/v1/student-certificates/by-certificate/${certificateId}`),
        () => api.delete(`/api/v1/student-certificates/${certificateId}`),
        () => api.delete(`/api/v1/student-certificates`, { data: { certificate_id: certificateId } }),
      ];

      for (const run of candidates) {
        try {
          await run();
          return;
        } catch (error: any) {
          const status = Number(error?.response?.status);
          if ([404, 405].includes(status)) {
            continue;
          }

          throw error;
        }
      }
    };

    try {
      const [applicationPairs, exemptionPairs] = await Promise.all([
        getKnownRelationPairs("applications"),
        getKnownRelationPairs("exemptions"),
      ]);

      await deleteRelationPairs("applications", applicationPairs);
      await deleteRelationPairs("exemptions", exemptionPairs);
      await deleteStudentCertificateLinks();
      await api.delete(`/api/v1/certificates/${certificateId}`);
    } catch (error) {
      const backendMessage = axios.isAxiosError(error)
        ? (typeof error.response?.data === "string"
          ? error.response.data
          : (error.response?.data?.message || error.response?.data?.detail || error.message))
        : "";

      throw new Error(backendMessage || "Không thể xóa chứng chỉ hoàn toàn");
    }

    setOpenDeleteDialog(false);
    setSelectedCertificate(undefined);
    await Promise.all([fetchCertificates(), fetchExemptions()]);
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
