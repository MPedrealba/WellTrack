import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  Brain, 
  BarChart3, 
  Shield, 
  Heart, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  Users,
  TrendingUp,
  BookOpen
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold tracking-tight">WellTrack</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button asChild data-testid="button-login">
              <a href="/login">
                Sign In
                <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              AI-Powered Mental Wellness Support
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Your Mental Health{" "}
              <span className="text-primary">Matters</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
              WellTrack uses AI to help students monitor their emotional wellbeing, 
              identify patterns, and access the support they need - all in a safe, 
              private environment.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild data-testid="button-get-started">
                <a href="/login" className="gap-2">
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild data-testid="button-learn-more">
                <a href="#features" className="gap-2">
                  Learn More
                  <BookOpen className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-primary md:text-4xl">30%+</div>
              <div className="text-sm text-muted-foreground">Students face anxiety</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-primary md:text-4xl">24/7</div>
              <div className="text-sm text-muted-foreground">Always available</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-primary md:text-4xl">100%</div>
              <div className="text-sm text-muted-foreground">Confidential</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-primary md:text-4xl">AI</div>
              <div className="text-sm text-muted-foreground">Powered insights</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Everything You Need for Wellness
            </h2>
            <p className="text-muted-foreground">
              Comprehensive tools designed to support your mental health journey
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="group hover-elevate">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Daily Mood Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Log your mood and stress levels with simple, intuitive controls. 
                  Build healthy habits with streak tracking and reminders.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover-elevate">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Visual Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  See your emotional trends over time with beautiful charts. 
                  Understand patterns and triggers in your wellness journey.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover-elevate">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">AI Insights</h3>
                <p className="text-sm text-muted-foreground">
                  Get personalized insights powered by AI that helps identify 
                  patterns and provides supportive guidance.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover-elevate">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Private & Secure</h3>
                <p className="text-sm text-muted-foreground">
                  Your data is encrypted and protected. We prioritize your 
                  privacy and safety above everything else.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover-elevate">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Wellness Resources</h3>
                <p className="text-sm text-muted-foreground">
                  Access a library of mental health resources, tips, and 
                  techniques curated by wellness experts.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover-elevate">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Supportive Community</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with counselors and support staff who can help 
                  when you need it most.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">How It Works</h2>
            <p className="text-muted-foreground">
              Getting started with WellTrack is easy
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                1
              </div>
              <h3 className="mb-2 text-lg font-semibold">Sign Up</h3>
              <p className="text-sm text-muted-foreground">
                Create your free account securely in seconds
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                2
              </div>
              <h3 className="mb-2 text-lg font-semibold">Track Daily</h3>
              <p className="text-sm text-muted-foreground">
                Log your mood and stress levels each day
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                3
              </div>
              <h3 className="mb-2 text-lg font-semibold">Get Insights</h3>
              <p className="text-sm text-muted-foreground">
                Receive AI-powered insights and resources
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold md:text-4xl">
                Built for Student Success
              </h2>
              <p className="mb-8 text-muted-foreground">
                WellTrack is designed specifically for the unique challenges 
                students face. Our AI-powered system helps you stay on top of 
                your mental health while focusing on what matters most.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  <span>Identify stress patterns before they escalate</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  <span>Build healthy emotional awareness habits</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  <span>Access support resources when you need them</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  <span>Track your progress and celebrate improvements</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 p-1">
                <div className="rounded-xl bg-card p-8">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">Weekly Progress</div>
                      <div className="text-sm text-muted-foreground">Your mood is improving!</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Mood Score</span>
                      <span className="text-sm font-medium text-primary">+15%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-2 w-3/4 rounded-full bg-primary" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Stress Level</span>
                      <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">-20%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-2 w-1/3 rounded-full bg-emerald-500" />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm">Check-in Streak</span>
                      <span className="text-sm font-semibold">7 days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-primary-foreground md:text-4xl">
            Start Your Wellness Journey Today
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-primary-foreground/80">
            Join thousands of students taking control of their mental health. 
            It's free, private, and takes less than a minute to get started.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            asChild
            data-testid="button-cta-signup"
          >
            <a href="/api/login" className="gap-2">
              Create Free Account
              <ArrowRight className="h-5 w-5" />
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Brain className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">WellTrack</span>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              AI-Powered Monitoring and Support System for Student Mental Health and Wellness
            </p>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} WellTrack
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
