"use client"

import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import AppLayout from "@/components/AppLayout"
import UserManagementTable from "./components/UserManagementTable"
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
  const routerImport = require("next/navigation")
  const router = routerImport.useRouter()
  const searchParams = routerImport.useSearchParams()
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

  useEffect(() => {
    // initialize from URL when the page mounts
    try {
      const q = searchParams?.get("q") ?? ""
      if (q !== searchQuery) setSearchQuery(q)
    } catch (e) {
      // ignore in non-browser environments
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // sync search query to URL so returning preserves filters
    try {
      const params = new URLSearchParams(Array.from(searchParams?.entries() ?? []))
      if (searchQuery) params.set("q", searchQuery)
      else params.delete("q")
      const queryString = params.toString()
      const href = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname
      router.replace(href, { scroll: false })
    } catch (e) {
      // noop
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

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
    <AppLayout showSearch={false}>
      <div className="flex-1 flex flex-col min-h-0 px-8 py-5 bg-slate-50/50">
        
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Cài đặt
            <span className="ml-2 text-xl font-semibold text-slate-900 align-baseline">
              &gt; Quản lý người dùng
            </span>
          </h1>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-[250px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Nhập họ tên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-white"
            />
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            <Button 
              onClick={() => setOpenAddDialog(true)}
              className="bg-[#167FFC] hover:bg-[#1470E3] text-white h-9 gap-2 text-sm"
            >
              <Plus className="h-4 w-4" />
              Thêm
            </Button>
          </div>
        </div>

        {/* Table */}
        <UserManagementTable 
          accounts={filteredAccounts}
          userStatuses={userStatuses}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
          onStatusClick={handleStatusClick}
        />
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
        currentStatus={selectedAccount ? userStatuses[selectedAccount.id] : undefined}
      />
    </AppLayout>
  )
}
