import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md">
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary: "bg-primary hover:bg-primary/90",
              card: "bg-background border border-border shadow-lg",
              headerTitle: "text-foreground text-2xl font-bold",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton:
                "bg-background border border-border hover:bg-accent",
              formFieldInput:
                "bg-background border border-border focus:ring-2 focus:ring-primary",
              footerActionLink: "text-primary hover:text-primary/90"
            }
          }}
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}
