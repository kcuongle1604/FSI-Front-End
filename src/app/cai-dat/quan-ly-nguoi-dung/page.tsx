"use client"

import { useState, useEffect } from "react"
import { Plus, Search } from "lucide-react"
import AppLayout from "@/components/AppLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import UserManagementTable from "./components/UserManagementTable"
import { AddUserDialog } from "./components/AddUserDialog"
import { EditUserDialog } from "./components/EditUserDialog"
import { DeleteUserDialog } from "./components/DeleteUserDialog"
import { SuspendUserDialog } from "./components/SuspendUserDialog"

import {
  getUsers,
  updateUser,
  updateUserStatus,
  deleteUser,
  type User,
  type UserUpdateRequest,
} from "@/lib/user.api"

export type Account = User

export default function QuanLyNguoiDungPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openSuspendDialog, setOpenSuspendDialog] = useState(false)

  const [selectedAccount, setSelectedAccount] = useState<Account | undefined>()
  const [userStatuses, setUserStatuses] = useState<Record<number, string>>({})

  // ================= FETCH USERS =================
  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await getUsers()
      const data = response.data

      setAccounts(data)

      const statuses = data.reduce(
        (acc: Record<number, string>, u: Account) => ({
          ...acc,
          [u.user_id]: u.is_active ? "Hoạt động" : "Ngưng hoạt động",
        }),
        {}
      )
      setUserStatuses(statuses)
    } catch (err) {
      setError("Không thể tải danh sách người dùng")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // ================= FILTER =================
  const filteredAccounts = accounts.filter(
    (a) =>
      a.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.role?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ================= HANDLERS =================
  const handleEditClick = (account: Account) => {
    setSelectedAccount(account)
    setOpenEditDialog(true)
  }

  const handleDeleteClick = (account: Account) => {
    setSelectedAccount(account)
    setOpenDeleteDialog(true)
  }

  const handleStatusClick = (account: Account) => {
    setSelectedAccount(account)
    setOpenSuspendDialog(true)
  }

  const handleUpdateUser = async (data: any) => {
    if (!selectedAccount) return

    try {
      const payload: UserUpdateRequest = {
        username: data.fullName,
        email: data.email,
        role_id: data.role,
      }

      if (data.password) payload.password = data.password

      await updateUser(selectedAccount.user_id, payload)
      setOpenEditDialog(false)
      fetchUsers()
    } catch (err) {
      setError("Cập nhật người dùng thất bại")
      console.error(err)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedAccount) return

    try {
      await deleteUser(selectedAccount.user_id)
      setOpenDeleteDialog(false)
      fetchUsers()
    } catch (err) {
      setError("Xóa người dùng thất bại")
      console.error(err)
    }
  }

  const handleConfirmSuspend = async (newStatus: string) => {
    if (!selectedAccount) return

    try {
      await updateUserStatus(selectedAccount.user_id, { status: newStatus })

      setUserStatuses((prev) => ({
        ...prev,
        [selectedAccount.user_id]: newStatus,
      }))

      setAccounts((prev) =>
        prev.map((u) =>
          u.user_id === selectedAccount.user_id
            ? { ...u, is_active: newStatus === "Hoạt động" }
            : u
        )
      )
    } catch (err) {
      setError("Cập nhật trạng thái thất bại")
      console.error(err)
    }
  }

  // ================= UI =================
  return (
    <AppLayout showSearch={false}>
      <div className="h-full flex flex-col px-8 py-5 bg-slate-50/50">
        <h1 className="text-2xl font-bold mb-4">Quản lý người dùng</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Nhập họ tên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
              disabled={loading}
            />
          </div>

          <Button
            onClick={() => setOpenAddDialog(true)}
            className="ml-auto h-9 gap-2"
          >
            <Plus className="h-4 w-4" />
            Thêm
          </Button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center bg-white rounded border">
            Đang tải dữ liệu...
          </div>
        ) : (
          <UserManagementTable
            accounts={filteredAccounts}
            userStatuses={userStatuses}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            onStatusClick={handleStatusClick}
          />
        )}
      </div>

      {/* ADD */}
      <AddUserDialog
        open={openAddDialog}
        onOpenChange={setOpenAddDialog}
        onSuccess={fetchUsers} // ⭐ KHÔNG CẦN REFRESH
      />

      {/* EDIT */}
      <EditUserDialog
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
        account={selectedAccount}
        onUpdate={handleUpdateUser}
      />

      {/* DELETE */}
      <DeleteUserDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        account={selectedAccount}
        onConfirm={handleConfirmDelete}
      />

      {/* SUSPEND */}
      <SuspendUserDialog
        open={openSuspendDialog}
        onOpenChange={setOpenSuspendDialog}
        account={selectedAccount}
        onConfirm={handleConfirmSuspend}
        currentStatus={
          selectedAccount ? userStatuses[selectedAccount.user_id] : undefined
        }
      />
    </AppLayout>
  )
}
