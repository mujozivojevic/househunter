interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Login removed - always allow access
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  return <>{children}</>;
}

