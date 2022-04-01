import React from 'react';
import Highlighter from 'react-highlight-words';
import { Table, Input, Button, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

export default function DataTable(props) {
  const { data, setDisplayedData } = props;
  const [searchText, setSearchText] = React.useState('');
  const [searchInput, setSearchInput] = React.useState({});
  const [searchedColumn, setSearchedColumn] = React.useState('');

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={(node) => setSearchInput(node)}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type='primary'
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size='small'
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() =>
              handleReset(clearFilters, selectedKeys, confirm, dataIndex)
            }
            size='small'
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : '',
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters, selectedKeys, confirm, dataIndex) => {
    clearFilters();
    setSearchText('');
    handleSearch(selectedKeys, confirm, dataIndex);
  };

  const replaceDelimiters = (string, char) => {
    const delimeters = ['_', '-'];
    for (const delimeter of delimeters) {
      string = string.replaceAll(delimeter, char);
    }
    return string;
  };

  // order of this list is reflected in the table
  const crknColumnNames = [
    'Title',
    'Package_Name',
    'Collection_Name',
    'Year',
    'Title_ID',
    'Print_ISSN',
    'Online_ISSN',
    'Has_Former_Title',
    'Has_Succeeding_Title',
    'Agreement_Code',
    'Has_Rights',
  ];

  const getColumns = () => {
    const columns = [];

    for (const columnName of crknColumnNames) {
      let key = columnName.toLowerCase();

      columns.push({
        title: replaceDelimiters(columnName, ' '),
        dataIndex: key,
        key: key,
        ...getColumnSearchProps(key),
        sorter: (a, b) => {
          if (a[key]) {
            if (b[key]) {
              if (typeof a[key] === 'string') {
                return a[key].localeCompare(b[key]);
              } else {
                return a[key] - b[key];
              }
            } else {
              return -1;
            }
          } else {
            if (b[key]) {
              return 1;
            } else {
              return 0;
            }
          }
        },
      });
    }

    return columns;
  };

  const onTableChange = (_pagination, _filters, _sorter, extra) =>
    setDisplayedData(extra.currentDataSource);

  let dataSource = [];
  let columns = [];

  if (data?.results?.length > 0) {
    dataSource = data.results;
    columns = getColumns();
  }

  dataSource.forEach((element, i) => (element.key = i));

  return (
    <Table
      columns={columns}
      scroll={{
        x: true,
      }}
      dataSource={dataSource}
      bordered={true}
      pagination={{
        position: ['topRight', 'bottomRight'],
        defaultPageSize: 100,
        pageSizeOptions: [100, 250, 500],
      }}
      onChange={onTableChange}
    />
  );
}
