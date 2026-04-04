import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Col, Form, Input, message, Modal, Popconfirm, Row, Select, Space, Table, Tag, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ClearOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { TablePaginationConfig } from 'antd';
import type { SorterResult } from 'antd/es/table/interface';
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  type Appointment,
  type CreateAppointmentRequest,
  type UpdateAppointmentRequest,
  type AppointmentListParams,
} from '../services/appointmentService';
import { useAuth } from '../context/AuthContext';

interface Filters {
  doctor?: string;
  type?: string;
  status?: string;
}

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'blue',
  COMPLETED: 'green',
  CANCELLED: 'red',
  NO_SHOW: 'orange',
};

export default function Appointments() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('APPOINTMENT_CREATE');
  const canUpdate = hasPermission('APPOINTMENT_UPDATE');
  const canDelete = hasPermission('APPOINTMENT_DELETE');

  const [data, setData] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [sortField, setSortField] = useState('appointmentDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filters, setFilters] = useState<Filters>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Appointment | null>(null);
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm<Filters>();

  const fetchData = useCallback(async (
    page = 0,
    size = 10,
    sort = `${sortField},${sortOrder}`,
    currentFilters = filters,
  ) => {
    setLoading(true);
    try {
      const params: AppointmentListParams = { page, size, sort };
      if (currentFilters.doctor) params.doctor = currentFilters.doctor;
      if (currentFilters.type) params.type = currentFilters.type;
      if (currentFilters.status) params.status = currentFilters.status;

      const res = await getAppointments(params);
      setData(res.content);
      setPagination((prev) => ({
        ...prev,
        current: res.number + 1,
        pageSize: res.size,
        total: res.totalElements,
      }));
    } catch {
      message.error('Randevular yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [sortField, sortOrder, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTableChange = (
    pag: TablePaginationConfig,
    _filters: Record<string, unknown>,
    sorter: SorterResult<Appointment> | SorterResult<Appointment>[],
  ) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    const newField = (s.field as string) || sortField;
    const newOrder = s.order === 'descend' ? 'desc' : 'asc';
    setSortField(newField);
    setSortOrder(newOrder);
    fetchData((pag.current ?? 1) - 1, pag.pageSize ?? 10, `${newField},${newOrder}`, filters);
  };

  const handleFilterSearch = () => {
    const values = filterForm.getFieldsValue();
    setFilters(values);
    fetchData(0, pagination.pageSize ?? 10, `${sortField},${sortOrder}`, values);
  };

  const handleFilterReset = () => {
    filterForm.resetFields();
    setFilters({});
    fetchData(0, pagination.pageSize ?? 10, `${sortField},${sortOrder}`, {});
  };

  const openCreateModal = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (record: Appointment) => {
    setEditingRecord(record);
    form.setFieldsValue({
      patientId: record.patientId,
      appointmentDate: record.appointmentDate ? dayjs(record.appointmentDate).format('YYYY-MM-DDTHH:mm') : '',
      durationMinutes: record.durationMinutes,
      doctor: record.doctor,
      type: record.type,
      note: record.note,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingRecord) {
        const payload: UpdateAppointmentRequest = {
          appointmentDate: values.appointmentDate,
          durationMinutes: values.durationMinutes,
          doctor: values.doctor,
          type: values.type,
          note: values.note,
        };
        await updateAppointment(editingRecord.id, payload);
        message.success('Randevu güncellendi');
      } else {
        const payload: CreateAppointmentRequest = {
          patientId: values.patientId,
          appointmentDate: values.appointmentDate,
          durationMinutes: values.durationMinutes,
          doctor: values.doctor,
          type: values.type,
          note: values.note,
        };
        await createAppointment(payload);
        message.success('Randevu oluşturuldu');
      }
      setModalOpen(false);
      form.resetFields();
      setEditingRecord(null);
      fetchData((pagination.current ?? 1) - 1, pagination.pageSize ?? 10);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        message.error(axiosErr.response?.data?.message || 'İşlem başarısız');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAppointment(id);
      message.success('Randevu silindi');
      fetchData((pagination.current ?? 1) - 1, pagination.pageSize ?? 10);
    } catch {
      message.error('Randevu silinemedi');
    }
  };

  const getSortOrder = (field: string) =>
    sortField === field ? (sortOrder === 'asc' ? 'ascend' as const : 'descend' as const) : undefined;

  const columns = [
    {
      title: 'Hasta',
      dataIndex: 'patientFullName',
      sorter: true,
      sortOrder: getSortOrder('patientFullName'),
    },
    {
      title: 'Randevu Tarihi',
      dataIndex: 'appointmentDate',
      sorter: true,
      sortOrder: getSortOrder('appointmentDate'),
      render: (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm'),
    },
    {
      title: 'Süre (dk)',
      dataIndex: 'durationMinutes',
      render: (v: number | null) => v ?? '—',
    },
    {
      title: 'Doktor',
      dataIndex: 'doctor',
      sorter: true,
      sortOrder: getSortOrder('doctor'),
      render: (v: string | null) => v ?? '—',
    },
    {
      title: 'Tür',
      dataIndex: 'type',
      render: (v: string | null) => v ?? '—',
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      sorter: true,
      sortOrder: getSortOrder('status'),
      render: (status: string) => (
        <Tag color={STATUS_COLORS[status] ?? 'default'}>{status}</Tag>
      ),
    },
    ...((canUpdate || canDelete) ? [{
      title: 'İşlemler',
      render: (_: unknown, record: Appointment) => (
        <Space>
          {canUpdate && (
            <Button type="link" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
              Düzenle
            </Button>
          )}
          {canDelete && (
            <Popconfirm
              title="Bu randevuyu silmek istediğinize emin misiniz?"
              onConfirm={() => handleDelete(record.id)}
              okText="Evet"
              cancelText="Hayır"
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                Sil
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    }] : []),
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Randevular</Typography.Title>
        {canCreate && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            Yeni Randevu
          </Button>
        )}
      </div>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Form form={filterForm} layout="vertical">
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="doctor" label="Doktor" style={{ marginBottom: 0 }}>
                <Input placeholder="Ara..." allowClear />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item name="type" label="Tür" style={{ marginBottom: 0 }}>
                <Input placeholder="Ara..." allowClear />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item name="status" label="Durum" style={{ marginBottom: 0 }}>
                <Select placeholder="Tümü" allowClear>
                  <Select.Option value="SCHEDULED">SCHEDULED</Select.Option>
                  <Select.Option value="COMPLETED">COMPLETED</Select.Option>
                  <Select.Option value="CANCELLED">CANCELLED</Select.Option>
                  <Select.Option value="NO_SHOW">NO_SHOW</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8} style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleFilterSearch}>
                  Ara
                </Button>
                <Button icon={<ClearOutlined />} onClick={handleFilterReset}>
                  Temizle
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />

      <Modal
        title={editingRecord ? 'Randevu Düzenle' : 'Yeni Randevu'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => { setModalOpen(false); form.resetFields(); setEditingRecord(null); }}
        confirmLoading={saving}
        okText={editingRecord ? 'Güncelle' : 'Oluştur'}
        cancelText="İptal"
      >
        <Form form={form} layout="vertical">
          {!editingRecord && (
            <Form.Item name="patientId" label="Hasta ID" rules={[{ required: true, message: 'Zorunlu alan' }]}>
              <Input type="number" />
            </Form.Item>
          )}
          <Form.Item name="appointmentDate" label="Randevu Tarihi" rules={[{ required: true, message: 'Zorunlu alan' }]}>
            <Input placeholder="YYYY-MM-DDTHH:mm" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="durationMinutes" label="Süre (dk)">
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label="Tür">
                <Input placeholder="Örn: Muayene" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="doctor" label="Doktor">
            <Input />
          </Form.Item>
          <Form.Item name="note" label="Not">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
