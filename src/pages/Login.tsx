import { useState } from 'react';
import { Button, Form, Input, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      message.error(errorMsg || 'Kullanıcı adı veya şifre hatalı!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sol: Marka paneli */}
      <div style={{
        width: '44%',
        background: 'linear-gradient(160deg, #6a1040 0%, #c4789a 55%, #e8a8c0 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 52px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Dekoratif daireler */}
        <div style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)', top: -180, right: -200,
        }} />
        <div style={{
          position: 'absolute', width: 320, height: 320, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)', bottom: -100, left: -120,
        }} />
        <div style={{
          position: 'absolute', width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)', bottom: 180, right: -60,
        }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            fontWeight: 800,
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.3)',
          }}>
            G
          </div>
        </div>

        {/* Orta: Slogan */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Typography.Title level={1} style={{
            color: '#fff',
            fontWeight: 800,
            fontSize: 38,
            lineHeight: 1.2,
            margin: 0,
            marginBottom: 16,
          }}>
            Gleaura<br />Clinic
          </Typography.Title>
          <Typography.Text style={{
            color: 'rgba(255,255,255,0.80)',
            fontSize: 16,
            lineHeight: 1.7,
            display: 'block',
          }}>
            Medikal estetik kliniğiniz için<br />
            modern yönetim platformu.
          </Typography.Text>

          {/* Özellik listesi */}
          <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['Hasta & randevu takibi', 'Tedavi yönetimi', 'Rol tabanlı erişim kontrolü'].map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: '#fff', flexShrink: 0,
                }}>✓</div>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alt */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Typography.Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
            © 2025 Gleaura. Tüm hakları saklıdır.
          </Typography.Text>
        </div>
      </div>

      {/* Sağ: Form paneli */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#fdf5f8',
        padding: '48px 40px',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ marginBottom: 36 }}>
            <Typography.Title level={2} style={{ margin: 0, fontWeight: 800, color: '#3d1020' }}>
              Tekrar hoş geldiniz
            </Typography.Title>
            <Typography.Text style={{ color: '#c490aa', fontSize: 15 }}>
              Devam etmek için giriş yapın
            </Typography.Text>
          </div>

          <Form onFinish={onFinish} autoComplete="off" size="large" layout="vertical">
            <Form.Item
              name="username"
              label={<span style={{ color: '#5a2a3a', fontWeight: 600 }}>Kullanıcı Adı</span>}
              rules={[{ required: true, message: 'Kullanıcı adı gerekli' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#c4789a' }} />}
                placeholder="Kullanıcı adınızı girin"
                style={{ height: 48, borderRadius: 10 }}
              />
            </Form.Item>
            <Form.Item
              name="password"
              label={<span style={{ color: '#5a2a3a', fontWeight: 600 }}>Şifre</span>}
              rules={[{ required: true, message: 'Şifre gerekli' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#c4789a' }} />}
                placeholder="Şifrenizi girin"
                style={{ height: 48, borderRadius: 10 }}
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
                style={{
                  height: 50,
                  fontWeight: 700,
                  fontSize: 16,
                  borderRadius: 12,
                  letterSpacing: 0.3,
                }}
              >
                Giriş Yap
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}
