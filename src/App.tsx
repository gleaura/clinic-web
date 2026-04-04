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
          colorPrimary: '#a85980',
          colorSuccess: '#5c8a6e',
          colorWarning: '#c9943a',
          colorError: '#c05060',
          colorInfo: '#7a9eba',
          borderRadius: 12,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          colorBgLayout: '#fdf8f9',
          controlHeight: 38,
        },
        components: {
          Button: {
            borderRadius: 10,
            controlHeight: 38,
            primaryShadow: '0 2px 10px rgba(168, 89, 128, 0.3)',
          },
          Card: {
            borderRadiusLG: 14,
            boxShadowTertiary: '0 1px 4px rgba(168,89,128,0.06), 0 1px 2px rgba(0,0,0,0.04)',
          },
          Table: {
            headerBg: '#fdf4f7',
            headerColor: '#8b5a70',
            rowHoverBg: '#fdf8f9',
            borderColor: '#f5e6ed',
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
            borderRadiusLG: 16,
            titleFontSize: 18,
          },
          Menu: {
            darkItemBg: 'transparent',
            darkItemSelectedBg: 'rgba(255,255,255,0.18)',
            darkItemHoverBg: 'rgba(255,255,255,0.10)',
            darkItemSelectedColor: '#fff',
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
