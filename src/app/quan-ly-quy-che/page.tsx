import RegulationManagementTable, { Regulation } from "./components/RegulationManagementTable";
import { useState } from "react";
import AppLayout from "@/components/AppLayout";

const DUMMY_REGULATIONS: Regulation[] = [
  { id: 1, name: "Quy chế 1", batches: ["48K", "49K"], specializations: ["CNTT", "QTKD"] },
  { id: 2, name: "Quy chế 2", batches: ["50K"], specializations: ["Kế toán"] },
];

export default function QuanLyQuyChePage() {
  const [regulations, setRegulations] = useState<Regulation[]>(DUMMY_REGULATIONS);

  const handleEditClick = (regulation: Regulation) => {
    // TODO: Hiển thị popup chỉnh sửa
    alert(`Sửa: ${regulation.name}`);
  };

  const handleDeleteClick = (regulation: Regulation) => {
    // TODO: Hiển thị popup xác nhận xóa
    alert(`Xóa: ${regulation.name}`);
  };

  return (
    <AppLayout showSearch={false}>
      <div className="h-full flex flex-col px-8 py-5 bg-slate-50/50">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý quy chế</h1>
        </div>
        <RegulationManagementTable
          regulations={regulations}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
        />
      </div>
    </AppLayout>
  );
}
