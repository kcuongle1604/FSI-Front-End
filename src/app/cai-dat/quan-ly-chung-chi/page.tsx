"use client";

import { useState } from "react";
import { Plus, Search, BadgeCheck, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AppLayout from "@/components/AppLayout";
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
};

const certificates: Certificate[] = [
  { id: 1, name: "Chứng chỉ tiếng Anh", code: "CC-TA", issuedBy: "Bộ GD", status: 'Đang áp dụng', batches: ["48K", "49K", "50K", "51K"] },
  { id: 2, name: "Chứng chỉ tin học", code: "CC-TH", issuedBy: "Bộ GD", status: 'Đang áp dụng', batches: ["48K", "49K", "50K", "51K"] },
  { id: 3, name: "Chứng chỉ quốc phòng", code: "CC-QP", issuedBy: "Bộ GD", status: 'Đang áp dụng', batches: ["48K", "49K", "50K", "51K"] },
  { id: 4, name: "Chứng chỉ thể dục", code: "CC-TD", issuedBy: "Bộ GD", status: 'Đang áp dụng', batches: ["48K", "49K", "50K", "51K"] },
];

const exemptCertificates: ExemptCertificate[] = [
  {
    id: 1,
    types: ["Chứng chỉ tin học"],
    batches: ["48K", "49K", "50K", "51K"],
    majors: ["Quản trị hệ thống thông tin", "Tin học quản lý"]
  }
];

export default function QuanLyChungChiPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("quan-ly-chung-chi");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | undefined>();
  // For Miễn chứng chỉ tab
  const [openExemptAddDialog, setOpenExemptAddDialog] = useState(false);
  const [openExemptEditDialog, setOpenExemptEditDialog] = useState(false);
  const [selectedExemptCertificate, setSelectedExemptCertificate] = useState<Certificate | undefined>();

  const filteredCertificates = certificates.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              {/* Table */}
              <CertificateManagementTableWithStatusDialog
                certificates={filteredCertificates}
                onEditClick={(c: Certificate) => { setSelectedCertificate(c); setOpenEditDialog(true); }}
                onDeleteClick={(c: Certificate) => { setSelectedCertificate(c); setOpenDeleteDialog(true); }}
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
              {/* Table có thêm chuyên ngành */}
              <ExemptCertificateManagementTable
                certificates={exemptCertificates}
                onEditClick={(c: ExemptCertificate) => { setSelectedExemptCertificate(c); setOpenExemptEditDialog(true); }}
                onDeleteClick={(c: ExemptCertificate) => { setSelectedExemptCertificate(c); setOpenDeleteDialog(true); }}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
      {/* Add Certificate Dialog */}
      <AddCertificateDialog
        open={openAddDialog}
        onOpenChange={setOpenAddDialog}
      />
      {/* Edit Certificate Dialog */}
      <EditCertificateDialog
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
        certificate={selectedCertificate}
      />
      {/* Add/Edit Exempt Certificate Dialog (tab miễn chứng chỉ) */}
      <ExemptCertificateDialog
        open={openExemptAddDialog || openExemptEditDialog}
        onOpenChange={openExemptAddDialog ? setOpenExemptAddDialog : setOpenExemptEditDialog}
        certificate={selectedExemptCertificate}
        isEdit={openExemptEditDialog}
        onUpdate={() => { setOpenExemptAddDialog(false); setOpenExemptEditDialog(false); }}
      />
      {/* Delete Certificate Dialog */}
      <DeleteCertificateDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        certificate={selectedCertificate}
      />
    </AppLayout>
  );
}
