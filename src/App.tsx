import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Loader2 } from "lucide-react";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// User Pages
import UserDashboard from "./pages/user/UserDashboard";
import RegisterComplaint from "./pages/user/RegisterComplaint";
import ViewComplaints from "./pages/user/ViewComplaints";
import ComplaintDetails from "./pages/user/ComplaintDetails";
import Notices from "./pages/user/Notices";
import Feedback from "./pages/user/Feedback";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageComplaints from "./pages/admin/ManageComplaints";
import AdminComplaintDetails from "./pages/admin/ComplaintDetails";
import ManageNotices from "./pages/admin/ManageNotices";
import NoticeDetails from "./pages/admin/NoticeDetails";
import PostNotice from "./pages/admin/PostNotice";
import ViewFeedback from "./pages/admin/ViewFeedback";
import ManageUsers from "./pages/admin/ManageUsers";

const queryClient = new QueryClient();

// Protected Route wrapper using AuthContext
function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole: 'user' | 'admin' }) {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // Wrong role
  if (allowedRole === 'admin' && !isAdmin) {
    return <Navigate to="/user" replace />;
  }
  
  if (allowedRole === 'user' && isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/login" element={<Navigate to="/auth" replace />} />
      
      {/* User Routes */}
      <Route path="/user" element={<ProtectedRoute allowedRole="user"><UserDashboard /></ProtectedRoute>} />
      <Route path="/user/register-complaint" element={<ProtectedRoute allowedRole="user"><RegisterComplaint /></ProtectedRoute>} />
      <Route path="/user/view-complaints" element={<ProtectedRoute allowedRole="user"><ViewComplaints /></ProtectedRoute>} />
      <Route path="/user/complaint/:id" element={<ProtectedRoute allowedRole="user"><ComplaintDetails /></ProtectedRoute>} />
      <Route path="/user/notices" element={<ProtectedRoute allowedRole="user"><Notices /></ProtectedRoute>} />
      <Route path="/user/feedback" element={<ProtectedRoute allowedRole="user"><Feedback /></ProtectedRoute>} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/manage-complaints" element={<ProtectedRoute allowedRole="admin"><ManageComplaints /></ProtectedRoute>} />
      <Route path="/admin/complaint/:id" element={<ProtectedRoute allowedRole="admin"><AdminComplaintDetails /></ProtectedRoute>} />
      <Route path="/admin/manage-notices" element={<ProtectedRoute allowedRole="admin"><ManageNotices /></ProtectedRoute>} />
      <Route path="/admin/notice/:id" element={<ProtectedRoute allowedRole="admin"><NoticeDetails /></ProtectedRoute>} />
      <Route path="/admin/post-notice" element={<ProtectedRoute allowedRole="admin"><PostNotice /></ProtectedRoute>} />
      <Route path="/admin/view-feedback" element={<ProtectedRoute allowedRole="admin"><ViewFeedback /></ProtectedRoute>} />
      <Route path="/admin/manage-users" element={<ProtectedRoute allowedRole="admin"><ManageUsers /></ProtectedRoute>} />
      
      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AppProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
