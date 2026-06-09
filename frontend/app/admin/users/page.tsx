"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/lib/useApi";
import { 
  Card, 
  CardContent, 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Loader2, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface User {
  id: number;
  username: string;
  role: string;
  userDetails?: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const api = useApi();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await api("/api/users");
        setUsers(data);
      } catch (e) {
        console.error("Failed to load users", e);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [api]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">Manage registered customer accounts.</p>
      </div>

      <Card className="border-muted-foreground/10">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="text-muted-foreground">#{user.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.username}</span>
                        <span className="text-xs text-muted-foreground">
                          {user.userDetails?.firstName} {user.userDetails?.lastName}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                      {user.userDetails?.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.userDetails.email}
                        </div>
                      )}
                      {user.userDetails?.phoneNumber && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {user.userDetails.phoneNumber}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === "ROLE_ADMIN" ? "default" : "secondary"}>
                      {user.role.replace("ROLE_", "")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                      Edit
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
