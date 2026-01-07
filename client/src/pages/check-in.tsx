import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { MoodEmojiPicker } from "@/components/mood-emoji-picker";
import { StressLevelPicker } from "@/components/stress-level-picker";
import { Heart, Save, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const checkInSchema = z.object({
  moodLevel: z.number().min(1).max(5),
  stressLevel: z.number().min(1).max(5),
  journalEntry: z.string().optional(),
});

type CheckInFormData = z.infer<typeof checkInSchema>;

export default function CheckIn() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CheckInFormData>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      moodLevel: 3,
      stressLevel: 3,
      journalEntry: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CheckInFormData) => {
      const response = await apiRequest("POST", "/api/mood-entries", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/mood-entries"] });
      toast({
        title: "Check-in Complete!",
        description: "Your mood entry has been saved successfully.",
      });
      navigate("/");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Session Expired",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to save your check-in. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CheckInFormData) => {
    mutation.mutate(data);
  };

  const moodLevel = form.watch("moodLevel");
  const stressLevel = form.watch("stressLevel");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Daily Check-in</h1>
          <p className="text-muted-foreground">
            Take a moment to reflect on how you're feeling
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Mood Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                How's your mood?
              </CardTitle>
              <CardDescription>
                Select the emoji that best represents how you're feeling right now
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="moodLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <MoodEmojiPicker
                        value={field.value}
                        onChange={field.onChange}
                        disabled={mutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Stress Level Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                What's your stress level?
              </CardTitle>
              <CardDescription>
                Rate your current stress from relaxed to severe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="stressLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <StressLevelPicker
                        value={field.value}
                        onChange={field.onChange}
                        disabled={mutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Journal Entry */}
          <Card>
            <CardHeader>
              <CardTitle>Want to share more? (Optional)</CardTitle>
              <CardDescription>
                Write about what's on your mind. This helps our AI provide better insights.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="journalEntry"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="What's contributing to how you feel today? Any specific events, thoughts, or concerns..."
                        className="min-h-[120px] resize-none"
                        disabled={mutation.isPending}
                        data-testid="input-journal-entry"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/")}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={mutation.isPending}
              data-testid="button-submit-checkin"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Check-in
                </>
              )}
            </Button>
          </div>

          {/* Encouraging Message */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Taking time to check in with yourself is a powerful step toward better mental health. 
                You're doing great!
              </p>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
