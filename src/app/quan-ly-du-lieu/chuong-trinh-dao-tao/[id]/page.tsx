"use client";

import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Search,
  Plus,
  Download,
  Upload,
  MoreVertical,
  BookOpen,
  History,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Program } from "../page";
import ImportHistoryTab from "../../sinh-vien/components/ImportHistoryTab";
import ImportDialog from "../../sinh-vien/components/ImportDialog";
import type { ImportHistory } from "../../sinh-vien/types";
import CourseFormDialog, { CourseFormValues } from "../CourseFormDialog";
import DeleteCourseDialog from "../DeleteCourseDialog";
import { getSubjectsByProgramName, getTrainingPrograms, type Subject } from "../program.api";

type ProgramCourse = {
  id: number;
  specialization: string;
  type: CourseFormValues["type"];
  code: string;
  name: string;
  credits: number;
  compulsory: number;
  optional: number;
};

const INITIAL_COURSES: ProgramCourse[] = [
  {
    id: 1,
    specialization: "Quản trị hệ thống thông tin",
    type: "bat-buoc",
    code: "MGT1002",
    name: "Quản trị cơ sở dữ liệu",
    credits: 3,
    compulsory: 3,
    optional: 0,
  },
  {
    id: 2,
    specialization: "Quản trị hệ thống thông tin",
    type: "bat-buoc",
    code: "MGT1002",
    name: "Quản trị cơ sở dữ liệu",
    credits: 3,
    compulsory: 3,
    optional: 0,
  },
  {
    id: 3,
    specialization: "Quản trị hệ thống thông tin",
    type: "bat-buoc",
    code: "MGT1002",
    name: "Quản trị cơ sở dữ liệu",
    credits: 3,
    compulsory: 3,
    optional: 0,
  },
  {
    id: 4,
    specialization: "Quản trị hệ thống thông tin",
    type: "bat-buoc",
    code: "MGT1002",
    name: "Quản trị cơ sở dữ liệu",
    credits: 3,
    compulsory: 3,
    optional: 0,
  },
  {
    id: 5,
    specialization: "Quản trị hệ thống thông tin",
    type: "bat-buoc",
    code: "MGT1002",
    name: "Quản trị cơ sở dữ liệu",
    credits: 3,
    compulsory: 3,
    optional: 0,
  },
];

export default function ChuongTrinhDaoTaoDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const programId = Number(params?.id);
  const programNameFromUrl = searchParams.get('name');

  const [programs, setPrograms] = useState<Program[]>([]);
  const [program, setProgram] = useState<Program | null>(null);
  const [programLoading, setProgramLoading] = useState(true);

  const title = program?.name ?? programNameFromUrl ?? "Chương trình đào tạo";

  const PAGE_SIZE = 10;
  const [activeTab, setActiveTab] = useState("chuong-trinh-dao-tao");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<ProgramCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [importHistory] = useState<ImportHistory[]>([]);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [isEditCourseDialogOpen, setIsEditCourseDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<ProgramCourse | null>(null);
  const [isDeleteCourseDialogOpen, setIsDeleteCourseDialogOpen] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState<ProgramCourse | null>(null);

  // Fetch training programs from API
  useEffect(() => {
    // If we have program name from URL, use it directly
    if (programNameFromUrl) {
      console.log("✅ Using program name from URL:", programNameFromUrl);
      setProgram({ id: programId, name: programNameFromUrl });
      setProgramLoading(false);
      return;
    }

    // Otherwise, fetch from API
    const fetchPrograms = async () => {
      try {
        setProgramLoading(true);
        console.log("📋 Fetching training programs for programId:", programId);
        const response = await getTrainingPrograms();
        if (response?.data && Array.isArray(response.data)) {
          const programsList = response.data.map((p: any) => ({
            id: p.program_id || p.id,
            name: p.program_name || p.name,
          }));
          console.log("📚 Available programs:", programsList);
          setPrograms(programsList);
          
          // Find matching program
          const matchedProgram = programsList.find((p: Program) => p.id === programId);
          if (matchedProgram) {
            console.log("✅ Matched program:", matchedProgram);
            setProgram(matchedProgram);
          } else {
            console.warn("⚠️ Program not found with ID:", programId);
            console.warn("Available IDs:", programsList.map((p: Program) => p.id));
          }
        }
      } catch (err) {
        console.error("Failed to load training programs:", err);
      } finally {
        setProgramLoading(false);
      }
    };

    fetchPrograms();
  }, [programId, programNameFromUrl]);

  // Fetch subjects when program name is available
  useEffect(() => {
    if (!program?.name || program.name === "Chương trình đào tạo") return;

    const fetchSubjects = async () => {
      try {
        setLoading(true);
        console.log("🔍 Fetching subjects for program:", program.name);
        const response = await getSubjectsByProgramName(program.name);
        
        console.log("📦 API Response:", response);
        
        if (response?.data && Array.isArray(response.data)) {
          // Map API response to ProgramCourse structure
          const mappedCourses: ProgramCourse[] = response.data.map((subject: Subject, index: number) => ({
            id: index + 1,
            specialization: program.name,
            type: subject.is_required ? "bat-buoc" : "tu-chon",
            code: subject.subject_id,
            name: subject.course_display_name || subject.name,
            credits: subject.credits,
            compulsory: subject.is_required ? subject.credits : 0,
            optional: subject.is_required ? 0 : subject.credits,
          }));
          
          console.log("✅ Mapped courses:", mappedCourses.length, "items");
          setCourses(mappedCourses);
        } else {
          console.warn("⚠️ Invalid response format:", response);
          setCourses([]);
        }
      } catch (err: any) {
        console.error("❌ Failed to load subjects for program:", program.name, err);
        if (err.response?.status === 404) {
          console.warn("Program not found in backend:", program.name);
        }
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [program]);

  const filteredCourses = courses.filter((course) => {
    const query = searchQuery.toLowerCase();
    if (!query) return true;
    return (
      course.name.toLowerCase().includes(query) ||
      course.code.toLowerCase().includes(query)
    );
  });

  const totalRecords = filteredCourses.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));
  const pagedCourses = filteredCourses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const displayCount = pagedCourses.length;

  const goToPage = (p: number) => {
    setPage(Math.max(1, Math.min(totalPages, p)));
  };

  const handleAddCourse = (values: CourseFormValues) => {
    setCourses((prev) => {
      const nextId = prev.length > 0 ? Math.max(...prev.map((c) => c.id)) + 1 : 1;
      const credits = values.credits;
      const isCompulsory = values.type === "bat-buoc";

      const newCourse: ProgramCourse = {
        id: nextId,
        specialization: values.specialization,
        type: values.type,
        code: values.code,
        name: values.name,
        credits,
        compulsory: isCompulsory ? credits : 0,
        optional: isCompulsory ? 0 : credits,
      };

      return [...prev, newCourse];
    });
  };

  const handleEditCourse = (values: CourseFormValues) => {
    if (!editingCourse) return;

    setCourses((prev) =>
      prev.map((course) => {
        if (course.id !== editingCourse.id) return course;

        const credits = values.credits;
        const isCompulsory = values.type === "bat-buoc";

        return {
          ...course,
          specialization: values.specialization,
          type: values.type,
          code: values.code,
          name: values.name,
          credits,
          compulsory: isCompulsory ? credits : 0,
          optional: isCompulsory ? 0 : credits,
        };
      })
    );
  };

  const handleDeleteCourse = () => {
    if (!deletingCourse) return;

    setCourses((prev) => prev.filter((course) => course.id !== deletingCourse.id));
    setDeletingCourse(null);
  };

  return (
    <AppLayout showSearch={false}>
      <div className="h-full flex flex-col px-8 py-5 bg-slate-50/50">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản lý dữ liệu
            <span className="ml-2 text-xl font-semibold text-slate-900 align-baseline">
              &gt;{' '}
              <button
                type="button"
                onClick={() => router.push("/quan-ly-du-lieu/chuong-trinh-dao-tao")}
                className="text-blue-700 hover:underline"
              >
                Chương trình đào tạo
              </button>
              {(title || programLoading) && (
                <>
                  <span className="mx-1">&gt;</span>
                  {programLoading ? "Đang tải..." : title}
                </>
              )}
            </span>
          </h1>
        </div>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="border-b border-slate-200">
            <TabsList className="bg-transparent h-auto p-0 gap-8 justify-start">
              <TabsTrigger
                value="chuong-trinh-dao-tao"
                className="relative min-w-[180px] justify-center flex rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none px-0 py-3 text-sm font-semibold transition-all"
              >
                <div className="flex items-center justify-center gap-2 w-full">
                  <BookOpen className="w-4 h-4" />
                  Chương trình đào tạo
                </div>
              </TabsTrigger>

              <TabsTrigger
                value="lich-su-import"
                className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none px-0 py-3 text-sm font-semibold transition-all"
              >
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Lịch sử import
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 min-h-0 mt-5 flex flex-col">
            <TabsContent
              value="chuong-trinh-dao-tao"
              className="m-0 h-full outline-none flex flex-col"
            >
              {/* Thanh tìm kiếm & nút hành động giống màn danh sách CTĐT */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-[250px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nhập tên học phần..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 bg-white"
                  />
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    className="bg-[#167FFC] hover:bg-[#1470E3] text-white h-9 gap-2 text-sm"
                    onClick={() => setIsCourseDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Thêm
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 text-sm"
                  >
                    <Download className="h-4 w-4" />
                    Mẫu
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 text-sm"
                    onClick={() => setIsImportOpen(true)}
                  >
                    <Upload className="h-4 w-4" />
                    Import
                  </Button>
                </div>
              </div>

              <div className="flex flex-col flex-1 bg-white rounded-lg border border-slate-200 overflow-hidden min-h-0">
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex-1 overflow-auto min-h-0">
                    <table className="w-full table-fixed" style={{ borderCollapse: "collapse" }}>
                      <thead>
                        <tr
                          className="border-b border-gray-200 bg-blue-50"
                          style={{ position: "sticky", top: 0, zIndex: 10 }}
                        >
                          <th className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50 uppercase w-[6%]">
                            STT
                          </th>
                          <th className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50 uppercase w-[16%]">
                            MÃ HỌC PHẦN
                          </th>
                          <th className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50 uppercase w-[32%]">
                            TÊN HỌC PHẦN
                          </th>
                          <th className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50 uppercase w-[12%]">
                            SỐ TÍN CHỈ
                          </th>
                          <th className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50 uppercase w-[12%]">
                            BẮT BUỘC
                          </th>
                          <th className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50 uppercase w-[12%]">
                            TỰ CHỌN
                          </th>
                          <th className="h-10 px-4 text-right text-sm font-semibold text-gray-700 bg-blue-50 w-[10%]">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr key="loading">
                            <td colSpan={7} className="text-center text-gray-500 py-6">
                              Đang tải...
                            </td>
                          </tr>
                        ) : pagedCourses.length === 0 ? (
                          <tr key="empty">
                            <td colSpan={7} className="text-center text-gray-500 py-6">
                              Chưa có học phần nào
                            </td>
                          </tr>
                        ) : (
                          pagedCourses.map((course, idx) => (
                            <tr key={course.id} className="border-b last:border-b-0">
                              <td className="px-4 py-2 text-sm text-gray-700">
                                {String((page - 1) * PAGE_SIZE + idx + 1).padStart(2, "0")}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-700">{course.code}</td>
                              <td className="px-4 py-2 text-sm text-gray-700">{course.name}</td>
                              <td className="px-4 py-2 text-sm text-gray-700">{course.credits}</td>
                              <td className="px-4 py-2 text-sm text-gray-700">{course.compulsory || ""}</td>
                              <td className="px-4 py-2 text-sm text-gray-700">{course.optional || ""}</td>
                              <td className="px-4 py-2 text-right w-12">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 hover:bg-gray-100"
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-40">
                                    <DropdownMenuItem
                                      className="cursor-pointer text-sm"
                                      onClick={() => {
                                        setEditingCourse(course);
                                        setIsEditCourseDialogOpen(true);
                                      }}
                                    >
                                      Sửa
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="cursor-pointer text-sm text-red-600"
                                      onClick={() => {
                                        setDeletingCourse(course);
                                        setIsDeleteCourseDialogOpen(true);
                                      }}
                                    >
                                      Xóa
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div
                    className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50"
                    style={{ minHeight: 56 }}
                  >
                    <div className="text-sm text-gray-600">
                      Hiển thị {displayCount}/{totalRecords} dòng
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-gray-300"
                        onClick={() => goToPage(1)}
                        disabled={page === 1}
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-gray-300"
                        onClick={() => goToPage(page - 1)}
                        disabled={page === 1}
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
                        onClick={() => goToPage(page + 1)}
                        disabled={page === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-gray-300"
                        onClick={() => goToPage(totalPages)}
                        disabled={page === totalPages}
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="lich-su-import"
              className="m-0 h-full outline-none flex flex-col min-h-0"
            >
              <ImportHistoryTab history={importHistory} />
            </TabsContent>
          </div>
        </Tabs>

        <ImportDialog
          open={isImportOpen}
          onOpenChange={setIsImportOpen}
        />

        <CourseFormDialog
          open={isCourseDialogOpen}
          onOpenChange={setIsCourseDialogOpen}
          onSave={handleAddCourse}
          mode="create"
          initialValues={{
            specialization: title,
          }}
          appliedCourses={program?.appliedCourses}
        />

        <CourseFormDialog
          open={isEditCourseDialogOpen}
          onOpenChange={(open) => {
            setIsEditCourseDialogOpen(open);
            if (!open) setEditingCourse(null);
          }}
          onSave={handleEditCourse}
          mode="edit"
          initialValues={{
            specialization: editingCourse?.specialization ?? "",
            code: editingCourse?.code ?? "",
            name: editingCourse?.name ?? "",
            credits: editingCourse?.credits ?? 0,
            type: editingCourse?.type ?? "bat-buoc",
          }}
          appliedCourses={program?.appliedCourses}
        />

        <DeleteCourseDialog
          open={isDeleteCourseDialogOpen}
          onOpenChange={(open) => {
            setIsDeleteCourseDialogOpen(open);
            if (!open) setDeletingCourse(null);
          }}
          courseLabel={deletingCourse ? deletingCourse.name : ""}
          onConfirm={handleDeleteCourse}
        />
      </div>
    </AppLayout>
  );
}
