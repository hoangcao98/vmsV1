import {
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons';
import {
  AutoComplete,
  Button,
  Card,
  Popconfirm,
  Select,
  Space,
  Table,
  Tooltip
} from 'antd';
import 'antd/dist/antd.css';
import { isEmpty } from 'lodash-es';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { reactLocalStorage } from 'reactjs-localstorage';
import AdDivisionApi from '../../actions/api/advision/AdDivision';
import CameraApi from '../../actions/api/camera/CameraApi';
import EventApi from '../../actions/api/event/EventApi';
import FieldApi from '../../actions/api/field/FieldApi';
import TagApi from '../../actions/api/tag';
import VendorApi from '../../actions/api/vendor/VendorApi';
import Notification from '../../components/vms/notification/Notification';
import Breadcrumds from '../breadcrumds/Breadcrumds';
import './../commonStyle/commonInput.scss';
import './../commonStyle/commonSelect.scss';
import './../commonStyle/commonTable.scss';
import ModalEditAdministrativeUnit from './ModalEditAdministrativeUnit';
import ModalEditCategory from './ModalEditCategory';
import ModalUpdateTag from './ModalUpdateTag';
import ModalViewDetail from './ModalViewDetail';
import './TableCategory.scss';
import { bodyStyleCard, headStyleCard } from './variables';

export const CATEGORY_NAME = {
  EVENT_TYPE: 'EVENT_TYPE',
  VENDOR: 'VENDOR',
  CAMERA_TYPE: 'CAMERA_TYPE',
  AD_DIVISIONS: 'AD_DIVISIONS',
  FIELD: 'FIELD',
  TAGS: 'TAGS'
};

const { Option } = Select;
const TableCategory = () => {
  const { t } = useTranslation();
  const language = reactLocalStorage.get('language');
  const [dataOptions, setDataOptions] = useState({});
  const [dataType, setDataType] = useState(CATEGORY_NAME.AD_DIVISIONS);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (
      language == 'vn'
        ? (document.title = 'CCTV | Quản lý danh mục')
        : (document.title = 'CCTV | Category Management')
    );
  }, [t]);

  useEffect(() => {
    const data = {
      name: ''
    };
    fetchOptionsData(data).then((data) => {
      setDataOptions(data);
    });
  }, [showModal]);

  const handleChange = (value) => {
    setDataType(value);
  };

  const getDataByCategory = (dataType) => {
    if (isEmpty(dataType)) {
      return [];
    }

    let dataSource;

    if (dataType === CATEGORY_NAME.AD_DIVISIONS) {
      dataSource = adDivisions;
    }

    if (dataType === CATEGORY_NAME.CAMERA_TYPE) {
      dataSource = cameraTypes;
    }

    if (dataType === CATEGORY_NAME.VENDOR) {
      dataSource = vendors;
    }

    if (dataType === CATEGORY_NAME.FIELD) {
      dataSource = field;
    }
    if (dataType === CATEGORY_NAME.EVENT_TYPE) {
      dataSource = eventTypes;
    }

    if (dataType === CATEGORY_NAME.TAGS) {
      dataSource = tags;
    }

    return dataSource;
  };
  const getNameByCategory = (dataType) => {
    if (isEmpty(dataType)) {
      return [];
    }

    let name;

    if (dataType === CATEGORY_NAME.AD_DIVISIONS) {
      name = `${t('view.map.administrative_unit')}`;
    }

    if (dataType === CATEGORY_NAME.CAMERA_TYPE) {
      name = `${t('view.map.camera_type', { cam: t('camera') })}`;
    }

    if (dataType === CATEGORY_NAME.VENDOR) {
      name = `${t('view.category.camera_vendor', { cam: t('camera') })}`;
    }

    if (dataType === CATEGORY_NAME.FIELD) {
      name = `${t('view.category.field')}`;
    }

    if (dataType === CATEGORY_NAME.EVENT_TYPE) {
      name = `${t('view.category.event_type')}`;
    }
    if (dataType === CATEGORY_NAME.TAGS) {
      name = `${t('view.category.tags')}`;
    }

    return (
      <div className="card--header">
        <h4> {name}</h4>
        <div className="search__toolbar">
          <AutoComplete
            className="searchInputCamproxy"
            value={search}
            onSearch={handleSearch}
            onBlur={handleBlur}
            maxLength={255}
            style={{ width: 350, height: 40, marginRight: 18 }}
            placeholder={
              <div>
                <span> &nbsp;{t('view.map.search')} </span>{' '}
                <SearchOutlined style={{ fontSize: 22 }} />
              </div>
            }
          ></AutoComplete>
          <Select
            defaultValue={CATEGORY_NAME.AD_DIVISIONS}
            onChange={handleChange}
          >
            <Option value={CATEGORY_NAME.AD_DIVISIONS}>
              {t('view.map.administrative_unit')}
            </Option>
            <Option value={CATEGORY_NAME.VENDOR}>
              {t('view.category.camera_vendor', { cam: t('camera') })}
            </Option>
            <Option value={CATEGORY_NAME.FIELD}>
              {t('view.category.field')}
            </Option>

            <Option value={CATEGORY_NAME.CAMERA_TYPE}>
              {t('view.map.camera_type', { cam: t('camera') })}
            </Option>
            <Option value={CATEGORY_NAME.EVENT_TYPE}>
              {t('view.category.event_type')}
            </Option>
            <Option value={CATEGORY_NAME.TAGS}>
              {t('view.category.tags')}
            </Option>
          </Select>

          <Tooltip placement="top" title={t('add')}>
            <Button
              type="primary"
              onClick={() => {
                setSelectedCategoryId(null);
                setShowModal(true);
              }}
            >
              <PlusOutlined />
            </Button>
          </Tooltip>

        </div>
      </div>
    );
  };

  const handleBlur = (event) => {
    const value = event.target.value.trim();
    setSearch(value);
  };

  const handleSearch = async (value) => {
    setSearch(value);
    const data = {
      name: value
    };
    const dataSearch = await fetchOptionsData(data);
    setDataOptions(dataSearch);
  };

  const handleDelete = async (id, dataType) => {
    if (isEmpty(dataType)) {
      return [];
    }

    let isDelete = false;

    if (dataType === CATEGORY_NAME.AD_DIVISIONS) {
      isDelete = await AdDivisionApi.delete(id);
      const notifyMess = {
        type: 'success',
        title: '',
        description: `${t('noti.successfully_delete_administrative_category', {
          delete: t('delete')
        })}`
      };
      isDelete && Notification(notifyMess);
    }

    if (dataType === CATEGORY_NAME.CAMERA_TYPE) {
      isDelete = await CameraApi.deleteCameraType(id);

      const notifyMess = {
        type: 'success',
        title: '',
        description: `${t('noti.successfully_delete_camera_type', {
          delete: t('delete'),
          cam: t('camera')
        })}`
      };
      isDelete && Notification(notifyMess);
    }

    if (dataType === CATEGORY_NAME.VENDOR) {
      isDelete = await VendorApi.delete(id);
      const notifyMess = {
        type: 'success',
        title: '',
        description: `${t('noti.successfully_delete_camera_vendor', {
          delete: t('delete'),
          cam: t('camera')
        })}`
      };
      isDelete && Notification(notifyMess);
    }

    if (dataType === CATEGORY_NAME.FIELD) {
      isDelete = await FieldApi.deleteField(id);
      const notifyMess = {
        type: 'success',
        title: '',
        description: `${t('noti.successfully_delete_field', {
          delete: t('delete')
        })}`
      };
      isDelete && Notification(notifyMess);
    }

    if (dataType === CATEGORY_NAME.EVENT_TYPE) {
      isDelete = await EventApi.deleteEvent(id);
      const notifyMess = {
        type: 'success',
        title: '',
        description: `${t('noti.successfully_delete_event_type', {
          delete: t('delete')
        })}`
      };
      isDelete && Notification(notifyMess);
    }

    if (dataType === CATEGORY_NAME.TAGS) {
      isDelete = await TagApi.deleteTagById(id);
      const notifyMess = {
        type: 'success',
        title: '',
        description: `${t('noti.successfully_delete_tag_type', {
          delete: t('delete')
        })}`
      };
      isDelete && Notification(notifyMess);
    }
    const data = {
      name: ''
    };
    fetchOptionsData(data).then(setDataOptions);
  };

  const handleShowModalInfo = () => {
    setSelectedUnitId(null);
  };

  const { vendors, cameraTypes, adDivisions, field, eventTypes, tags } =
    dataOptions;

  const categoryColumns = [
    {
      title: `${t('view.storage.NO')}`,
      key: 'index',
      className: 'headerColums',
      width: '10%',
      render: (text, record, index) => index + 1
    },

    {
      title: `${t('view.category.category_name')}`,
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      // width: '50%',
      className: 'headerColums'
    },

    {
      title: `${t('view.storage.action')}`,
      className: 'headerColums',
      width: '12%',
      render: (_text, record) => {
        return (
          <Space>
            <Tooltip placement="top" title={t('view.common_device.edit')}>
              <EditOutlined
                style={{ fontSize: '16px', color: '#6E6B7B' }}
                onClick={() => {
                  setSelectedCategoryId(record.uuid);
                  setShowModal(true);
                }}
              />
            </Tooltip>
            <Tooltip placement="top" title={t('delete')}>
              <Popconfirm
                title={t('noti.delete_category', { this: t('this') })}
                onConfirm={() => handleDelete(record.uuid, dataType)}
              >
                <DeleteOutlined
                  style={{ fontSize: '16px', color: '#6E6B7B' }}
                />
              </Popconfirm>
            </Tooltip>

            {dataType === CATEGORY_NAME.AD_DIVISIONS && (
              <Tooltip placement="top" title={t('view.common_device.detail')}>
                <InfoCircleOutlined
                  style={{ fontSize: '16px', color: '#6E6B7B' }}
                  onClick={() => {
                    setSelectedUnitId(record.uuid);
                  }}
                />
              </Tooltip>
            )}
          </Space>
        );
      }
    }
  ];

  const addFieldColumn = {
    title: 'Lĩnh vực',
    dataIndex: 'fieldName',
    key: 'fieldName',
    width: '40%',

    className: 'headerColums'
  };

  const addTagColumns = [
    {
      title: 'Tên danh mục',
      dataIndex: 'key',
      key: 'key',
      className: 'headerColums'
    }
  ];

  if (dataType === CATEGORY_NAME.EVENT_TYPE) {
    categoryColumns.splice(2, 0, addFieldColumn);
  }

  if (dataType === CATEGORY_NAME.TAGS) {
    categoryColumns.splice(1, 1, ...addTagColumns);
  }

  const handleShowModalUpdateCategory = () => {
    let modalHtml = null;
    if (showModal) {
      if (dataType === CATEGORY_NAME.AD_DIVISIONS) {
        modalHtml = (
          <ModalEditAdministrativeUnit
            selectedCategoryId={selectedCategoryId}
            setShowModal={setShowModal}
          />
        );
      } else if (dataType === CATEGORY_NAME.TAGS) {
        modalHtml = (
          <ModalUpdateTag
            selectedCategoryId={selectedCategoryId}
            setShowModal={setShowModal}
          />
        );
      } else {
        modalHtml = (
          <ModalEditCategory
            dataType={dataType}
            selectedCategoryId={selectedCategoryId}
            setShowModal={setShowModal}
          />
        );
      }
    }
    return modalHtml;
  };

  return (
    <div className="tabs__container--category">
      <Breadcrumds
        url="/app/setting"
        nameParent={t('breadcrumd.setting')}
        nameChild={t('view.user.category_management')}
      />

      <Card
        title={getNameByCategory(dataType)}
        bodyStyle={bodyStyleCard}
        headStyle={headStyleCard}
        className="card--category"
      >
        <Table
          pagination={false}
          scroll={{ y: 500 }}
          rowKey="id"
          columns={categoryColumns}
          dataSource={getDataByCategory(dataType)}
          locale={{
            emptyText: `${t('view.user.detail_list.no_valid_results_found')}`
          }}
        />
      </Card>
      {handleShowModalUpdateCategory()}
      {selectedUnitId && (
        <ModalViewDetail
          selectedUnitId={selectedUnitId}
          handleShowModal={handleShowModalInfo}
        />
      )}
    </div>


  );
};

async function fetchOptionsData(data) {
  const payload = await Promise.all([
    AdDivisionApi.getAllAdDivision(data),
    CameraApi.getAllCameraTypes(data),
    VendorApi.getAllVendor(data),
    FieldApi.getAllFeild(data),
    EventApi.getAllEvent(data),
    TagApi.getAllTags(data)
  ]);

  return {
    adDivisions: payload[0],
    cameraTypes: payload[1],
    vendors: payload[2],
    field: payload[3],
    eventTypes: payload[4],
    tags: payload[5]
  };
}

export default withRouter(TableCategory);
