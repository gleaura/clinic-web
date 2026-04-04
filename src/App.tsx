import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import trTR from 'antd/locale/tr_TR';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Treatments from './pages/Treatments';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Permissions from './pages/Permissions';
import Settings from './pages/Settings';

export default function App() {
  return (
    <ConfigProvider
      locale={trTR}
      theme={{
        token: {
          colorPrimary: '#c4789a',
          colorSuccess: '#6aa884',
          colorWarning: '#c49a6a',
          colorError: '#c46a78',
          colorInfo: '#7a9ec4',
          borderRadius: 12,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          colorBgLayout: '#fdf5f8',
          controlHeight: 38,
        },
        components: {
          Button: {
            borderRadius: 10,
            controlHeight: 38,
            primaryShadow: '0 2px 10px rgba(196, 120, 154, 0.28)',
          },
          Card: {
            borderRadiusLG: 16,
            boxShadowTertiary: '0 2px 8px rgba(180,80,120,0.06), 0 1px 2px rgba(0,0,0,0.04)',
          },
          Table: {
            headerBg: '#fdf0f5',
            headerColor: '#7a4a5a',
            rowHoverBg: '#fffafc',
            borderColor: '#f5d8e5',
            headerBorderRadius: 10,
          },
          Input: {
            borderRadius: 8,
            controlHeight: 38,
          },
          Select: {
            borderRadius: 8,
            controlHeight: 38,
          },
          Modal: {
            borderRadiusLG: 18,
            titleFontSize: 18,
          },
          Menu: {
            itemBg: 'transparent',
            itemSelectedBg: 'rgba(196,120,154,0.12)',
            itemHoverBg: 'rgba(196,120,154,0.06)',
            itemSelectedColor: '#c4789a',
            itemColor: '#5a2a3a',
            itemBorderRadius: 10,
            itemMarginInline: 8,
            iconSize: 18,
          },
          Tag: {
            borderRadiusSM: 6,
          },
          DatePicker: {
            borderRadius: 8,
            controlHeight: 38,
          },
          InputNumber: {
            borderRadius: 8,
            controlHeight: 38,
          },
        },
      }}
    >
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/treatments" element={<Treatments />} />
              <Route path="/users" element={<Users />} />
              <Route path="/roles" element={<Roles />} />
              <Route path="/permissions" element={<Permissions />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}
