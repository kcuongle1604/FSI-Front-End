"use client";
import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Certificate } from "../page";

type DeleteCertificateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificate?: Certificate;
  onConfirm?: () => Promise<boolean | void> | boolean | void;
};

export default function DeleteCertificateDialog({ open, onOpenChange, certificate, onConfirm }: DeleteCertificateDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const inFlightRef = useRef(false);

  const handleConfirm = async () => {
    if (submitting || inFlightRef.current) return;
    if (!onConfirm) {
      onOpenChange(false);
      return;
    }

    try {
      inFlightRef.current = true;
      setSubmitting(true);
      setSubmitError("");
      const result = await onConfirm();
      if (result !== false) {
        onOpenChange(false);
      }
    } catch (error: any) {
      const message = typeof error?.message === "string" ? error.message : "Không thể xóa dữ liệu. Vui lòng thử lại.";
      setSubmitError(message);
    } finally {
      inFlightRef.current = false;
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (submitting) return;
    setSubmitError("");
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
          {submitError && <p className="text-xs text-red-500">{submitError}</p>}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="px-6 bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
              disabled={submitting}
            >
              Huỷ
            </Button>
            <Button
              onClick={handleConfirm}
              className="px-6 bg-red-600 hover:bg-red-700 text-white"
              disabled={submitting}
            >
              {submitting ? "Đang xóa..." : "Có"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
