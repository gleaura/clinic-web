import { useMemo, useState } from 'react';
import { Layout, Menu, Button, Typography, Avatar, Dropdown, theme } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  SafetyOutlined,
  CrownOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content } = Layout;

interface MenuItemDef {
  key: string;
  icon: ReactNode;
  label: string;
  requiredPermission?: string;
  group: string;
}

const allMenuItems: MenuItemDef[] = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard', group: 'KLİNİK' },
  { key: '/patients', icon: <TeamOutlined />, label: 'Hastalar', requiredPermission: 'PATIENT_READ', group: 'KLİNİK' },
  { key: '/appointments', icon: <CalendarOutlined />, label: 'Randevular', requiredPermission: 'APPOINTMENT_READ', group: 'KLİNİK' },
  { key: '/treatments', icon: <MedicineBoxOutlined />, label: 'Tedaviler', requiredPermission: 'TREATMENT_READ', group: 'KLİNİK' },
  { key: '/staff', icon: <IdcardOutlined />, label: 'Personel', requiredPermission: 'STAFF_READ', group: 'KLİNİK' },
  { key: '/users', icon: <UserOutlined />, label: 'Kullanıcılar', requiredPermission: 'USER_READ', group: 'YÖNETİM' },
  { key: '/roles', icon: <CrownOutlined />, label: 'Roller', requiredPermission: 'ROLES_READ', group: 'YÖNETİM' },
  { key: '/permissions', icon: <SafetyOutlined />, label: 'Yetkiler', requiredPermission: 'PERMISSION_READ', group: 'YÖNETİM' },
  { key: '/settings', icon: <SettingOutlined />, label: 'Ayarlar', group: 'GENEL' },
];

export default function MainLayout() {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { token: { borderRadiusLG } } = theme.useToken();

  const filteredItems = useMemo(
    () => allMenuItems.filter((item) => !item.requiredPermission || hasPermission(item.requiredPermission)),
    [hasPermission],
  );

  const menuItems = useMemo(() => {
    const groups: Record<string, typeof filteredItems> = {};
    for (const item of filteredItems) {
      if (!groups[item.group]) groups[item.group] = [];
      groups[item.group].push(item);
    }
    return Object.entries(groups).map(([label, children]) => ({
      type: 'group' as const,
      label,
      children: children.map(({ requiredPermission: _, group: __, ...rest }) => rest),
    }));
  }, [filteredItems]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Profil' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Ayarlar', onClick: () => navigate('/settings') },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Çıkış Yap',
      danger: true,
      onClick: async () => { await logout(); navigate('/login', { replace: true }); },
    },
  ];

  const currentPage = allMenuItems.find((i) => i.key === location.pathname)?.label ?? 'Sayfa';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        style={{
          background: '#fff',
          borderRight: '1px solid #f5d8e5',
          overflow: 'auto',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 10,
        }}
      >
        {/* Logo alanı */}
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: collapsed ? '0 22px' : '0 20px',
          borderBottom: '1px solid #f5d8e5',
        }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #c4789a, #e8a8c0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            fontWeight: 800,
            color: '#fff',
            flexShrink: 0,
          }}>
            G
          </div>
          {!collapsed && (
            <div>
              <div style={{ color: '#3d1020', fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>
                Gleaura
              </div>
              <div style={{ color: '#c490aa', fontSize: 11, fontWeight: 500 }}>Clinic</div>
            </div>
          )}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="gleaura-menu"
          style={{
            background: 'transparent',
            borderRight: 'none',
            padding: '8px 0',
          }}
        />
      </Sider>

      <Layout style={{
        marginLeft: collapsed ? 80 : 240,
        transition: 'margin-left 0.2s',
        background: '#fdf5f8',
        minHeight: '100vh',
      }}>
        {/* Header */}
        <Header style={{
          padding: '0 28px',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f5d8e5',
          position: 'sticky',
          top: 0,
          zIndex: 9,
          height: 64,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16, width: 36, height: 36, color: '#8a5070' }}
            />
            <div>
              <Typography.Text style={{ fontSize: 16, fontWeight: 700, color: '#3d1020', display: 'block', lineHeight: 1.2 }}>
                {currentPage}
              </Typography.Text>
              <Typography.Text style={{ fontSize: 12, color: '#c490aa' }}>
                Gleaura Clinic
              </Typography.Text>
            </div>
          </div>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              padding: '6px 14px 6px 6px',
              borderRadius: 40,
              border: '1px solid #f5d8e5',
              background: '#fffafc',
              transition: 'all 0.2s',
            }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#c9834a')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#f5d8e5')}
            >
              <Avatar
                size={32}
                style={{
                  background: 'linear-gradient(135deg, #c4789a, #e8a8c0)',
                  fontWeight: 700,
                  fontSize: 13,
                  color: '#fff',
                }}
              >
                {user.username.substring(0, 2).toUpperCase()}
              </Avatar>
              {!collapsed && (
                <Typography.Text strong style={{ fontSize: 13, color: '#3d1020' }}>
                  {user.username}
                </Typography.Text>
              )}
            </div>
          </Dropdown>
        </Header>

        <Content style={{
          margin: 24,
          padding: 28,
          background: '#fff',
          borderRadius: borderRadiusLG,
          minHeight: 280,
          border: '1px solid #f5d8e5',
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
