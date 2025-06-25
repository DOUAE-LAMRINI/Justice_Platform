import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Modal, Form, Input, InputNumber, Select,
  Tag, message, Popconfirm, Space, Card, Row, Col, Statistic,
  Tooltip, DatePicker, Drawer, List
} from 'antd';
import {
  SearchOutlined, PlusOutlined, EditOutlined,
  DeleteOutlined, ExportOutlined, FileExcelOutlined,
  FilePdfOutlined, BarcodeOutlined, StockOutlined,
  ShoppingOutlined, DatabaseOutlined, ShoppingCartOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import './AdminInventory.css';

const { Option } = Select;
const { Search } = Input;
const { RangePicker } = DatePicker;

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true
});

const statusColors = {
  in_stock: 'green',
  low_stock: 'orange',
  out_of_stock: 'red',
  discontinued: 'gray'
};

const InventoryManagement = () => {
  // Inventory state
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [filters, setFilters] = useState({});
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStock: 0,
    outOfStock: 0
  });
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [itemHistory, setItemHistory] = useState([]);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [searchParams, setSearchParams] = useState({});

  // Catalog state
  const [catalogVisible, setCatalogVisible] = useState(false);
  const [catalogItems, setCatalogItems] = useState([]);
  const [catalogForm] = Form.useForm();
  const [catalogModalVisible, setCatalogModalVisible] = useState(false);
  const [currentCatalogItem, setCurrentCatalogItem] = useState(null);
  const [ setAllCatalogItems] = useState([]);

  // Fetch inventory data
  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...filters,
        ...searchParams
      };

      const response = await api.get('/inventory', {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setInventory(response.data.inventory);
        setPagination(prev => ({
          ...prev,
          total: response.data.total
        }));
      }
    } catch (error) {
      message.error('Failed to fetch inventory: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, filters, searchParams]);

  // Fetch catalog items
  const fetchCatalogItems = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.get('/api/supplies/catalog', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCatalogItems(response.data);
      setAllCatalogItems(response.data);
    } catch (error) {
      message.error('Failed to fetch catalog: ' + error.message);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.get('/inventory/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      message.error('Failed to fetch stats: ' + error.message);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.get('/inventory/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      message.error('Failed to fetch categories: ' + error.message);
    }
  }, []);

  const fetchSuppliers = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.get('/inventory/suppliers', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSuppliers(response.data.suppliers);
      }
    } catch (error) {
      message.error('Failed to fetch suppliers: ' + error.message);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
    fetchStats();
    fetchCategories();
    fetchSuppliers();
    fetchCatalogItems();
  }, [fetchInventory, fetchStats, fetchCategories, fetchSuppliers, fetchCatalogItems]);

  // Inventory handlers
  const handleTableChange = (newPagination, newFilters) => {
    setPagination(newPagination);
    setFilters(newFilters);
  };

  const handleAddItem = () => {
    setCurrentItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditItem = (record) => {
    setCurrentItem(record);
    form.setFieldsValue({
      ...record,
      min_stock_level: record.min_stock_level || 0
    });
    setModalVisible(true);
  };

  const handleDeleteItem = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      await api.delete(`/inventory/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Item deleted successfully');
      fetchInventory();
    } catch (error) {
      message.error('Failed to delete item: ' + error.message);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await api.post('/inventory/bulk-delete', { ids: selectedRowKeys }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success(`${selectedRowKeys.length} items deleted successfully`);
      setSelectedRowKeys([]);
      fetchInventory();
    } catch (error) {
      message.error('Failed to delete items: ' + error.message);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem('adminToken');
      
      const payload = {
        name: values.name || null,
        category: values.category || null,
        barcode: values.barcode || null,
        quantity: values.quantity || 0,
        price: values.price || 0,
        min_stock_level: values.min_stock_level || 0,
        location: values.location || null,
        status: values.status || 'in_stock',
        supplier: values.supplier || null,
        description: values.description || null
      };
      
      if (currentItem) {
        await api.put(`/inventory/${currentItem.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        message.success('Item updated successfully');
      } else {
        await api.post('/inventory', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        message.success('Item added successfully');
      }
      
      setModalVisible(false);
      fetchInventory();
      fetchStats();
    } catch (error) {
      message.error('Failed to save item: ' + error.message);
    }
  };

  const handleViewHistory = async (itemId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.get(`/inventory/${itemId}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setItemHistory(response.data.history);
        setHistoryModalVisible(true);
      }
    } catch (error) {
      message.error('Failed to fetch history: ' + error.message);
    }
  };

  /*const handleStatusChange = async (id, status) => {
    try {
      const token = localStorage.getItem('adminToken');
      await api.put(`/inventory/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Status updated successfully');
      fetchInventory();
    } catch (error) {
      message.error('Failed to update status: ' + error.message);
    }
  };*/

  const handleSearch = (value) => {
    setSearchParams({ search: value });
  };

  const handleDateFilter = (dates) => {
    if (dates && dates.length === 2) {
      setSearchParams({
        dateFrom: dates[0].format('YYYY-MM-DD'),
        dateTo: dates[1].format('YYYY-MM-DD')
      });
    } else {
      setSearchParams(prev => {
        const newParams = { ...prev };
        delete newParams.dateFrom;
        delete newParams.dateTo;
        return newParams;
      });
    }
  };

  const handleExport = async (format) => {
    try {
      const token = localStorage.getItem('adminToken');
      const params = {
        ...filters,
        ...searchParams
      };

      const config = {
        params,
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        responseType: 'blob'
      };

      const response = format === 'excel' 
        ? await api.get('/inventory/export/excel', config)
        : await api.post('/inventory/export/pdf', {}, config);

      const blob = new Blob([response.data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `inventory_export_${moment().format('YYYYMMDD')}.${format}`;
      link.click();
      message.success(`Export to ${format.toUpperCase()} successful`);
    } catch (error) {
      message.error(`Failed to export: ${error.response?.data?.message || error.message}`);
    }
  };

  // Catalog handlers
  const handleAddCatalogItem = () => {
    setCurrentCatalogItem(null);
    catalogForm.resetFields();
    setCatalogModalVisible(true);
  };

  const handleEditCatalogItem = (item) => {
    setCurrentCatalogItem(item);
    catalogForm.setFieldsValue({
      name_ar: item.name_ar,
      name_en: item.name_en
    });
    setCatalogModalVisible(true);
  };

  const handleDeleteCatalogItem = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      await api.delete(`/api/supplies/catalog/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Catalog item deleted');
      fetchCatalogItems();
    } catch (error) {
      message.error('Failed to delete catalog item: ' + error.message);
    }
  };

  const handleCatalogSubmit = async () => {
    try {
      const values = await catalogForm.validateFields();
      const token = localStorage.getItem('adminToken');
      
      if (currentCatalogItem) {
        await api.put(`/api/supplies/catalog/${currentCatalogItem.id}`, values, {
          headers: { Authorization: `Bearer ${token}` }
        });
        message.success('Catalog item updated');
      } else {
        await api.post('/api/supplies/catalog', values, {
          headers: { Authorization: `Bearer ${token}` }
        });
        message.success('Catalog item added');
      }
      
      setCatalogModalVisible(false);
      fetchCatalogItems();
    } catch (error) {
      message.error('Failed to save catalog item: ' + error.message);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (text, record) => (
        <div>
          <strong>{text}</strong>
          {record.barcode && (
            <div className="text-muted">
              <BarcodeOutlined /> {record.barcode}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: categories.map(cat => ({ text: cat, value: cat })),
      onFilter: (value, record) => record.category === value,
      sorter: true
    },
    {
      title: 'Stock',
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: true,
      render: (text, record) => (
        <div>
          <div>
            <span className="font-medium">{text}</span>
            <span className="text-muted"> in stock</span>
          </div>
          {record.min_stock_level > 0 && (
            <div className="text-xs">
              <span className="text-muted">Min: </span>
              {record.min_stock_level}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'In Stock', value: 'in_stock' },
        { text: 'Low Stock', value: 'low_stock' },
        { text: 'Out of Stock', value: 'out_of_stock' },
        { text: 'Discontinued', value: 'discontinued' }
      ],
      render: (status) => (
        <Tag color={statusColors[status]}>
          {status.replace('_', ' ').toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Value',
      dataIndex: 'price',
      key: 'value',
      sorter: true,
      render: (price, record) => (
        <div>
          <span className="font-medium">{(price * record.quantity).toFixed(2)} DH</span>
          <div className="text-xs text-muted">
            {price} DH/unit
          </div>
        </div>
      )
    },
    {
      title: 'Last Updated',
      dataIndex: 'updated_at',
      key: 'updated_at',
      sorter: true,
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEditItem(record)}
              size="small"
            />
          </Tooltip>
          
          <Tooltip title="History">
            <Button
              icon={<DatabaseOutlined />}
              onClick={() => handleViewHistory(record.id)}
              size="small"
            />
          </Tooltip>
          
          <Popconfirm
            title="Are you sure to delete this item?"
            onConfirm={() => handleDeleteItem(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button
                icon={<DeleteOutlined />}
                danger
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="inventory-management-container">
      <div className="inventory-management-header">
        <h1>Inventory Management</h1>
        <div className="inventory-actions">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddItem}
          >
            Add Item
          </Button>
          
          <Button
            type="default"
            icon={<ShoppingCartOutlined />}
            onClick={() => setCatalogVisible(true)}
          >
            Catalog
          </Button>
          
          <Button
            icon={<ExportOutlined />}
            onClick={() => setExportModalVisible(true)}
          >
            Export
          </Button>
          
          {selectedRowKeys.length > 0 && (
            <Popconfirm
              title={`Delete ${selectedRowKeys.length} selected items?`}
              onConfirm={handleBulkDelete}
              okText="Yes"
              cancelText="No"
            >
              <Button danger icon={<DeleteOutlined />}>
                Delete Selected
              </Button>
            </Popconfirm>
          )}
        </div>
      </div>

      <Row gutter={16} className="inventory-stats">
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Items"
              value={stats.totalItems}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Value"
              value={stats.totalValue}
              prefix="DH"
              precision={2}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Low Stock"
              value={stats.lowStock}
              prefix={<StockOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Out of Stock"
              value={stats.outOfStock}
              prefix={<StockOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="inventory-table-card">
        <div className="inventory-table-toolbar">
          <Search
            placeholder="Search inventory..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            className="inventory-search"
          />
          
          <RangePicker
            onChange={handleDateFilter}
            className="inventory-date-filter"
          />
        </div>
        
        <Table
          columns={columns}
          dataSource={inventory}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys
          }}
          scroll={{ x: true }}
          className="inventory-table"
        />
      </Card>

      {/* Inventory Item Modal */}
      <Modal
        title={currentItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={700}
        okText={currentItem ? 'Update' : 'Add'}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            min_stock_level: 0,
            status: 'in_stock'
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Item Name"
                rules={[{ required: true, message: 'Please enter item name' }]}
              >
                <Input placeholder="Enter item name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select
                  showSearch
                  placeholder="Select category"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {categories.map(category => (
                    <Option key={category} value={category}>{category}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="barcode"
                label="Barcode/ID"
              >
                <Input placeholder="Enter barcode or ID" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="supplier"
                label="Supplier"
              >
                <Select
                  showSearch
                  placeholder="Select supplier"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {suppliers.map(supplier => (
                    <Option key={supplier} value={supplier}>{supplier}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="quantity"
                label="Quantity"
                rules={[{ required: true, message: 'Please enter quantity' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Enter quantity"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="price"
                label="Unit Price (DH)"
                rules={[{ required: true, message: 'Please enter price' }]}
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  style={{ width: '100%' }}
                  placeholder="Enter price"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="min_stock_level"
                label="Min Stock Level"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Enter minimum stock"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="location"
                label="Location"
              >
                <Input placeholder="Enter storage location" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
              >
                <Select>
                  <Option value="in_stock">In Stock</Option>
                  <Option value="low_stock">Low Stock</Option>
                  <Option value="out_of_stock">Out of Stock</Option>
                  <Option value="discontinued">Discontinued</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={3} placeholder="Enter item description" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Item History Modal */}
      <Modal
        title="Item History"
        open={historyModalVisible}
        onCancel={() => setHistoryModalVisible(false)}
        footer={null}
        width={800}
      >
        <Table
          columns={[
            {
              title: 'Action',
              dataIndex: 'action',
              key: 'action',
              render: (text) => <Tag color="blue">{text}</Tag>
            },
            {
              title: 'Details',
              dataIndex: 'details',
              key: 'details'
            },
            {
              title: 'User',
              dataIndex: 'user_name',
              key: 'user'
            },
            {
              title: 'Date',
              dataIndex: 'timestamp',
              key: 'date',
              render: (date) => moment(date).format('YYYY-MM-DD HH:mm')
            }
          ]}
          dataSource={itemHistory}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Modal>

      {/* Export Modal */}
      <Modal
        title="Export Inventory Data"
        open={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        footer={null}
        width={400}
      >
        <div className="export-options">
          <Button
            type="primary"
            icon={<FileExcelOutlined />}
            block
            onClick={() => handleExport('excel')}
            style={{ marginBottom: 16 }}
          >
            Export to Excel
          </Button>
          <Button
            type="primary"
            icon={<FilePdfOutlined />}
            block
            onClick={() => handleExport('pdf')}
          >
            Export to PDF
          </Button>
        </div>
      </Modal>

      {/* Catalog Management Drawer */}
      <Drawer
        title="Office Supplies Catalog"
        width={720}
        open={catalogVisible}
        onClose={() => setCatalogVisible(false)}
        extra={
          <Space>
  <Search
    placeholder="Search catalog..."
    allowClear
    enterButton={<SearchOutlined />}
    size="middle"
    onSearch={(value) => {
      if (value) {
        const filtered = catalogItems.filter(item => 
          item.name_en.toLowerCase().includes(value.toLowerCase()) || 
          item.name_ar.toLowerCase().includes(value.toLowerCase())
        );
        setCatalogItems(filtered);
      } else {
        fetchCatalogItems(); 
      }
    }}
    style={{ width: 300 }}
  />
  <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCatalogItem}>
    Add New Item
  </Button>
</Space>
        }
      >
        <List
          itemLayout="horizontal"
          dataSource={catalogItems}
          renderItem={item => (
            <List.Item
              actions={[
                <Button icon={<EditOutlined />} onClick={() => handleEditCatalogItem(item)} />,
                <Popconfirm
                  title="Delete this catalog item?"
                  onConfirm={() => handleDeleteCatalogItem(item.id)}
                >
                  <Button danger icon={<DeleteOutlined />} />
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                title={<span>{item.name_en}</span>}
                description={<span>{item.name_ar}</span>}
              />
            </List.Item>
          )}
        />
      </Drawer>

      {/* Catalog Item Modal */}
      <Modal
        title={currentCatalogItem ? 'Edit Catalog Item' : 'Add Catalog Item'}
        open={catalogModalVisible}
        onOk={handleCatalogSubmit}
        onCancel={() => setCatalogModalVisible(false)}
      >
        <Form form={catalogForm} layout="vertical">
          <Form.Item
            name="name_en"
            label="English Name"
            rules={[{ required: true, message: 'Please enter English name' }]}
          >
            <Input placeholder="Enter name in English" />
          </Form.Item>
          <Form.Item
            name="name_ar"
            label="Arabic Name"
            rules={[{ required: true, message: 'Please enter Arabic name' }]}
          >
            <Input placeholder="Enter name in Arabic" dir="rtl" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InventoryManagement;