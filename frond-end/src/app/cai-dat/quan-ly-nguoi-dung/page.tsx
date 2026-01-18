"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
import { 
  Edit, 
  Trash2, 
  Plus,
  MoreVertical,
  Search,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight
} from "lucide-react"
import AppLayout from "@/components/AppLayout"
import { AddUserDialog } from "./components/AddUserDialog"
import { EditUserDialog } from "./components/EditUserDialog"
import { DeleteUserDialog } from "./components/DeleteUserDialog"
import { SuspendUserDialog } from "./components/SuspendUserDialog"

type Account = {
  id: number
  name: string
  email: string
  role: string
  status: string
  isBan: boolean
}

type UserData = {
  role: string
  assignClasses: string[]
  email: string
  fullName: string
  password: string
  confirmPassword: string
}

const accounts = [
  { id: 1, name: "Trang Than", email: "trangthan@gmail.com", role: "Giáo vụ khoa", status: "Hoạt động", isBan: true },
  { id: 2, name: "Nguyễn Văn B", email: "NguyenvanB@gmail.com", role: "Ban chủ nhiệm khoa", status: "Hoạt động", isBan: false },
  { id: 3, name: "Nguyễn Văn C", email: "NguyenvanC@gmail.com", role: "Giáo viên chủ nhiệm", status: "Hoạt động", isBan: false },
  { id: 4, name: "Nguyễn Văn D", email: "NguyenvanD@gmail.com", role: "Giáo viên chủ nhiệm", status: "Hoạt động", isBan: false },
  { id: 5, name: "Nguyễn Văn E", email: "NguyenvanE@gmail.com", role: "Giáo viên chủ nhiệm", status: "Hoạt động", isBan: false },
  { id: 6, name: "Nguyễn Văn F", email: "NguyenvanF@gmail.com", role: "Giáo viên chủ nhiệm", status: "Hoạt động", isBan: false },
  { id: 7, name: "Nguyễn Văn G", email: "NguyenvanG@gmail.com", role: "Giáo viên chủ nhiệm", status: "Hoạt động", isBan: false },
  { id: 8, name: "Nguyễn Văn H", email: "NguyenvanH@gmail.com", role: "Giáo viên chủ nhiệm", status: "Hoạt động", isBan: false },
  { id: 9, name: "Nguyễn Văn I", email: "NguyenvanI@gmail.com", role: "Giáo viên chủ nhiệm", status: "Hoạt động", isBan: false },
  { id: 10, name: "Nguyễn Văn J", email: "NguyenvanJ@gmail.com", role: "Giáo viên chủ nhiệm", status: "Hoạt động", isBan: false },
  { id: 11, name: "Nguyễn Văn K", email: "NguyenvanK@gmail.com", role: "Giáo vụ khoa", status: "Hoạt động", isBan: false },
  { id: 12, name: "Nguyễn Văn L", email: "NguyenvanL@gmail.com", role: "Ban chủ nhiệm khoa", status: "Hoạt động", isBan: false },
  { id: 13, name: "Nguyễn Văn M", email: "NguyenvanM@gmail.com", role: "Giáo viên chủ nhiệm", status: "Hoạt động", isBan: false },
  { id: 14, name: "Nguyễn Văn N", email: "NguyenvanN@gmail.com", role: "Giáo viên chủ nhiệm", status: "Hoạt động", isBan: false },
  { id: 15, name: "Nguyễn Văn O", email: "NguyenvanO@gmail.com", role: "Giáo vụ khoa", status: "Hoạt động", isBan: false },
  { id: 16, name: "Nguyễn Văn P", email: "NguyenvanP@gmail.com", role: "Giáo viên chủ nhiệm", status: "Hoạt động", isBan: false },
  { id: 17, name: "Nguyễn Văn Q", email: "NguyenvanQ@gmail.com", role: "Ban chủ nhiệm khoa", status: "Hoạt động", isBan: false },
  { id: 18, name: "Nguyễn Văn R", email: "NguyenvanR@gmail.com", role: "Giáo viên chủ nhiệm", status: "Hoạt động", isBan: false },
  { id: 19, name: "Nguyễn Văn S", email: "NguyenvanS@gmail.com", role: "Giáo viên chủ nhiệm", status: "Hoạt động", isBan: false },
  { id: 20, name: "Nguyễn Văn T", email: "NguyenvanT@gmail.com", role: "Giáo vụ khoa", status: "Hoạt động", isBan: false },
]

