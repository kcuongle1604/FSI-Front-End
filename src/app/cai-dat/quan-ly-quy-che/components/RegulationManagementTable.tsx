import { Edit, Trash2, MoreVertical, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Regulation } from "../page";
// import { useRouter } from "next/navigation";

interface RegulationManagementTableProps {
  regulations: Regulation[];
  onEditClick: (regulation: Regulation) => void;
  onDeleteClick: (regulation: Regulation) => void;
  onDetailClick?: (regulation: Regulation) => void;
}


import { useState } from "react";


const PAGE_SIZE = 30;

const RegulationManagementTable = ({ regulations, onEditClick, onDeleteClick, onDetailClick }: RegulationManagementTableProps) => {
  const [page, setPage] = useState(1);
  const totalRecords = regulations.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));
  const pagedRegulations = regulations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const displayCount = pagedRegulations.length;

  const goToPage = (p: number) => setPage(Math.max(1, Math.min(totalPages, p)));

  return (
    <div className="flex flex-col flex-1 bg-white rounded-lg border border-slate-200 overflow-hidden min-h-0">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-auto min-h-0">
          <Table className="w-full table-fixed" style={{ borderCollapse: 'collapse' }}>
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-blue-50" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50 w-[6%]">STT</TableHead>
                <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50 w-[44%]">TÊN QUY CHẾ</TableHead>
                <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50 w-[15%]">KHÓA ÁP DỤNG</TableHead>
                <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50 w-[25%]">CHUYÊN NGÀNH ÁP DỤNG</TableHead>
                <TableHead className="h-10 px-4 text-right text-sm font-semibold text-gray-700 bg-blue-50 w-[10%]">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedRegulations.map((regulation, idx) => (
                <TableRow key={regulation.id}>
                  <TableCell className="px-4 py-2">{(page - 1) * PAGE_SIZE + idx + 1}</TableCell>
                  <TableCell className="px-4 py-2">
                    {onDetailClick ? (
                      <button
                        className="text-blue-700 hover:underline font-medium outline-none"
                        onClick={() => onDetailClick(regulation)}
                        type="button"
                      >
                        {regulation.name}
                      </button>
                    ) : (
                      regulation.name
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-2">{Array.isArray(regulation.batches) && regulation.batches.length > 0 ? regulation.batches.join(", ") : <span className="italic text-gray-400">Chưa có</span>}</TableCell>
                  <TableCell className="px-4 py-2">
                    {Array.isArray(regulation.specializations) && regulation.specializations.length > 0 ? (
                      <span
                        className="block max-w-[220px] truncate cursor-pointer"
                        title={regulation.specializations.join(", ")}
                      >
                        {regulation.specializations.join(", ")}
                      </span>
                    ) : (
                      <span className="italic text-gray-400">Chưa có</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-right w-12">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem className="cursor-pointer text-sm" onClick={() => onEditClick(regulation)}>
                          <Edit className="w-4 h-4 mr-2" /> Sửa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50" style={{ minHeight: 56 }}>
          <div className="text-sm text-gray-600">
            Hiển thị {displayCount}/{totalRecords} dòng
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8 border-gray-300" onClick={() => goToPage(1)} disabled={page === 1}>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 border-gray-300" onClick={() => goToPage(page - 1)} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 px-3">
              <span className="text-sm font-medium text-gray-700">{page}</span>
              <span className="text-sm text-gray-400">/</span>
              <span className="text-sm text-gray-600">{totalPages}</span>
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8 border-gray-300" onClick={() => goToPage(page + 1)} disabled={page === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 border-gray-300" onClick={() => goToPage(totalPages)} disabled={page === totalPages}>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegulationManagementTable;
