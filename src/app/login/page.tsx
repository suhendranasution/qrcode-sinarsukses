"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import { loginAdmin } from "@/lib/auth";
import { validateUserCredentials } from "@/lib/userAuth";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // First try server-side authentication (for hardcoded users)
      const result = await loginAdmin(formData.email, formData.password);

      if (result.success) {
        router.push("/dashboard");
        return;
      }

      // Try database validation first (for persistent users)
      try {
        const response = await fetch('/api/auth/validate-db', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Set session cookies manually for database-validated users
          const sessionToken = crypto.randomUUID();
          document.cookie = `admin-token=${sessionToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
          document.cookie = `user-role=${data.user.role}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
          document.cookie = `user-id=${data.user.id}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
          document.cookie = `admin-user=${JSON.stringify(data.user)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

          router.push("/dashboard");
          return;
        }
      } catch (error) {
        console.error('Database validation error:', error);
      }

      // Fallback to localStorage validation for backward compatibility
      const dynamicUser = validateUserCredentials(formData.email, formData.password);

      if (dynamicUser) {
        // Set session cookies manually for dynamic users
        const sessionToken = crypto.randomUUID();
        document.cookie = `admin-token=${sessionToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        document.cookie = `user-role=${dynamicUser.role}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        document.cookie = `user-id=${dynamicUser.id}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        document.cookie = `admin-user=${JSON.stringify(dynamicUser)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

        router.push("/dashboard");
        return;
      }

      // If both attempts fail
      setError("Email atau password salah");
    } catch (err) {
      setError("Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex flex-col items-center gap-4">
            <Image
              src="/codeguide-logo.png"
              alt="Certificate Management System"
              width={60}
              height={60}
              className="rounded-xl"
            />
            <div>
              <CardTitle className="text-2xl font-bold">Sistem Sertifikat</CardTitle>
              <CardDescription>
                Login untuk mengakses dashboard admin
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@example.com"}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Login...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Demo Credentials</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Email: {process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@example.com"}</div>
              <div>Password: {process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123"}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}