"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Certificate } from "../page";

type DeleteCertificateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificate?: Certificate;
  onConfirm?: () => void;
};

export default function DeleteCertificateDialog({ open, onOpenChange, certificate, onConfirm }: DeleteCertificateDialogProps) {
  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onOpenChange(false);
  };
  const handleCancel = () => {
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Xoá chứng chỉ?</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <p className="text-sm text-gray-700">
            Bạn có chắc chắn muốn <span className="font-semibold">xóa chứng chỉ {certificate?.name}</span> khỏi hệ thống không?
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="px-6 bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
            >
              Huỷ
            </Button>
            <Button
              onClick={handleConfirm}
              className="px-6 bg-red-600 hover:bg-red-700 text-white"
            >
              Có
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
