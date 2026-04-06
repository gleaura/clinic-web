import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Col, DatePicker, Form, Input, InputNumber, message, Modal, Popconfirm, Row, Select, Space, Table, Tag, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { formatDateTime, toApiDateTime, fromApiDateTime } from '../utils/dateUtils';
import type { TablePaginationConfig } from 'antd';
import type { SorterResult } from 'antd/es/table/interface';
import {
  getTreatments,
  createTreatment,
  updateTreatment,
  deleteTreatment,
  type Treatment,
  type CreateTreatmentRequest,
  type UpdateTreatmentRequest,
  type TreatmentListParams,
} from '../services/treatmentService';
import { useAuth } from '../context/AuthContext';

interface Filters {
  status?: string;
}

export default function Treatments() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('TREATMENT_CREATE');
  const canUpdate = hasPermission('TREATMENT_UPDATE');
  const canDelete = hasPermission('TREATMENT_DELETE');

  const [data, setData] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [sortField, setSortField] = useState('treatmentDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filters, setFilters] = useState<Filters>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Treatment | null>(null);
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
      const params: TreatmentListParams = { page, size, sort };
      if (currentFilters.status) params.status = currentFilters.status;

      const res = await getTreatments(params);
      setData(res.content);
      setPagination((prev) => ({
        ...prev,
        current: res.number + 1,
        pageSize: res.size,
        total: res.totalElements,
      }));
    } catch {
      message.error('Tedaviler yüklenirken hata oluştu');
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
    sorter: SorterResult<Treatment> | SorterResult<Treatment>[],
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

  const openEditModal = (record: Treatment) => {
    setEditingRecord(record);
    form.setFieldsValue({
      appointmentId: record.appointmentId,
      name: record.name,
      description: record.description,
      treatmentDate: fromApiDateTime(record.treatmentDate),
      cost: record.cost,
      currency: record.currency,
      note: record.note,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingRecord) {
        const payload: UpdateTreatmentRequest = {
          name: values.name,
          description: values.description,
          treatmentDate: toApiDateTime(values.treatmentDate)!,
          cost: values.cost,
          currency: values.currency,
          note: values.note,
        };
        await updateTreatment(editingRecord.id, payload);
        message.success('Tedavi güncellendi');
      } else {
        const payload: CreateTreatmentRequest = {
          appointmentId: values.appointmentId,
          name: values.name,
          description: values.description,
          treatmentDate: toApiDateTime(values.treatmentDate)!,
          cost: values.cost,
          currency: values.currency,
          note: values.note,
        };
        await createTreatment(payload);
        message.success('Tedavi oluşturuldu');
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
      await deleteTreatment(id);
      message.success('Tedavi silindi');
      fetchData((pagination.current ?? 1) - 1, pagination.pageSize ?? 10);
    } catch {
      message.error('Tedavi silinemedi');
    }
  };

  const getSortOrder = (field: string) =>
    sortField === field ? (sortOrder === 'asc' ? 'ascend' as const : 'descend' as const) : undefined;

  const columns = [
    {
      title: 'Tedavi Adı',
      dataIndex: 'name',
      sorter: true,
      sortOrder: getSortOrder('name'),
    },
    {
      title: 'Tedavi Tarihi',
      dataIndex: 'treatmentDate',
      sorter: true,
      sortOrder: getSortOrder('treatmentDate'),
      render: (date: string) => formatDateTime(date),
    },
    {
      title: 'Maliyet',
      dataIndex: 'cost',
      render: (cost: number | null, record: Treatment) =>
        cost != null ? `${cost} ${record.currency ?? ''}` : '—',
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      render: (v: string | null) => v ?? '—',
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
      render: (date: string) => formatDateTime(date),
    },
    ...((canUpdate || canDelete) ? [{
      title: 'İşlemler',
      render: (_: unknown, record: Treatment) => (
        <Space>
          {canUpdate && (
            <Button type="link" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
              Düzenle
            </Button>
          )}
          {canDelete && (
            <Popconfirm
              title="Bu tedaviyi silmek istediğinize emin misiniz?"
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
        <Typography.Title level={3} style={{ margin: 0 }}>Tedaviler</Typography.Title>
        {canCreate && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            Yeni Tedavi
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
        title={editingRecord ? 'Tedavi Düzenle' : 'Yeni Tedavi'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => { setModalOpen(false); form.resetFields(); setEditingRecord(null); }}
        confirmLoading={saving}
        okText={editingRecord ? 'Güncelle' : 'Oluştur'}
        cancelText="İptal"
      >
        <Form form={form} layout="vertical">
          {!editingRecord && (
            <Form.Item name="appointmentId" label="Randevu ID" rules={[{ required: true, message: 'Zorunlu alan' }]}>
              <Input type="number" />
            </Form.Item>
          )}
          <Form.Item name="name" label="Tedavi Adı" rules={[{ required: true, message: 'Zorunlu alan' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="treatmentDate" label="Tedavi Tarihi" rules={[{ required: true, message: 'Zorunlu alan' }]}>
            <DatePicker showTime={{ format: 'HH:mm' }} format="DD.MM.YYYY HH:mm" style={{ width: '100%' }} placeholder="Tarih ve saat seçin" />
          </Form.Item>
          <Form.Item name="description" label="Açıklama">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="cost" label="Maliyet">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="currency" label="Para Birimi">
                <Select allowClear>
                  <Select.Option value="TRY">TRY</Select.Option>
                  <Select.Option value="USD">USD</Select.Option>
                  <Select.Option value="EUR">EUR</Select.Option>
                </Select>
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
