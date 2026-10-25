"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Submission } from "@/types";

export interface ReviewTarget {
  submission: Submission;
  action: "APPROVED" | "REJECTED";
}

interface Props {
  target: ReviewTarget | null;
  onClose: () => void;
  onDone: () => void;
}

export function ReviewDialog({ target, onClose, onDone }: Props) {
  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {/* Mounted only while open, so the form state resets every time */}
        {target && <ReviewForm target={target} onClose={onClose} onDone={onDone} />}
      </DialogContent>
    </Dialog>
  );
}

function ReviewForm({ target, onClose, onDone }: { target: ReviewTarget; onClose: () => void; onDone: () => void }) {
  const { submission, action } = target;
  const isReject = action === "REJECTED";

  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    const text = feedback.trim();

    if (isReject && text.length < 5) {
      setError("Please give feedback (at least 5 characters) when rejecting");
      return;
    }

    setSubmitting(true);
    try {
      await api(`/mentor/submissions/${submission.id}/review`, {
        method: "PATCH",
        body: { status: action, ...(text && { feedback: text }) },
      });
      toast.success(isReject ? "Project rejected" : "Project approved");
      onDone();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
        // 409 = someone already reviewed it: close and refresh the list
        if (err.status === 409) onDone();
      } else {
        toast.error("Could not reach the server");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isReject ? "Reject" : "Approve"} project</DialogTitle>
        <DialogDescription>
          {submission.projectName} by {submission.student?.name}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-2">
        <Label htmlFor="feedback">
          Feedback {isReject ? "(required)" : "(optional)"}
        </Label>
        <Textarea
          id="feedback"
          rows={4}
          maxLength={1000}
          value={feedback}
          onChange={(e) => {
            setFeedback(e.target.value);
            setError("");
          }}
          placeholder={isReject ? "Explain what needs to be improved..." : "Say what was good..."}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant={isReject ? "destructive" : "default"}
          onClick={handleConfirm}
          disabled={submitting}
        >
          {submitting ? "Saving..." : isReject ? "Reject" : "Approve"}
        </Button>
      </DialogFooter>
    </>
  );
}