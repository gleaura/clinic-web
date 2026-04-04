import { Card, Col, Row, Typography, Divider } from 'antd';
import { TeamOutlined, CalendarOutlined, MedicineBoxOutlined, UserOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  const statCards = [
    {
      title: 'Hastalar',
      icon: <TeamOutlined />,
      iconBg: '#fde8f0',
      iconColor: '#c4789a',
      accentColor: '#c4789a',
      description: 'Toplam kayıtlı hasta',
    },
    {
      title: 'Randevular',
      icon: <CalendarOutlined />,
      iconBg: '#f5eafe',
      iconColor: '#9c6ac4',
      accentColor: '#9c6ac4',
      description: 'Planlanan randevular',
    },
    {
      title: 'Tedaviler',
      icon: <MedicineBoxOutlined />,
      iconBg: '#fde8f8',
      iconColor: '#c46ab4',
      accentColor: '#c46ab4',
      description: 'Uygulanan tedaviler',
    },
    {
      title: 'Kullanıcılar',
      icon: <UserOutlined />,
      iconBg: '#e8f0fd',
      iconColor: '#6a8ac4',
      accentColor: '#6a8ac4',
      description: 'Sistem kullanıcıları',
    },
  ];

  const quickLinks = [
    { label: 'Yeni Hasta Ekle', color: '#c4789a', bg: '#fde8f0' },
    { label: 'Randevu Oluştur', color: '#9c6ac4', bg: '#f5eafe' },
    { label: 'Tedavi Başlat', color: '#c46ab4', bg: '#fde8f8' },
  ];

  return (
    <div>
      {/* Başlık */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 28,
        paddingBottom: 24,
        borderBottom: '1px solid #f5d8e5',
      }}>
        <div>
          <Typography.Title level={3} style={{ margin: 0, fontWeight: 800, color: '#3d1020' }}>
            Merhaba, {user?.username} 👋
          </Typography.Title>
          <Typography.Text style={{ fontSize: 14, color: '#c490aa' }}>
            Bugün klinikten genel bir bakış
          </Typography.Text>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {quickLinks.map((l) => (
            <div key={l.label} style={{
              padding: '8px 14px',
              borderRadius: 10,
              background: l.bg,
              color: l.color,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}>
              {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* Stat kartları */}
      <Row gutter={[20, 20]}>
        {statCards.map((card) => (
          <Col xs={24} sm={12} lg={6} key={card.title}>
            <Card
              style={{
                borderRadius: 16,
                border: '1px solid #f5d8e5',
                overflow: 'hidden',
                boxShadow: 'none',
              }}
              styles={{ body: { padding: 0 } }}
            >
              {/* Renkli üst şerit */}
              <div style={{ height: 4, background: card.accentColor }} />
              <div style={{ padding: '20px 20px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: card.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    color: card.iconColor,
                  }}>
                    {card.icon}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    color: '#4a9e6b',
                    fontSize: 12,
                    fontWeight: 600,
                    background: '#d4eedc',
                    padding: '3px 8px',
                    borderRadius: 20,
                  }}>
                    <ArrowUpOutlined style={{ fontSize: 10 }} /> Aktif
                  </div>
                </div>
                <Divider style={{ margin: '0 0 14px', borderColor: '#f5d8e5' }} />
                <div style={{ color: '#5a2a3a', fontSize: 14, fontWeight: 700 }}>{card.title}</div>
                <div style={{ color: '#c490aa', fontSize: 12, marginTop: 2 }}>{card.description}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
