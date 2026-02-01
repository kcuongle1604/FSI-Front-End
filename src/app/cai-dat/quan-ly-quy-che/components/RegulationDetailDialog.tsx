import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit as EditIcon } from "lucide-react";

// Các options chuyên ngành áp dụng chuẩn:
export const SPECIALIZATION_OPTIONS = [
  "Tin học quản lý",
  "Quản trị hệ thống thông tin",
  "Thống kê"
];

export type RegulationCondition = {
  id: number;
  condition: string;
  operator: string;
  value: string;
};

interface RegulationDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  regulationName: string;
  conditions: RegulationCondition[];
}

// Dữ liệu mẫu giống ảnh demo
const demoConditions: RegulationCondition[] = [
  { id: 1, condition: "Tổng số tín chỉ", operator: ">=", value: "134" },
  { id: 2, condition: "Tín chỉ bắt buộc", operator: ">=", value: "120" },
  { id: 3, condition: "Tín chỉ tự chọn", operator: ">=", value: "34" },
  { id: 4, condition: "GPA", operator: ">=", value: "2.0" },
  { id: 5, condition: "Chứng chỉ đầu ra", operator: "-", value: "Đủ theo khoá" },
];

export default function RegulationDetailDialog({ open, onOpenChange, regulationName, conditions }: RegulationDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{regulationName}</DialogTitle>
        </DialogHeader>
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-blue-50">
                <th className="h-10 px-4 text-left text-sm font-semibold text-gray-700 border-b bg-blue-50 uppercase">STT</th>
                <th className="h-10 px-4 text-left text-sm font-semibold text-gray-700 border-b bg-blue-50 uppercase">ĐIỀU KIỆN</th>
                <th className="h-10 px-4 text-left text-sm font-semibold text-gray-700 border-b bg-blue-50 uppercase">TOÁN TỬ</th>
                <th className="h-10 px-4 text-left text-sm font-semibold text-gray-700 border-b bg-blue-50 uppercase">GIÁ TRỊ</th>
                <th className="h-10 px-4 text-right text-sm font-semibold text-gray-700 border-b bg-blue-50 w-12"></th>
              </tr>
            </thead>
            <tbody>
                  {demoConditions.map((cond, idx) => (
                    <tr key={cond.id} className="border-b last:border-b-0 group">
                      <td className="px-4 py-2 text-sm text-gray-700 text-center">{String(idx + 1).padStart(2, '0')}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{cond.condition}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{cond.operator}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{cond.value}</td>
                      <td className="px-4 py-2 text-right">
                        <button
                          type="button"
                          className="h-7 w-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
                          title="Chỉnh sửa điều kiện"
                        >
                          <EditIcon size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-6 py-3 text-sm text-gray-600">
          <span>
            Hiển thị {String(demoConditions.length).padStart(2, '0')}/{String(demoConditions.length).padStart(2, '0')} dòng
          </span>
          <span className="text-gray-500">1 / 1</span>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9"
          >
            Huỷ
          </Button>
          <Button
            type="button"
            className="bg-[#167FFC] hover:bg-[#1470E3] text-white h-9"
            // onClick={handleSave}
          >
            Lưu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
