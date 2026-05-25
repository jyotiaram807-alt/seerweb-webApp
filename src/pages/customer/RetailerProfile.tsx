import { User, Mail, Building } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

import MainLayout from "@/components/MainLayoutProps";

const RetailerProfile = () => {
  const { user } = useAuth();

  return (
    <MainLayout>
      <div className="px-4">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Profile</h1>
            <p className="text-muted-foreground mt-1">
              Your retailer account information.
            </p>
          </div>

          <div className="max-w-3xl space-y-6">
            {/* Profile Card */}
            <div className="flex items-center gap-5 rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                {user?.name?.charAt(0)?.toUpperCase() || "R"}
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {user?.name || "Retailer"}
                </h2>
                <p className="text-muted-foreground text-sm">
                  @{user?.username || "username"} · {user?.role || "retailer"}
                </p>
              </div>
            </div>

            {/* Account Details */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Account Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input
                    value={user?.name || ""}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    value={user?.email || ""}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    Username
                  </Label>
                  <Input
                    value={user?.username || ""}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Building className="h-4 w-4" />
                    Dealer ID
                  </Label>
                  <Input
                    value={user?.dealer_id ?? "—"}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>
            </div>
          </div>
          </div>
  </MainLayout>
  );
};

export default RetailerProfile;