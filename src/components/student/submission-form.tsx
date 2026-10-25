"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Same rules as the backend, so most mistakes are caught before any request is sent.
// The server still re-validates everything: never trust the browser.
const schema = z.object({
  projectName: z
    .string()
    .trim()
    .min(3, "Project name must be at least 3 characters")
    .max(100, "Project name must be at most 100 characters"),
  repoUrl: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .refine((v) => /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+?(\.git)?\/?$/i.test(v), {
      message: "Must look like https://github.com/username/repository",
    }),
  liveLink: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .refine((v) => /^https?:\/\//i.test(v), { message: "Must start with http:// or https://" }),
  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters")
    .max(1000, "Description must be at most 1000 characters"),
});

type FormValues = z.infer<typeof schema>;
const fields: (keyof FormValues)[] = ["projectName", "repoUrl", "liveLink", "description"];

export function SubmissionForm({ onSuccess }: { onSuccess: () => void }) {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { projectName: "", repoUrl: "", liveLink: "", description: "" },
  });

  const descriptionLength = watch("description")?.length ?? 0;

  const onSubmit = async (values: FormValues) => {
    try {
      await api("/submissions", { method: "POST", body: values });
      toast.success("Project submitted for review");
      reset();
      onSuccess();
    } catch (err) {
      if (!(err instanceof ApiError)) {
        toast.error("Could not reach the server");
        return;
      }

      if (err.status === 409) {
        setError("repoUrl", { message: err.message });
      } else if (err.status === 400) {
        err.errors?.forEach((e) => {
          if ((fields as string[]).includes(e.field)) {
            setError(e.field as keyof FormValues, { message: e.message });
          }
        });
      }
      // 429 (rate limit), 401 and other cases just show the server message
      toast.error(err.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit a project</CardTitle>
        <CardDescription>Your mentor will review it and leave feedback.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="projectName">Project name</Label>
            <Input id="projectName" {...register("projectName")} />
            {errors.projectName && (
              <p className="text-sm text-destructive">{errors.projectName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="repoUrl">GitHub repository URL</Label>
            <Input id="repoUrl" placeholder="https://github.com/username/repo" {...register("repoUrl")} />
            {errors.repoUrl && <p className="text-sm text-destructive">{errors.repoUrl.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="liveLink">Live link</Label>
            <Input id="liveLink" placeholder="https://my-project.vercel.app" {...register("liveLink")} />
            {errors.liveLink && <p className="text-sm text-destructive">{errors.liveLink.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={5} {...register("description")} />
            <div className="flex justify-between text-sm">
              <span className="text-destructive">{errors.description?.message}</span>
              <span className="text-muted-foreground">{descriptionLength}/1000</span>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit project"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}