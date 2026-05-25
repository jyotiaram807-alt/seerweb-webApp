import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  collapsed: boolean;
}

const Navbar = ({ collapsed }: NavbarProps) => {
  const { user, logout } = useAuth();
  const { cart } = useCart();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path: string) =>
    location.pathname === path;

  const linkClasses = (path: string) =>
    `flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
      isActive(path)
        ? "bg-blue-50 text-blue-600"
        : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
    }`;

  return (
    <nav
      className={`fixed top-0 right-0 h-16 bg-blue-500 border-b border-gray-200
      flex items-center justify-between px-6 z-30
      transition-all duration-300
      ${
        collapsed
          ? "lg:left-20"
          : "lg:left-64"
      } left-0`}
    >
      {/* LEFT SIDE */}
      <div>
        <h1 className="text-lg font-semibold text-white">
          Welcome back, {user?.name}
        </h1>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">
        {/* CART */}
        {user?.role !== "admin" && (
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-blue-600"
            onClick={() => navigate("/dealer/cart")}
          >
            <ShoppingCart className="h-5 w-5 text-white" />

            {cart.items.length > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex items-center justify-center rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
                {cart.items.length}
              </span>
            )}
          </Button>
        )}

        {/* PROFILE */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-blue-600"
              >
                <Avatar>
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56"
            >
              <Link
                to="/profile"
                className={linkClasses("/profile")}
              >
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">
                    {user.name}
                  </p>

                  <p className="text-xs capitalize text-muted-foreground">
                    {user.role}
                  </p>
                </div>
              </Link>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
};

export default Navbar;