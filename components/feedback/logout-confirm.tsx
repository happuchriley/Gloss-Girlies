"use client"

import { useState } from "react"
import { LogOut, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface LogoutConfirmProps {
  onLogout: () => void | Promise<void>
  trigger: (open: () => void) => React.ReactNode
}

export function LogoutConfirm({ onLogout, trigger }: LogoutConfirmProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onLogout()
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {trigger(() => setOpen(true))}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0">
          <div className="bg-gradient-to-br from-pink-50 via-white to-pink-100/50 px-6 pb-2 pt-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-md shadow-pink-200">
              <LogOut className="h-6 w-6" />
            </div>
            <DialogHeader className="text-center">
              <DialogTitle className="text-2xl">See you soon?</DialogTitle>
              <DialogDescription className="mx-auto max-w-xs text-neutral-600">
                Are you sure you want to log out? Your bag is saved on this device.
              </DialogDescription>
            </DialogHeader>
          </div>

          <DialogFooter className="gap-2 px-6 pb-6 pt-2 sm:justify-center">
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-full border-pink-200 sm:w-auto"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Stay signed in
            </Button>
            <Button
              type="button"
              className="w-full gap-2 rounded-full bg-brand hover:bg-brand-dark sm:w-auto"
              onClick={() => void handleConfirm()}
              disabled={loading}
            >
              <Sparkles className="h-4 w-4" />
              {loading ? "Logging out…" : "Yes, log out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
