import { useEffect, useState } from 'react';
import { Card, Col, Row, Typography, Divider, Tooltip } from 'antd';
import { TeamOutlined, CalendarOutlined, MedicineBoxOutlined, UserOutlined, ArrowUpOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { getDailyAppointments, type Appointment } from '../services/appointmentService';
import { DATETIME_API_FMT } from '../utils/dateUtils';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const TIMELINE_START = 8;
const TIMELINE_END = 20;
const TOTAL_HOURS = TIMELINE_END - TIMELINE_START;

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: '#7a9ec4',
  COMPLETED: '#6aa884',
  CANCELLED: '#c46a78',
  NO_SHOW: '#c49a6a',
};

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Planlandı',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal',
  NO_SHOW: 'Gelmedi',
};

interface StaffGroup {
  staffName: string;
  appointments: Appointment[];
}

function groupByStaff(appointments: Appointment[]): StaffGroup[] {
  const map = new Map<string, Appointment[]>();
  for (const a of appointments) {
    const key = a.staffFullName || 'Atanmamış';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(a);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => (a === 'Atanmamış' ? 1 : b === 'Atanmamış' ? -1 : a.localeCompare(b)))
    .map(([staffName, appts]) => ({ staffName, appointments: appts }));
}

function getBarStyle(appointment: Appointment) {
  const d = dayjs(appointment.appointmentDate, DATETIME_API_FMT, true);
  if (!d.isValid()) return null;

  const hour = d.hour() + d.minute() / 60;
  const duration = appointment.durationMinutes || 30;

  const leftPercent = ((hour - TIMELINE_START) / TOTAL_HOURS) * 100;
  const widthPercent = (duration / 60 / TOTAL_HOURS) * 100;

  const left = Math.max(0, Math.min(leftPercent, 100));
  const width = Math.max(1, Math.min(widthPercent, 100 - left));

  return { left: `${left}%`, width: `${width}%` };
}

export default function Dashboard() {
  const { user } = useAuth();
  const [dailyAppointments, setDailyAppointments] = useState<Appointment[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());

  useEffect(() => {
    setLoadingTimeline(true);
    getDailyAppointments(selectedDate.format('YYYY-MM-DD'))
      .then(setDailyAppointments)
      .catch(() => {})
      .finally(() => setLoadingTimeline(false));
  }, [selectedDate]);

  const goToPrevDay = () => setSelectedDate((d) => d.subtract(1, 'day'));
  const goToNextDay = () => setSelectedDate((d) => d.add(1, 'day'));
  const goToToday = () => setSelectedDate(dayjs());
  const isToday = selectedDate.isSame(dayjs(), 'day');

  const staffGroups = groupByStaff(dailyAppointments);
  const hours = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => TIMELINE_START + i);

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

      {/* Günlük Randevu Timeline */}
      <Card
        style={{
          marginTop: 24,
          borderRadius: 16,
          border: '1px solid #f5d8e5',
          boxShadow: 'none',
        }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ height: 4, background: 'linear-gradient(90deg, #c4789a, #9c6ac4)' }} />
        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: '#f5eafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                color: '#9c6ac4',
              }}>
                <CalendarOutlined />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#3d1020' }}>
                  {isToday ? 'Bugünkü Randevular' : 'Randevular'}
                </div>
                <div style={{ fontSize: 12, color: '#c490aa' }}>
                  {selectedDate.format('DD.MM.YYYY')} — {dailyAppointments.length} randevu
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button
                  onClick={goToPrevDay}
                  style={{
                    width: 28, height: 28, borderRadius: 6, border: '1px solid #f5d8e5',
                    background: '#fdf5f8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#c4789a', fontSize: 12,
                  }}
                >
                  <LeftOutlined />
                </button>
                {!isToday && (
                  <button
                    onClick={goToToday}
                    style={{
                      height: 28, borderRadius: 6, border: '1px solid #f5d8e5',
                      background: '#fdf5f8', cursor: 'pointer', padding: '0 10px',
                      color: '#c4789a', fontSize: 11, fontWeight: 600,
                    }}
                  >
                    Bugün
                  </button>
                )}
                <button
                  onClick={goToNextDay}
                  style={{
                    width: 28, height: 28, borderRadius: 6, border: '1px solid #f5d8e5',
                    background: '#fdf5f8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#c4789a', fontSize: 12,
                  }}
                >
                  <RightOutlined />
                </button>
              </div>
              <div style={{ width: 1, height: 20, background: '#f5d8e5' }} />
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#8a6a7a' }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: STATUS_COLORS[key] }} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {loadingTimeline ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#c490aa' }}>Yükleniyor...</div>
          ) : staffGroups.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#c490aa', fontSize: 14 }}>
              Bugün randevu bulunmuyor
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              {/* Saat başlıkları */}
              <div style={{ display: 'flex', marginLeft: 160, marginBottom: 4 }}>
                {hours.map((h) => (
                  <div
                    key={h}
                    style={{
                      flex: h < TIMELINE_END ? 1 : 0,
                      fontSize: 11,
                      color: '#b08a9a',
                      fontWeight: 500,
                      minWidth: 0,
                    }}
                  >
                    {String(h).padStart(2, '0')}:00
                  </div>
                ))}
              </div>

              {/* Satırlar */}
              {staffGroups.map((group) => (
                <div
                  key={group.staffName}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    borderTop: '1px solid #f5e0ea',
                    minHeight: 48,
                  }}
                >
                  <div style={{
                    width: 160,
                    minWidth: 160,
                    paddingRight: 16,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#5a2a3a',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {group.staffName}
                  </div>

                  <div style={{
                    flex: 1,
                    position: 'relative',
                    height: 40,
                    background: '#fdf5f8',
                    borderRadius: 6,
                  }}>
                    {hours.map((h) => (
                      <div
                        key={h}
                        style={{
                          position: 'absolute',
                          left: `${((h - TIMELINE_START) / TOTAL_HOURS) * 100}%`,
                          top: 0,
                          bottom: 0,
                          width: 1,
                          background: '#f0d0e0',
                        }}
                      />
                    ))}

                    {group.appointments.map((appt) => {
                      const barStyle = getBarStyle(appt);
                      if (!barStyle) return null;
                      const d = dayjs(appt.appointmentDate, DATETIME_API_FMT, true);
                      const timeStr = d.isValid() ? d.format('HH:mm') : '';
                      const color = STATUS_COLORS[appt.status] || '#999';

                      return (
                        <Tooltip
                          key={appt.id}
                          title={
                            <div>
                              <div style={{ fontWeight: 600 }}>{appt.patientFullName}</div>
                              <div>{timeStr} — {appt.durationMinutes || 30} dk</div>
                              {appt.type && <div>Tür: {appt.type}</div>}
                              <div>Durum: {STATUS_LABELS[appt.status] || appt.status}</div>
                            </div>
                          }
                        >
                          <div
                            style={{
                              position: 'absolute',
                              top: 4,
                              bottom: 4,
                              left: barStyle.left,
                              width: barStyle.width,
                              background: color,
                              borderRadius: 4,
                              display: 'flex',
                              alignItems: 'center',
                              paddingLeft: 6,
                              paddingRight: 4,
                              overflow: 'hidden',
                              cursor: 'pointer',
                              transition: 'opacity 0.15s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                          >
                            <span style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: '#fff',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}>
                              {timeStr} {appt.patientFullName}
                            </span>
                          </div>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
