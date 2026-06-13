import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/shared/auth/protected-route'
import { AppLayout } from '@/shared/layouts/app-layout'

import LoginPage from '@/modules/auth/pages/login-page'
import ForgotPasswordPage from '@/modules/auth/pages/forgot-password-page'
import ResetPasswordPage from '@/modules/auth/pages/reset-password-page'
import SuperAdminDashboard from '@/modules/dashboard/pages/super-admin-dashboard'
import UsersList from '@/modules/users/pages/users-list'
import CreateUserPage from '@/modules/users/pages/create-user'
import EditUserPage from '@/modules/users/pages/edit-user'
import UserDetailsPage from '@/modules/users/pages/user-details'
import RolesList from '@/modules/roles/pages/roles-list'
import CreateRolePage from '@/modules/roles/pages/create-role'
import EditRolePage from '@/modules/roles/pages/edit-role'
import RoleDetailsPage from '@/modules/roles/pages/role-details'
import InstitutionsList from '@/modules/institutions/pages/institutions-list'
import CreateInstitutionPage from '@/modules/institutions/pages/create-institution'
import EditInstitutionPage from '@/modules/institutions/pages/edit-institution'
import SettingsPage from '@/modules/settings/pages/settings-page'
import NotFoundPage from '@/modules/settings/pages/not-found-page'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<SuperAdminDashboard />} />

          <Route path="/users" element={<UsersList />} />
          <Route path="/users/create" element={<CreateUserPage />} />
          <Route path="/users/:id/edit" element={<EditUserPage />} />
          <Route path="/users/:id" element={<UserDetailsPage />} />

          <Route path="/roles" element={<RolesList />} />
          <Route path="/roles/create" element={<CreateRolePage />} />
          <Route path="/roles/:id/edit" element={<EditRolePage />} />
          <Route path="/roles/:id" element={<RoleDetailsPage />} />

          <Route path="/institutions" element={<InstitutionsList />} />
          <Route path="/institutions/create" element={<CreateInstitutionPage />} />
          <Route path="/institutions/:id/edit" element={<EditInstitutionPage />} />

          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/not-found" replace />} />
      <Route path="/not-found" element={<NotFoundPage />} />
    </Routes>
  )
}
