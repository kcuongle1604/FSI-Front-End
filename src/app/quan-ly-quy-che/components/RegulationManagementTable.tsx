import { Edit, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export type Regulation = {
  id: number;
  name: string;
  batches: string[];
  specializations: string[];
};

interface RegulationManagementTableProps {
  regulations: Regulation[];
  onEditClick: (regulation: Regulation) => void;
  onDeleteClick: (regulation: Regulation) => void;
}

export default function RegulationManagementTable({ regulations, onEditClick, onDeleteClick }: RegulationManagementTableProps) {
  return (
    <div className="flex flex-col flex-1 bg-white rounded-lg border border-slate-200 overflow-hidden min-h-0">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-auto min-h-0">
          <Table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-blue-50" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50">STT</TableHead>
                <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50">TÊN QUY CHẾ</TableHead>
                <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50">KHÓA ÁP DỤNG</TableHead>
                <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50">CHUYÊN NGÀNH ÁP DỤNG</TableHead>
                <TableHead className="h-10 px-4 text-right text-sm font-semibold text-gray-700 bg-blue-50 w-12">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {regulations.map((regulation, idx) => (
                <TableRow key={regulation.id}>
                  <TableCell className="px-4 py-2">{idx + 1}</TableCell>
                  <TableCell className="px-4 py-2">{regulation.name}</TableCell>
                  <TableCell className="px-4 py-2">
                    {regulation.batches && regulation.batches.length > 0
                      ? regulation.batches.join(", ")
                      : <span className="italic text-gray-400">Chưa có</span>}
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    {regulation.specializations && regulation.specializations.length > 0
                      ? regulation.specializations.join(", ")
                      : <span className="italic text-gray-400">Chưa có</span>}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-right w-12">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100" onClick={() => onEditClick(regulation)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 text-red-600" onClick={() => onDeleteClick(regulation)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
