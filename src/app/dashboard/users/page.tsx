"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Search, Users, Shield, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
// Define types locally since userManagementDb is disabled
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'viewer';
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
  role: 'super_admin' | 'admin' | 'viewer';
}

export interface UpdateUserInput {
  name?: string;
  role?: 'super_admin' | 'admin' | 'viewer';
  password?: string;
}

// Local user management functions
async function getUsers(): Promise<User[]> {
  try {
    const response = await fetch('/api/users');
    const data = await response.json();
    if (data.success) {
      return data.users;
    }
    return [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

async function createUser(input: CreateUserInput): Promise<User | null> {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    const data = await response.json();

    if (data.success) {
      return data.user;
    } else {
      throw new Error(data.error || 'Failed to create user');
    }
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

async function updateUser(userId: string, input: UpdateUserInput): Promise<User | null> {
  try {
    // For now, we'll simulate update by refreshing the user list
    // In a real implementation, you would have an update API endpoint
    console.log('Update user:', userId, input);
    return null; // Return null for now
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}

async function deleteUser(userId: string): Promise<boolean> {
  try {
    console.log('Delete user:', userId);
    // For now, we'll just return true
    // In a real implementation, you would have a delete API endpoint
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
}

async function isEmailAvailable(email: string, excludeUserId?: string): Promise<boolean> {
  try {
    // Check for email availability
    const response = await fetch('/api/users');
    const data = await response.json();

    if (data.success) {
      const existingUser = data.users.find((user: User) =>
        user.email === email && user.id !== excludeUserId
      );
      return !existingUser;
    }
    return false;
  } catch (error) {
    console.error('Error checking email availability:', error);
    return false;
  }
}
import { hasRole, canAccess } from "@/lib/auth";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin" as 'super_admin' | 'admin' | 'viewer',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check permissions - initialize with safe defaults
  const [canManageUsers, setCanManageUsers] = useState(false);
  const [hasUsersAccess, setHasUsersAccess] = useState(false);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  useEffect(() => {
    // Check permissions on client side only
    const manageUsersPermission = hasRole('super_admin');
    const usersAccessPermission = canAccess('users');

    setCanManageUsers(manageUsersPermission);
    setHasUsersAccess(usersAccessPermission);
    setPermissionsLoaded(true);

    if (!usersAccessPermission) {
      window.location.href = '/dashboard';
      return;
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Gagal memuat data pengguna. Pastikan database telah terhubung dengan benar.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Validate email availability
      const emailAvailable = await isEmailAvailable(
        formData.email,
        editingUser?.id
      );

      if (!emailAvailable) {
        setError("Email sudah digunakan");
        setSubmitting(false);
        return;
      }

      if (editingUser) {
        // Update existing user
        const updateData: UpdateUserInput = {
          name: formData.name,
          role: formData.role,
        };

        if (formData.password) {
          updateData.password = formData.password;
        }

        const success = await updateUser(editingUser.id, updateData);
        if (!success) {
          setError("Gagal mengupdate pengguna");
        }
      } else {
        // Create new user
        if (!formData.password) {
          setError("Password wajib diisi");
          setSubmitting(false);
          return;
        }

        const createData: CreateUserInput = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        };

        const success = await createUser(createData);
        if (!success) {
          setError("Gagal membuat pengguna");
        }
      }

      setIsDialogOpen(false);
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "admin",
      });
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      setError("Terjadi kesalahan saat menyimpan pengguna. Pastikan database telah terhubung dengan benar.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) {
      return;
    }

    try {
      await deleteUser(userId);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Gagal menghapus pengguna");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || !permissionsLoaded) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h2>
        <p className="text-muted-foreground">
          Kelola pengguna dan hak akses sistem
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Cari pengguna..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {permissionsLoaded && canManageUsers && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Pengguna
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingUser
                      ? "Edit informasi pengguna yang ada."
                      : "Tambah pengguna baru ke sistem."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Nama
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="col-span-3"
                      placeholder="Masukkan nama"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="col-span-3"
                      placeholder="Masukkan email"
                      required
                      disabled={!!editingUser}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="col-span-3"
                      placeholder={editingUser ? "Kosongkan jika tidak ingin mengubah" : "Masukkan password"}
                      required={!editingUser}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">
                      Role
                    </Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: 'super_admin' | 'admin' | 'viewer') => setFormData({ ...formData, role: value })}
                      disabled={!permissionsLoaded || !canManageUsers}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Pilih role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    {editingUser ? "Update" : "Simpan"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {filteredUsers.length} pengguna ditemukan
        </p>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="truncate">{user.name}</span>
                <Badge className={getRoleBadgeColor(user.role)}>
                  {user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'Viewer'}
                </Badge>
              </CardTitle>
              <CardDescription>
                {user.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Dibuat {new Date(user.created_at).toLocaleDateString('id-ID')}</span>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>Role aktif</span>
                  </div>
                </div>
                {permissionsLoaded && canManageUsers && (
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {user.role !== 'super_admin' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Tidak ada pengguna ditemukan</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Coba kata kunci lain" : "Mulai dengan menambahkan pengguna pertama Anda"}
          </p>
          {!searchTerm && permissionsLoaded && canManageUsers && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Pengguna Pertama
                </Button>
              </DialogTrigger>
            </Dialog>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}