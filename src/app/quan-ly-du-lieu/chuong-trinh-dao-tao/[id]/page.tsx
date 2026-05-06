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
  Search,
  Plus,
  Download,
  Upload,
  MoreVertical,
  BookOpen,
  History,
  Loader2,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Program } from "../page";
import ImportHistoryTab from "../../sinh-vien/components/ImportHistoryTab";
import ProgramSubjectsImportDialog from "../ProgramSubjectsImportDialog";
import type { FileImport } from "../../sinh-vien/types";
import CourseFormDialog, { CourseFormValues } from "../CourseFormDialog";
import DeleteCourseDialog from "../DeleteCourseDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { addSubjectToTrainingProgram, deleteSubjectFromTrainingProgram, getProgramCohorts, getSubjectsByProgramId, getTrainingPrograms, updateTrainingProgramSubject, type Subject } from "../program.api";

type ProgramCourse = {
  id: number;
  programSubjectId?: string;
  specialization: string;
  type: CourseFormValues["type"];
  code: string;
  name: string;
  credits: number;
  compulsory: number;
  optional: number;
};

function resolveProgramSubjectId(subject: any): string | undefined {
  const directCandidates = [
    subject?.program_subject_id,
    subject?.programSubjectId,
    subject?.id,
    subject?.training_program_subject_id,
    subject?.trainingProgramSubjectId,
    subject?.subject_program_id,
    subject?.program_subject?.program_subject_id,
    subject?.program_subject?.id,
    subject?.programSubject?.programSubjectId,
    subject?.programSubject?.id,
    subject?.training_program_subject?.program_subject_id,
    subject?.trainingProgramSubject?.programSubjectId,
  ];

  for (const candidate of directCandidates) {
    const value = String(candidate ?? "").trim();
    if (value) {
      return value;
    }
  }

  if (subject && typeof subject === "object") {
    for (const [key, value] of Object.entries(subject)) {
      if (!/program.*subject.*id|subject.*program.*id/i.test(key)) continue;
      const candidate = String(value ?? "").trim();
      if (candidate) {
        return candidate;
      }
    }
  }

  return undefined;
}

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

function ChuongTrinhDaoTaoDetailContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const programId = Number(params?.id);
  const programNameFromUrl = searchParams.get('name');

  const [programs, setPrograms] = useState<Program[]>([]);
  const [program, setProgram] = useState<Program | null>(null);
  const [programLoading, setProgramLoading] = useState(true);
  const [appliedCourseNames, setAppliedCourseNames] = useState<string[]>([]);

  const title = program?.name ?? programNameFromUrl ?? "Chương trình đào tạo";

  const [activeTab, setActiveTab] = useState("chuong-trinh-dao-tao");
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<ProgramCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [importHistory] = useState<FileImport[]>([]);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [subjectsRefreshKey, setSubjectsRefreshKey] = useState(0);
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [isEditCourseDialogOpen, setIsEditCourseDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<ProgramCourse | null>(null);
  const [isDeleteCourseDialogOpen, setIsDeleteCourseDialogOpen] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState<ProgramCourse | null>(null);
  const [programSubjectIdBySubjectCode, setProgramSubjectIdBySubjectCode] = useState<Record<string, string>>({});

  // Fetch training programs from API
  useEffect(() => {
    // If we have program name from URL, use it directly
    if (programNameFromUrl) {
      setProgram({ id: programId, name: programNameFromUrl });
      setProgramLoading(false);
      return;
    }

    // Otherwise, fetch from API
    const fetchPrograms = async () => {
      try {
        setProgramLoading(true);
        const response = await getTrainingPrograms();
        if (response?.data && Array.isArray(response.data)) {
          const programsList = response.data.map((p: any) => ({
            id: p.program_id || p.id,
            name: p.program_name || p.name,
          }));
          setPrograms(programsList);
          
          // Find matching program
          const matchedProgram = programsList.find((p: Program) => p.id === programId);
          if (matchedProgram) {
            setProgram(matchedProgram);
          }
        }
      } catch (err) {
      } finally {
        setProgramLoading(false);
      }
    };

    fetchPrograms();
  }, [programId, programNameFromUrl]);

  useEffect(() => {
    if (!Number.isFinite(programId) || programId <= 0) {
      setAppliedCourseNames([]);
      return;
    }

    const fetchAppliedCourses = async () => {
      try {
        const response = await getProgramCohorts(programId);
        const cohorts = Array.isArray(response?.data) ? response.data : [];
        const names = cohorts
          .map((cohort: any) => String(cohort?.name || cohort?.cohort_id || "").trim())
          .filter(Boolean);
        setAppliedCourseNames(names);
      } catch {
        setAppliedCourseNames([]);
      }
    };

    fetchAppliedCourses();
  }, [programId, subjectsRefreshKey]);

  // Fetch subjects when training program ID is available
  useEffect(() => {
    if (!Number.isFinite(programId) || programId <= 0) return;

    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const allSubjects: Subject[] = [];
        const size = 100;
        let page = 1;

        while (true) {
          const response = await getSubjectsByProgramId(programId, page, size);
          const payload = response?.data;
          const pageSubjects = Array.isArray(payload)
            ? payload
            : payload?.data || payload?.items || payload?.results || [];

          if (!Array.isArray(pageSubjects)) break;
          allSubjects.push(...pageSubjects);

          if (pageSubjects.length < size) break;
          page += 1;
        }

        if (allSubjects.length > 0) {
          const idMap: Record<string, string> = {}

          // Map API response to ProgramCourse structure
          const mappedCourses: ProgramCourse[] = allSubjects.map((subject: Subject, index: number) => {
            const programSubjectIdFromResponse = String(subject.program_subject_id ?? "").trim()
            const resolvedProgramSubjectId = programSubjectIdFromResponse || resolveProgramSubjectId(subject)
            const subjectCode = String(subject.subject_id || "").trim()

            if (subjectCode && resolvedProgramSubjectId) {
              idMap[subjectCode] = resolvedProgramSubjectId
            }

            return ({
            id: index + 1,
            programSubjectId: resolvedProgramSubjectId,
            specialization: title,
            type: subject.is_required ? "bat-buoc" : "tu-chon",
            code: subject.subject_id,
            name: subject.name || subject.course_display_name,
            credits: subject.credits,
            compulsory: subject.is_required ? subject.credits : 0,
            optional: subject.is_required ? 0 : subject.credits,
          })
          });
          
          setCourses(mappedCourses);
          setProgramSubjectIdBySubjectCode(idMap);
        } else {
          setCourses([]);
          setProgramSubjectIdBySubjectCode({});
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
        }
        setCourses([]);
        setProgramSubjectIdBySubjectCode({});
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [programId, subjectsRefreshKey, title]);

  const filteredCourses = courses.filter((course) => {
    const query = searchQuery.toLowerCase();
    if (!query) return true;
    return (
      course.name.toLowerCase().includes(query) ||
      course.code.toLowerCase().includes(query)
    );
  });

  const totalRecords = filteredCourses.length;
  const displayCount = totalRecords;

  const handleAddCourse = async (values: CourseFormValues) => {
    if (!Number.isFinite(programId) || programId <= 0) return;

    try {
      await addSubjectToTrainingProgram({
        program_subject_id: 0,
        training_program_id: programId,
        subject_id: values.code,
        subject_name: values.name,
        credits: values.credits,
        is_required: values.type === "bat-buoc",
      });

      setSubjectsRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Không thể thêm học phần vào chương trình đào tạo."
      throw new Error(String(message))
    }
  };

  const handleEditCourse = async (values: CourseFormValues) => {
    if (!editingCourse) return;

    const fallbackFromCourses = courses.find((course) => {
      if (course.id === editingCourse.id) return true;
      const sameCode = String(course.code || "").trim() === String(editingCourse.code || "").trim();
      const sameName = String(course.name || "").trim() === String(editingCourse.name || "").trim();
      return sameCode && sameName;
    });

    const resolvedProgramSubjectId = String(
      values.programSubjectId ||
      editingCourse.programSubjectId ||
      fallbackFromCourses?.programSubjectId ||
      programSubjectIdBySubjectCode[String(editingCourse.code || "").trim()] ||
      ""
    ).trim();

    if (!resolvedProgramSubjectId) {
      throw new Error("Không tìm thấy program_subject_id để cập nhật học phần.");
    }

    try {
      await updateTrainingProgramSubject(resolvedProgramSubjectId, {
        is_required: values.type === "bat-buoc",
      });

      setSubjectsRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Không thể cập nhật loại học phần.";
      throw new Error(String(message));
    }
  };

  const handleDeleteCourse = async () => {
    if (!deletingCourse) return;

    if (!Number.isFinite(programId) || programId <= 0) {
      throw new Error("Không xác định được chương trình đào tạo.")
    }

    if (!deletingCourse.code || deletingCourse.code === "-") {
      throw new Error("Mã học phần không hợp lệ.")
    }

    try {
      await deleteSubjectFromTrainingProgram(programId, deletingCourse.code)
      setCourses((prev) => prev.filter((course) => course.id !== deletingCourse.id));
      setDeletingCourse(null);
      setSubjectsRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Không thể xóa học phần khỏi chương trình đào tạo."
      throw new Error(String(message))
    }
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

                <div className="flex flex-col bg-white rounded-lg border border-slate-200 overflow-hidden min-h-0">
                  {/* Table */}
                  <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                    <div className="overflow-x-auto" style={{ height: '530px' }}>
                      <Table className="w-full" style={{ borderCollapse: 'collapse' }}>
                      <TableHeader>
                        <TableRow className="border-b border-gray-200 bg-blue-50">
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50 uppercase w-[6%]">
                            STT
                          </TableHead>
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50 uppercase w-[16%]">
                            MÃ HỌC PHẦN
                          </TableHead>
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50 uppercase w-[32%]">
                            TÊN HỌC PHẦN
                          </TableHead>
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50 uppercase w-[12%]">
                            SỐ TÍN CHỈ
                          </TableHead>
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50 uppercase w-[12%]">
                            BẮT BUỘC
                          </TableHead>
                          <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50 uppercase w-[12%]">
                            TỰ CHỌN
                          </TableHead>
                          <TableHead className="h-10 px-4 text-right text-sm font-semibold text-gray-700 bg-blue-50 w-[10%]">
                            <span className="sr-only">Actions</span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCourses.length > 0 ? (
                          filteredCourses.map((course, idx) => (
                            <TableRow
                              key={course.id}
                              className="border-b border-gray-200 hover:bg-gray-50 last:border-b-0"
                            >
                              <TableHead className="h-12 px-4 text-sm text-gray-700 whitespace-nowrap w-[6%]">
                                {String(idx + 1).padStart(2, "0")}
                              </TableHead>
                              <TableHead className="h-12 px-4 text-sm text-gray-700 whitespace-nowrap w-[16%]">
                                <div className="truncate">{course.code}</div>
                              </TableHead>
                              <TableHead className="h-12 px-4 text-sm text-gray-700 w-[32%]">
                                <div className="truncate">{course.name}</div>
                              </TableHead>
                              <TableHead className="h-12 px-4 text-sm text-gray-700 whitespace-nowrap w-[12%]">{course.credits || "-"}</TableHead>
                              <TableHead className="h-12 px-4 text-sm text-gray-700 whitespace-nowrap w-[12%]">
                                {course.compulsory || "-"}
                              </TableHead>
                              <TableHead className="h-12 px-4 text-sm text-gray-700 whitespace-nowrap w-[12%]">{course.optional || "-"}</TableHead>
                              <TableHead className="h-12 px-4 text-right whitespace-nowrap w-[10%]">
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
                                  <DropdownMenuContent align="end" className="w-32">
                                    <DropdownMenuItem
                                      className="text-sm"
                                      onClick={() => {
                                        setEditingCourse(course);
                                        setIsEditCourseDialogOpen(true);
                                      }}
                                    >
                                      Sửa
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-sm text-red-600 focus:text-red-600"
                                      onClick={() => {
                                        setDeletingCourse(course);
                                        setIsDeleteCourseDialogOpen(true);
                                      }}
                                    >
                                      Xóa
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableHead>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow key="empty">
                            <TableHead colSpan={7} className="p-0">
                              <div className="h-120 w-full flex items-center justify-center text-gray-500 text-sm">
                                {loading ? (
                                  <span className="inline-flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Đang tải dữ liệu...
                                  </span>
                                ) : (
                                  "Không có dữ liệu"
                                )}
                              </div>
                            </TableHead>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50" style={{ minHeight: 56 }}>
                  <div className="text-sm text-gray-600">Hiển thị {displayCount}/{displayCount} dòng</div>
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

        <ProgramSubjectsImportDialog
          open={isImportOpen}
          onOpenChange={setIsImportOpen}
          programName={program?.name}
          onImportSuccess={() => setSubjectsRefreshKey((prev) => prev + 1)}
        />

        <CourseFormDialog
          open={isCourseDialogOpen}
          onOpenChange={setIsCourseDialogOpen}
          onSave={handleAddCourse}
          mode="create"
          initialValues={{
            specialization: title,
          }}
          appliedCourses={appliedCourseNames}
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
            programSubjectId: editingCourse?.programSubjectId,
            specialization: editingCourse?.specialization ?? "",
            code: editingCourse?.code ?? "",
            name: editingCourse?.name ?? "",
            credits: editingCourse?.credits ?? 0,
            type: editingCourse?.type ?? "bat-buoc",
          }}
          appliedCourses={appliedCourseNames}
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

export default function ChuongTrinhDaoTaoDetailPage() {
  return (
    <Suspense fallback={null}>
      <ChuongTrinhDaoTaoDetailContent />
    </Suspense>
  );
}
