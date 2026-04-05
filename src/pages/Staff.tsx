import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Col, DatePicker, Form, Input, message, Modal, Popconfirm, Row, Select, Space, Table, Tag, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { formatDate, toApiDate, fromApiDate } from '../utils/dateUtils';
import type { TablePaginationConfig } from 'antd';
import type { SorterResult } from 'antd/es/table/interface';
import {
  getStaffList,
  createStaff,
  updateStaff,
  deleteStaff,
  type Staff as StaffType,
  type CreateStaffRequest,
  type UpdateStaffRequest,
  type StaffListParams,
} from '../services/staffService';
import { useAuth } from '../context/AuthContext';

interface Filters {
  status?: string;
}

export default function Staff() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('STAFF_CREATE');
  const canUpdate = hasPermission('STAFF_UPDATE');
  const canDelete = hasPermission('STAFF_DELETE');

  const [data, setData] = useState<StaffType[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [sortField, setSortField] = useState('lastName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filters, setFilters] = useState<Filters>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingRecord, setEditingRecord] = useState<StaffType | null>(null);
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
      const params: StaffListParams = { page, size, sort };
      if (currentFilters.status) params.status = currentFilters.status;

      const res = await getStaffList(params);
      setData(res.content);
      setPagination((prev) => ({
        ...prev,
        current: res.number + 1,
        pageSize: res.size,
        total: res.totalElements,
      }));
    } catch {
      message.error('Personeller yüklenirken hata oluştu');
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
    sorter: SorterResult<StaffType> | SorterResult<StaffType>[],
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

  const openEditModal = (record: StaffType) => {
    setEditingRecord(record);
    form.setFieldsValue({
      firstName: record.firstName,
      lastName: record.lastName,
      title: record.title,
      specialization: record.specialization,
      phone: record.phone,
      email: record.email,
      licenseNumber: record.licenseNumber,
      hireDate: fromApiDate(record.hireDate),
      note: record.note,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingRecord) {
        const payload: UpdateStaffRequest = {
          firstName: values.firstName,
          lastName: values.lastName,
          title: values.title,
          specialization: values.specialization,
          phone: values.phone,
          email: values.email,
          licenseNumber: values.licenseNumber,
          hireDate: toApiDate(values.hireDate),
          note: values.note,
        };
        await updateStaff(editingRecord.id, payload);
        message.success('Personel güncellendi');
      } else {
        const payload: CreateStaffRequest = {
          firstName: values.firstName,
          lastName: values.lastName,
          title: values.title,
          specialization: values.specialization,
          phone: values.phone,
          email: values.email,
          licenseNumber: values.licenseNumber,
          hireDate: toApiDate(values.hireDate),
          note: values.note,
        };
        await createStaff(payload);
        message.success('Personel oluşturuldu');
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
      await deleteStaff(id);
      message.success('Personel silindi');
      fetchData((pagination.current ?? 1) - 1, pagination.pageSize ?? 10);
    } catch {
      message.error('Personel silinemedi');
    }
  };

  const getSortOrder = (field: string) =>
    sortField === field ? (sortOrder === 'asc' ? 'ascend' as const : 'descend' as const) : undefined;

  const columns = [
    {
      title: 'Ad Soyad',
      dataIndex: 'firstName',
      sorter: true,
      sortOrder: getSortOrder('firstName'),
      render: (_: string, record: StaffType) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: 'Ünvan',
      dataIndex: 'title',
      render: (v: string | null) => v ?? '—',
    },
    {
      title: 'Uzmanlık',
      dataIndex: 'specialization',
      sorter: true,
      sortOrder: getSortOrder('specialization'),
      render: (v: string | null) => v ?? '—',
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      render: (v: string | null) => v ?? '—',
    },
    {
      title: 'E-posta',
      dataIndex: 'email',
      render: (v: string | null) => v ?? '—',
    },
    {
      title: 'İşe Giriş',
      dataIndex: 'hireDate',
      sorter: true,
      sortOrder: getSortOrder('hireDate'),
      render: (date: string | null) => date ? formatDate(date) : '—',
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
    ...((canUpdate || canDelete) ? [{
      title: 'İşlemler',
      render: (_: unknown, record: StaffType) => (
        <Space>
          {canUpdate && (
            <Button type="link" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
              Düzenle
            </Button>
          )}
          {canDelete && (
            <Popconfirm
              title="Bu personeli silmek istediğinize emin misiniz?"
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
        <Typography.Title level={3} style={{ margin: 0 }}>Personeller</Typography.Title>
        {canCreate && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            Yeni Personel
          </Button>
        )}
      </div>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Form form={filterForm} layout="vertical">
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="status" label="Durum" style={{ marginBottom: 0 }}>
                <Select placeholder="Tümü" allowClear>
                  <Select.Option value="ACTIVE">ACTIVE</Select.Option>
                  <Select.Option value="INACTIVE">INACTIVE</Select.Option>
                  <Select.Option value="CANCELLED">CANCELLED</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={18} style={{ display: 'flex', alignItems: 'flex-end' }}>
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
        title={editingRecord ? 'Personel Düzenle' : 'Yeni Personel'}
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
              <Form.Item name="title" label="Ünvan">
                <Select allowClear placeholder="Seçin">
                  <Select.Option value="Uzm. Dr.">Uzm. Dr.</Select.Option>
                  <Select.Option value="Dr.">Dr.</Select.Option>
                  <Select.Option value="Prof. Dr.">Prof. Dr.</Select.Option>
                  <Select.Option value="Doç. Dr.">Doç. Dr.</Select.Option>
                  <Select.Option value="Hemşire">Hemşire</Select.Option>
                  <Select.Option value="Teknisyen">Teknisyen</Select.Option>
                  <Select.Option value="Asistan">Asistan</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="specialization" label="Uzmanlık">
                <Select allowClear placeholder="Seçin">
                  <Select.Option value="Dermatoloji">Dermatoloji</Select.Option>
                  <Select.Option value="Estetik Cerrahi">Estetik Cerrahi</Select.Option>
                  <Select.Option value="Plastik Cerrahi">Plastik Cerrahi</Select.Option>
                  <Select.Option value="Medikal Estetik">Medikal Estetik</Select.Option>
                  <Select.Option value="Lazer Tedavisi">Lazer Tedavisi</Select.Option>
                  <Select.Option value="Diş Hekimliği">Diş Hekimliği</Select.Option>
                  <Select.Option value="Beslenme">Beslenme</Select.Option>
                  <Select.Option value="Fizyoterapi">Fizyoterapi</Select.Option>
                </Select>
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
                <Input type="email" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="licenseNumber" label="Lisans No">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="hireDate" label="İşe Giriş Tarihi">
                <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} placeholder="Tarih seçin" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="note" label="Not">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
