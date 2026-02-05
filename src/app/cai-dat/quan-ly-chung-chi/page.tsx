"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppLayout from "@/components/AppLayout";
import CertificateManagementTableWithStatusDialog from "./CertificateManagementTableWithStatusDialog";
import AddCertificateDialog from "./components/AddCertificateDialog";
import EditCertificateDialog from "./components/EditCertificateDialog";
import DeleteCertificateDialog from "./components/DeleteCertificateDialog";

// Kiểu dữ liệu mẫu

export type Certificate = {
  id: number;
  name: string;
  code: string;
  issuedBy: string;
  status: 'Đang áp dụng' | 'Ngừng áp dụng';
  batch?: string;
};

const certificates: Certificate[] = [
  { id: 1, name: "Tin học A", code: "THA", issuedBy: "Bộ GD", status: 'Đang áp dụng', batch: '48K' },
  { id: 2, name: "Tin học B", code: "THB", issuedBy: "Bộ GD", status: 'Ngừng áp dụng', batch: '49K' },
];

export default function QuanLyChungChiPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | undefined>();

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
      {/* Delete Certificate Dialog */}
      <DeleteCertificateDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        certificate={selectedCertificate}
      />
    </AppLayout>
  );
}
