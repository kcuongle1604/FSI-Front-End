import { useEffect, useState } from "react";
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
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
  loading?: boolean;
  emptyMessage?: string;
}

export default function TuVanHocTapTab({ students, loading = false, emptyMessage = "Vui lòng chọn lớp để xem điểm" }: TuVanHocTapTabProps) {
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

  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const totalRecords = Array.isArray(filteredStudents) ? filteredStudents.length : 0;
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pagedStudents = Array.isArray(filteredStudents)
    ? filteredStudents.slice(startIndex, startIndex + PAGE_SIZE)
    : [];
  const displayCount = pagedStudents.length;
  const isEmptyState = !loading && totalRecords === 0;

  useEffect(() => {
    setPage(1);
  }, [programFilter, statusFilter, students]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="flex flex-col bg-white rounded-lg border border-slate-200 overflow-hidden min-h-0">
      {/* Table */}
      <div className="flex flex-col overflow-hidden min-h-0">
        <div className="overflow-auto">
          <Table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-blue-50" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
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
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-120 text-center text-gray-500">
                    Đang tải dữ liệu tư vấn học tập...
                  </TableCell>
                </TableRow>
              ) : isEmptyState ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-120 text-center text-gray-500">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : pagedStudents.length > 0 ? (
                pagedStudents.map((student, idx) => (
                  <TableRow key={student.id} className="border-b border-gray-200 hover:bg-slate-50 cursor-pointer">
                    <TableCell className="h-12 px-4 text-center text-sm text-gray-600 w-[60px]">{startIndex + idx + 1}</TableCell>
                    <TableCell className="h-12 px-4 text-left text-sm w-[140px]">
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-800 hover:underline font-normal text-sm cursor-pointer"
                        style={{ textDecoration: 'none' }}
                        onClick={() => router.push(`/nghiep-vu-dao-tao/tu-van-hoc-tap/${student.mssv}`)}
                      >
                        {student.mssv}
                      </button>
                    </TableCell>
                    <TableCell className="h-12 px-4 text-left text-sm text-gray-600 w-[180px]">{student.name}</TableCell>
                    <TableCell className="h-12 px-4 text-center text-sm text-gray-600 w-[120px]">{student.class}</TableCell>
                    <TableCell className="h-12 px-4 text-center text-sm text-gray-600 w-[110px]">48.21.2</TableCell>
                    <TableCell className="h-12 px-4 text-center text-sm text-gray-600 w-[110px]">48.21.2</TableCell>
                    <TableCell className="h-12 px-4 text-center text-sm text-gray-600 w-[120px]">112/120</TableCell>
                    <TableCell className="h-12 px-4 text-center text-sm text-gray-600 w-[120px]">30/34</TableCell>
                    <TableCell className="h-12 px-4 text-right text-sm text-gray-600 w-[80px]">{student.gpa}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-120 text-center text-gray-500">
                    Không có kết quả phù hợp
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50 sticky bottom-0 z-10">
        <div className="text-sm text-gray-600">
          Hiển thị {displayCount}/{totalRecords} dòng
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-gray-300"
            disabled={safePage <= 1}
            onClick={() => setPage(1)}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-gray-300"
            disabled={safePage <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 px-3">
            <span className="text-sm font-medium text-gray-700">{safePage}</span>
            <span className="text-sm text-gray-400">/</span>
            <span className="text-sm text-gray-600">{totalPages}</span>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-gray-300"
            disabled={safePage >= totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-gray-300"
            disabled={safePage >= totalPages}
            onClick={() => setPage(totalPages)}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
