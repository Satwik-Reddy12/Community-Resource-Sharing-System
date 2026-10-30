import { BrowserRouter, Routes, Route } from "react-router-dom";
import AddResource from "./pages/AddResource";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BrowseResources from "./pages/BrowseResources";
import BorrowRequests from "./pages/BorrowRequests";
import MyBorrowings from "./pages/MyBorrowings";
import MyResources from "./pages/MyResources";
import Notifications from "./pages/Notifications";
import History from "./pages/History";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import ForgotPassword from "./pages/ForgotPassword";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-resource"
          element={
            <ProtectedRoute>
              <AddResource />
            </ProtectedRoute>
          }
        />
        <Route
          path="/browse-resources"
          element={
            <ProtectedRoute>
              <BrowseResources />
            </ProtectedRoute>
          }
        />
        <Route
          path="/borrow-requests"
          element={
            <ProtectedRoute>
              <BorrowRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-borrowings"
          element={
            <ProtectedRoute>
              <MyBorrowings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-resources"
          element={
            <ProtectedRoute>
              <MyResources />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;