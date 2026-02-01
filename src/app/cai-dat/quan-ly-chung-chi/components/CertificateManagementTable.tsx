import { Edit, Trash2, MoreVertical, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Certificate } from "../page";


interface CertificateManagementTableProps {
  certificates: Certificate[];
  onEditClick: (certificate: Certificate) => void;
  onDeleteClick: (certificate: Certificate) => void;
  onStatusClick?: (certificate: Certificate) => void;
}


import { useState } from "react";


const PAGE_SIZE = 30;

const CertificateManagementTable = ({ certificates, onEditClick, onDeleteClick, onStatusClick }: CertificateManagementTableProps) => {
  const [page, setPage] = useState(1);
  const totalRecords = certificates.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));
  const pagedCertificates = certificates.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const displayCount = pagedCertificates.length;

  const goToPage = (p: number) => setPage(Math.max(1, Math.min(totalPages, p)));

  return (
    <div className="flex flex-col flex-1 bg-white rounded-lg border border-slate-200 overflow-hidden min-h-0">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-auto min-h-0">
          <Table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-blue-50" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50">STT</TableHead>
                <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50">TÊN CHỨNG CHỈ</TableHead>
                <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50">KHÓA ÁP DỤNG</TableHead>
                <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50">TRẠNG THÁI</TableHead>
                <TableHead className="h-10 px-4 text-right text-sm font-semibold text-gray-700 bg-blue-50 w-12">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedCertificates.map((certificate, idx) => (
                <TableRow key={certificate.id}>
                  <TableCell className="px-4 py-2">{(page - 1) * PAGE_SIZE + idx + 1}</TableCell>
                  <TableCell className="px-4 py-2">{certificate.name}</TableCell>
                  <TableCell className="px-4 py-2">{certificate.batch || <span className="italic text-gray-400">Chưa có</span>}</TableCell>
                  <TableCell className="px-4 py-2">
                    <div
                      className="flex items-center gap-2 w-fit cursor-pointer select-none"
                      onClick={onStatusClick ? () => onStatusClick(certificate) : undefined}
                      title="Thay đổi trạng thái"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${certificate.status === 'Đang áp dụng' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className={certificate.status === 'Đang áp dụng' ? 'text-gray-900' : 'text-gray-500'}>
                        {certificate.status === 'Đang áp dụng' ? 'Đang áp dụng' : 'Ngừng áp dụng'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2 text-right w-12">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem className="cursor-pointer text-sm" onClick={() => onEditClick(certificate)}>
                          <Edit className="w-4 h-4 mr-2" /> Sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-sm text-red-600" onClick={() => onDeleteClick(certificate)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Xóa
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

export default CertificateManagementTable;
