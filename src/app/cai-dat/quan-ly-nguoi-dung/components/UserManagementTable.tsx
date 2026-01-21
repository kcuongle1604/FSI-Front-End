import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, MoreVertical, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Account = {
  id: number
  name: string
  email: string
  role: string
  status: string
  isBan: boolean
}

interface UserManagementTableProps {
  accounts: Account[]
  userStatuses: Record<number, string>
  onEditClick: (account: Account) => void
  onDeleteClick: (account: Account) => void
  onStatusClick: (account: Account) => void
}

export default function UserManagementTable({
  accounts,
  userStatuses,
  onEditClick,
  onDeleteClick,
  onStatusClick
}: UserManagementTableProps) {
  const totalRecords = accounts.length
  const displayCount = Math.min(30, totalRecords)

  return (
    <div className="flex flex-col flex-1 bg-white rounded-lg border border-slate-200 overflow-hidden min-h-0">
      {/* Table */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <div className="overflow-auto">
          <Table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-blue-50" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50">STT</TableHead>
                <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50">HỌ TÊN</TableHead>
                <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50">EMAIL</TableHead>
                <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50">VAI TRÒ</TableHead>
                <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50">TRẠNG THÁI</TableHead>
                <TableHead className="h-10 px-4 text-left text-sm font-semibold text-gray-700 bg-blue-50">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.slice(0, 30).map((account, index) => (
                <TableRow key={account.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <TableCell className="h-12 px-4 text-sm text-gray-600">
                    {String(index + 1).padStart(2, '0')}
                  </TableCell>
                  <TableCell className="h-12 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{account.name}</span>
                      {account.isBan && (
                        <Badge className="bg-[#E8F2FF] text-[#167FFC] hover:bg-[#E8F2FF] text-xs px-2 py-0.5">
                          BAN
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="h-12 px-4 text-sm text-gray-600">{account.email}</TableCell>
                  <TableCell className="h-12 px-4 text-sm text-gray-600">{account.role}</TableCell>
                  <TableCell className="h-12 px-4">
                    <div 
                      className="flex items-center gap-2 cursor-pointer hover:text-[#167FFC] transition-colors w-fit"
                      onClick={() => onStatusClick(account)}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        userStatuses[account.id] === "Hoạt động" ? "bg-green-500" : "bg-red-500"
                      }`}></span>
                      <span className="text-sm text-gray-900">{userStatuses[account.id]}</span>
                    </div>
                  </TableCell>
                  <TableCell className="h-12 px-4">
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
                      <DropdownMenuContent align="start" className="w-40" side="bottom" sideOffset={8}>
                        <DropdownMenuItem
                          className="cursor-pointer text-sm"
                          onClick={() => onEditClick(account)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer text-sm text-red-600"
                          onClick={() => onDeleteClick(account)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
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
            disabled={true}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-gray-300"
            disabled={true}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 px-3">
            <span className="text-sm font-medium text-gray-700">1</span>
            <span className="text-sm text-gray-400">/</span>
            <span className="text-sm text-gray-600">{Math.ceil(totalRecords / 30)}</span>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-gray-300"
            disabled={totalRecords <= 30}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-gray-300"
            disabled={totalRecords <= 30}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
