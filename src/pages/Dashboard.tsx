import { Card, Col, Row, Typography } from 'antd';
import { TeamOutlined, CalendarOutlined, MedicineBoxOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  const statCards = [
    {
      title: 'Hastalar',
      icon: <TeamOutlined />,
      gradient: 'linear-gradient(135deg, #a85980, #d4a0b8)',
      description: 'Kayıtlı hastalar',
    },
    {
      title: 'Randevular',
      icon: <CalendarOutlined />,
      gradient: 'linear-gradient(135deg, #5c8a6e, #7fb89a)',
      description: 'Planlanan randevular',
    },
    {
      title: 'Tedaviler',
      icon: <MedicineBoxOutlined />,
      gradient: 'linear-gradient(135deg, #c9943a, #e8b86d)',
      description: 'Uygulanan tedaviler',
    },
    {
      title: 'Kullanıcılar',
      icon: <UserOutlined />,
      gradient: 'linear-gradient(135deg, #7a9eba, #a8c4d8)',
      description: 'Sistem kullanıcıları',
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <Typography.Title level={3} style={{ margin: 0, fontWeight: 700 }}>
          Hoş geldiniz, {user?.username}
        </Typography.Title>
        <Typography.Text type="secondary" style={{ fontSize: 15 }}>
          Gleaura Clinic yönetim paneline genel bakış
        </Typography.Text>
      </div>

      <Row gutter={[20, 20]}>
        {statCards.map((card) => (
          <Col xs={24} sm={12} lg={6} key={card.title}>
            <Card
              style={{ borderRadius: 14, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
              styles={{ body: { padding: 24 } }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ color: '#6b7280', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                    {card.title}
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: 12 }}>
                    {card.description}
                  </div>
                </div>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: card.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  color: '#fff',
                  flexShrink: 0,
                }}>
                  {card.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