export default function QuanLyNguoiDungPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openSuspendDialog, setOpenSuspendDialog] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | undefined>()
  const [userStatuses, setUserStatuses] = useState<Record<number, string>>(
    accounts.reduce((acc, account) => ({ ...acc, [account.id]: account.status }), {})
  )

  const filteredAccounts = accounts.filter(account => 
    account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEditClick = (account: Account) => {
    setSelectedAccount(account)
    setOpenEditDialog(true)
  }

  const handleDeleteClick = (account: Account) => {
    setSelectedAccount(account)
    setOpenDeleteDialog(true)
  }

  const handleAddUser = (userData: UserData) => {
    console.log("Add new user:", userData)
    // Add logic to handle new user creation here
  }

  const handleUpdateUser = (userData: UserData) => {
    console.log("Update user:", userData)
    // Add logic to handle user update here
  }

  const handleConfirmDelete = () => {
    console.log("Delete user:", selectedAccount)
    // Add logic to handle user deletion here
  }

  const handleStatusClick = (account: Account) => {
    setSelectedAccount(account)
    setOpenSuspendDialog(true)
  }

  const handleConfirmSuspend = (newStatus: string) => {
    if (selectedAccount) {
      setUserStatuses(prev => ({
        ...prev,
        [selectedAccount.id]: newStatus
      }))
      console.log("Update status for user:", selectedAccount.name, "to:", newStatus)
    }
  }

  return (
    <AppLayout 
      title="Quản lý người dùng"
      showSearch={false}
    >
      {/* Search and Actions Bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Nhập họ tên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-white"
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button 
            onClick={() => setOpenAddDialog(true)}
            className="bg-[#167FFC] hover:bg-[#1470E3] text-white h-9 gap-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            Thêm mới
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <div className="flex flex-col flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex-1 overflow-auto">
          <Table className="min-w-max">
            <TableHeader>
              <TableRow className="border-b border-gray-200">
                  <TableHead className="h-10 px-6 text-left text-sm font-medium text-gray-700">STT</TableHead>
                  <TableHead className="h-10 px-6 text-left text-sm font-medium text-gray-700">HỌ TÊN</TableHead>
                  <TableHead className="h-10 px-6 text-left text-sm font-medium text-gray-700">EMAIL</TableHead>
                  <TableHead className="h-10 px-6 text-left text-sm font-medium text-gray-700">VAI TRÒ</TableHead>
                  <TableHead className="h-10 px-6 text-left text-sm font-medium text-gray-700">TRẠNG THÁI</TableHead>
                  <TableHead className="h-10 px-6 text-left text-sm font-medium text-gray-700">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {filteredAccounts.slice(0, 30).map((account, index) => (
              <TableRow key={account.id} className="border-b border-gray-200 hover:bg-gray-50">
                <TableCell className="h-12 px-6 text-sm text-gray-600">
                  {String(index + 1).padStart(2, '0')}
                </TableCell>
                <TableCell className="h-12 px-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{account.name}</span>
                    {account.isBan && (
                      <Badge className="bg-[#E8F2FF] text-[#167FFC] hover:bg-[#E8F2FF] text-xs px-2 py-0.5">
                        BAN
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="h-12 px-6 text-sm text-gray-600">{account.email}</TableCell>
                <TableCell className="h-12 px-6 text-sm text-gray-600">{account.role}</TableCell>
                <TableCell className="h-12 px-6">
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:text-[#167FFC] transition-colors"
                    onClick={() => handleStatusClick(account)}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      userStatuses[account.id] === "Hoạt động" ? "bg-green-500" : "bg-red-500"
                    }`}></span>
                    <span className="text-sm text-gray-900">{userStatuses[account.id]}</span>
                  </div>
                </TableCell>
                <TableCell className="h-12 px-6">
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
                        onClick={() => handleEditClick(account)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer text-sm text-red-600"
                        onClick={() => handleDeleteClick(account)}
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
        
        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Hiển thị {Math.min(30, filteredAccounts.length)}/{filteredAccounts.length} bản ghi
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
              <span className="text-sm text-gray-600">2</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-gray-300"
              disabled={filteredAccounts.length <= 20}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-gray-300"
              disabled={filteredAccounts.length <= 30}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Add User Dialog */}
      <AddUserDialog 
        open={openAddDialog}
        onOpenChange={setOpenAddDialog}
        onAdd={handleAddUser}
      />

      {/* Edit User Dialog */}
      <EditUserDialog 
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
        account={selectedAccount}
        onUpdate={handleUpdateUser}
      />

      {/* Delete User Dialog */}
      <DeleteUserDialog 
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        account={selectedAccount}
        onConfirm={handleConfirmDelete}
      />

      {/* Suspend User Dialog */}
      <SuspendUserDialog 
        open={openSuspendDialog}
        onOpenChange={setOpenSuspendDialog}
        account={selectedAccount}
        onConfirm={handleConfirmSuspend}
      />
    </AppLayout>
  )
}
