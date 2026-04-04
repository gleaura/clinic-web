import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Col, DatePicker, Form, Input, message, Modal, Popconfirm, Row, Select, Space, Table, Tag, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ClearOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { TablePaginationConfig } from 'antd';
import type { SorterResult } from 'antd/es/table/interface';
import {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
  type Patient,
  type CreatePatientRequest,
  type UpdatePatientRequest,
  type PatientListParams,
} from '../services/patientService';
import { useAuth } from '../context/AuthContext';

interface Filters {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  status?: string;
}

export default function Patients() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('PATIENT_CREATE');
  const canUpdate = hasPermission('PATIENT_UPDATE');
  const canDelete = hasPermission('PATIENT_DELETE');

  const [data, setData] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [sortField, setSortField] = useState('firstName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filters, setFilters] = useState<Filters>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Patient | null>(null);
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
      const params: PatientListParams = { page, size, sort };
      if (currentFilters.firstName) params.firstName = currentFilters.firstName;
      if (currentFilters.lastName) params.lastName = currentFilters.lastName;
      if (currentFilters.phone) params.phone = currentFilters.phone;
      if (currentFilters.email) params.email = currentFilters.email;
      if (currentFilters.status) params.status = currentFilters.status;

      const res = await getPatients(params);
      setData(res.content);
      setPagination((prev) => ({
        ...prev,
        current: res.number + 1,
        pageSize: res.size,
        total: res.totalElements,
      }));
    } catch {
      message.error('Hastalar yüklenirken hata oluştu');
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
    sorter: SorterResult<Patient> | SorterResult<Patient>[],
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

  const openEditModal = (record: Patient) => {
    setEditingRecord(record);
    form.setFieldsValue({
      firstName: record.firstName,
      lastName: record.lastName,
      birthDate: record.birthDate ? dayjs(record.birthDate) : null,
      gender: record.gender,
      phone: record.phone,
      email: record.email,
      address: record.address,
      identityNumber: record.identityNumber,
      bloodType: record.bloodType,
      allergies: record.allergies,
      chronicDiseases: record.chronicDiseases,
      note: record.note,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const birthDate = values.birthDate ? dayjs(values.birthDate).format('YYYY-MM-DD') : null;
      if (editingRecord) {
        const payload: UpdatePatientRequest = { ...values, birthDate };
        await updatePatient(editingRecord.id, payload);
        message.success('Hasta güncellendi');
      } else {
        const payload: CreatePatientRequest = { ...values, birthDate };
        await createPatient(payload);
        message.success('Hasta oluşturuldu');
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
      await deletePatient(id);
      message.success('Hasta silindi');
      fetchData((pagination.current ?? 1) - 1, pagination.pageSize ?? 10);
    } catch {
      message.error('Hasta silinemedi');
    }
  };

  const getSortOrder = (field: string) =>
    sortField === field ? (sortOrder === 'asc' ? 'ascend' as const : 'descend' as const) : undefined;

  const columns = [
    {
      title: 'Ad',
      dataIndex: 'firstName',
      sorter: true,
      sortOrder: getSortOrder('firstName'),
    },
    {
      title: 'Soyad',
      dataIndex: 'lastName',
      sorter: true,
      sortOrder: getSortOrder('lastName'),
    },
    {
      title: 'Cinsiyet',
      dataIndex: 'gender',
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
    },
    {
      title: 'E-posta',
      dataIndex: 'email',
    },
    {
      title: 'Doğum Tarihi',
      dataIndex: 'birthDate',
      render: (date: string | null) => date ? dayjs(date).format('DD.MM.YYYY') : '—',
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      sorter: true,
      sortOrder: getSortOrder('status'),
      render: (status: string) => (
        <Tag color={status === 'ACTIVE' ? 'green' : status === 'INACTIVE' ? 'orange' : 'red'}>{status}</Tag>
      ),
    },
    {
      title: 'Kayıt Tarihi',
      dataIndex: 'createdDate',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
    },
    ...((canUpdate || canDelete) ? [{
      title: 'İşlemler',
      render: (_: unknown, record: Patient) => (
        <Space>
          {canUpdate && (
            <Button type="link" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
              Düzenle
            </Button>
          )}
          {canDelete && (
            <Popconfirm
              title="Bu hastayı silmek istediğinize emin misiniz?"
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
        <Typography.Title level={3} style={{ margin: 0 }}>Hastalar</Typography.Title>
        {canCreate && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            Yeni Hasta
          </Button>
        )}
      </div>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Form form={filterForm} layout="vertical">
          <Row gutter={16}>
            <Col span={4}>
              <Form.Item name="firstName" label="Ad" style={{ marginBottom: 0 }}>
                <Input placeholder="Ara..." allowClear />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="lastName" label="Soyad" style={{ marginBottom: 0 }}>
                <Input placeholder="Ara..." allowClear />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="phone" label="Telefon" style={{ marginBottom: 0 }}>
                <Input placeholder="Ara..." allowClear />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item name="email" label="E-posta" style={{ marginBottom: 0 }}>
                <Input placeholder="Ara..." allowClear />
              </Form.Item>
            </Col>
            <Col span={3}>
              <Form.Item name="status" label="Durum" style={{ marginBottom: 0 }}>
                <Select placeholder="Tümü" allowClear>
                  <Select.Option value="ACTIVE">ACTIVE</Select.Option>
                  <Select.Option value="INACTIVE">INACTIVE</Select.Option>
                  <Select.Option value="CANCELLED">CANCELLED</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={4} style={{ display: 'flex', alignItems: 'flex-end' }}>
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
        title={editingRecord ? 'Hasta Düzenle' : 'Yeni Hasta'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => { setModalOpen(false); form.resetFields(); setEditingRecord(null); }}
        confirmLoading={saving}
        okText={editingRecord ? 'Güncelle' : 'Oluştur'}
        cancelText="İptal"
        width={640}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="firstName" label="Ad" rules={[{ required: true, message: 'Zorunlu alan' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lastName" label="Soyad" rules={[{ required: true, message: 'Zorunlu alan' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="Telefon">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="E-posta">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="birthDate" label="Doğum Tarihi">
                <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Tarih seçin" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gender" label="Cinsiyet">
                <Select allowClear>
                  <Select.Option value="MALE">Erkek</Select.Option>
                  <Select.Option value="FEMALE">Kadın</Select.Option>
                  <Select.Option value="OTHER">Diğer</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="identityNumber" label="TC Kimlik No">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="bloodType" label="Kan Grubu">
                <Select allowClear>
                  <Select.Option value="A+">A+</Select.Option>
                  <Select.Option value="A-">A-</Select.Option>
                  <Select.Option value="B+">B+</Select.Option>
                  <Select.Option value="B-">B-</Select.Option>
                  <Select.Option value="AB+">AB+</Select.Option>
                  <Select.Option value="AB-">AB-</Select.Option>
                  <Select.Option value="0+">0+</Select.Option>
                  <Select.Option value="0-">0-</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="address" label="Adres">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="allergies" label="Alerjiler">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="chronicDiseases" label="Kronik Hastalıklar">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="note" label="Not">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
