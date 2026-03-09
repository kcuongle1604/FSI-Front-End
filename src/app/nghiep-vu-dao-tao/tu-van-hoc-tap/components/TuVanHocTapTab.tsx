import { useState } from "react";
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Định nghĩa dữ liệu mẫu tương tự Xét tốt nghiệp, có thể điều chỉnh sau
export type TuVanHocTap = {
  id: number;
  mssv: string;
  name: string;
  class: string;
  year: string;
  course: string;
  tcbb: number;
  tctc: number;
  totalCredits: number;
  gpa: number;
  ccdr: string;
  program: string;
  status: string;
};

interface TuVanHocTapTabProps {
  students: TuVanHocTap[];
}

export default function TuVanHocTapTab({ students }: TuVanHocTapTabProps) {
  const router = useRouter();
  const [programFilter, setProgramFilter] = useState<"all" | "hoan-thanh" | "chua-hoan-thanh">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "dat" | "khong-dat">("all");

  const filteredStudents = Array.isArray(students)
    ? students.filter((student) => {
        const matchesProgram =
          programFilter === "all" ||
          (programFilter === "hoan-thanh" && student.program === "Hoàn thành") ||
          (programFilter === "chua-hoan-thanh" && student.program === "Chưa hoàn thành");

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "dat" && student.status === "Đạt") ||
          (statusFilter === "khong-dat" && student.status === "Không đạt");

        return matchesProgram && matchesStatus;
      })
    : [];

  const PAGE_SIZE = 30;
  const [page, setPage] = useState(1);
  const totalRecords = Array.isArray(filteredStudents) ? filteredStudents.length : 0;
  const totalPages = totalRecords > 0 ? Math.max(1, Math.ceil(totalRecords / PAGE_SIZE)) : 1;
  const pagedStudents = Array.isArray(filteredStudents)
    ? filteredStudents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : [];

  return (
    <div className="flex flex-col flex-1 bg-white rounded-lg border border-slate-200 overflow-hidden min-h-0">
      {/* Header bảng */}
      <div className="w-full">
        <Table className="w-full" style={{ borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <TableHeader>
            <TableRow className="border-b border-gray-200 bg-blue-50">
              <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700 bg-blue-50 w-[60px]">STT</TableHead>
              <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50 w-[140px]">MSSV</TableHead>
              <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50 w-[180px]">HỌ & TÊN</TableHead>
              <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700 bg-blue-50 w-[120px]">LỚP</TableHead>
              <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700 bg-blue-50 w-[110px]">TCBB</TableHead>
              <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700 bg-blue-50 w-[110px]">TCTC</TableHead>
              <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700 bg-blue-50 w-[120px]">TCBB THIẾU</TableHead>
              <TableHead className="h-10 px-4 text-center text-sm font-semibold text-gray-700 bg-blue-50 w-[120px]">TCTC THIẾU</TableHead>
              <TableHead className="h-10 px-4 text-right text-sm font-semibold text-gray-700 bg-blue-50 w-[80px]">GPA</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      </div>
      {/* Bảng scroll */}
      <div className="overflow-y-auto flex-1 min-h-0" style={{ maxHeight: 600 }}>
        <Table className="w-full" style={{ borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <TableBody>
            {pagedStudents.map((student, idx) => (
              <TableRow key={student.id} className="border-b border-gray-200 hover:bg-slate-50 cursor-pointer">
                <TableCell className="text-center w-[60px]">{(page - 1) * PAGE_SIZE + idx + 1}</TableCell>
                <TableCell className="text-left w-[140px]">
                  <button
                    className="text-blue-600 hover:text-blue-800 hover:underline font-normal text-sm cursor-pointer"
                    style={{ textDecoration: 'none' }}
                    onClick={() => router.push(`/nghiep-vu-dao-tao/tu-van-hoc-tap/${student.mssv}`)}
                  >
                    {student.mssv}
                  </button>
                </TableCell>
                <TableCell className="text-left w-[180px]">{student.name}</TableCell>
                <TableCell className="text-center w-[120px]">{student.class}</TableCell>
                <TableCell className="text-center w-[110px]">48.21.2</TableCell>
                <TableCell className="text-center w-[110px]">48.21.2</TableCell>
                <TableCell className="text-center w-[120px]">112/120</TableCell>
                <TableCell className="text-center w-[120px]">30/34</TableCell>
                <TableCell className="text-right w-[80px]">{student.gpa}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Pagination luôn cố định dưới */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-600">
          Hiển thị {pagedStudents.length}/{totalRecords} dòng
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-gray-300"
            disabled={page === 1}
            onClick={() => setPage(1)}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-gray-300"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 px-3">
            <span className="text-sm font-medium text-gray-700">{page}</span>
            <span className="text-sm text-gray-400">/</span>
            <span className="text-sm text-gray-600">{totalPages}</span>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-gray-300"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-gray-300"
            disabled={page === totalPages}
            onClick={() => setPage(totalPages)}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
