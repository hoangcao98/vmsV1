import { Col, Input, Popconfirm, Row, Tooltip, Form, Button, Select } from "antd";
import { FiBookmark, FiDownload, FiFilm, FiImage } from "react-icons/fi";
import moment from "moment";
import { RiDeleteBinLine } from "react-icons/ri";
import React, { useState, useEffect } from "react";
import { AiOutlineCheck, AiOutlineClose, AiOutlineEdit } from "react-icons/all";
import debounce from "lodash/debounce";
import _ from "lodash";
import { useTranslation } from 'react-i18next';
import {
    filterOption,
    normalizeOptions,
} from "../../common/select/CustomSelect";
import DepartmentApi from "../../../actions/api/department/DepartmentApi";
import AIEventsApi from "../../../actions/api/ai-events/AIEventsApi";



const formItemLayout = {
    wrapperCol: { span: 24 },
    labelCol: { span: 24 }
};

const InfoObjectPopoverContent = (props) => {
    const { t } = useTranslation();
    const DATA_FAKE_UNIT = {
        departments: [{ name: "", uuid: "" }],
    };
    const typeObjects = [
        {
            id: 'xemay',
            name: `${t('view.ai_events.type_object.xemay')}`,
        },
        {
            id: 'human',
            name: `${t('view.ai_events.type_object.human')}`,
        },
        {
            id: 'unknow',
            name: `${t('view.ai_events.type_object.unknow')}`,
        },

    ];

    const [form] = Form.useForm();

    const path = props.viewFileType === 0 ? props.fileCurrent.path : props.fileCurrent.pathFile;
    const [currNode, setCurrNode] = useState(props.fileCurrent.note);
    const [editMode, setEditMode] = useState(false);
    const [typeObject, setTypeObject] = useState(props.fileCurrent.typeObject);
    const { TextArea } = Input;
    const [departments, setDepartments] = useState([]);
    const [departmentId, setDepartmentId] = useState('');
    const [filterOptions, setFilterOptions] = useState(DATA_FAKE_UNIT);

    useEffect(() => {
        const data = {
            name: "",
          };
          DepartmentApi.getAllDepartment(data).then(setDepartments);
        fetchSelectOptions().then(setFilterOptions);
    }, []);

    const getRecordDate = () => {
        if (props.viewFileType === 0) {
            return props.fileCurrent.startRecordTime === -1 ? '' : moment(props.fileCurrent.startRecordTime * 1000).format("hh:mm DD/MM/YYYY");
        } else {
            return props.fileCurrent.violationTime === -1 ? '' : moment(props.fileCurrent.violationTime * 1000).format("hh:mm DD/MM/YYYY");
        }
    }

    const getCreatedTime = () => {
        if (props.viewFileType === 0) {
            return props.fileCurrent.createdTime === -1 ? '' : moment(props.fileCurrent.createdTime * 1000).format("hh:mm DD/MM/YYYY");
        } else {
            return props.fileCurrent.createdTime === -1 ? '' : moment(props.fileCurrent.createdTime).format("hh:mm DD/MM/YYYY");
        }
    }

    const changeNoteHandler = (event) => {
        setCurrNode(event.target.value);
    };

    const cancelChangeNoteHandler = () => {
        setCurrNode(props.fileCurrent.note);
        setEditMode(false);
    };

    const saveFileHandler = (isImportant, note) => {
        props.onEditFile(isImportant, note);
        setEditMode(false);
    };

    const handleSubmit = async (value) => {
        const payload = {...value,
            uuid: props.fileCurrent.uuid,
            cameraUuid: props.fileCurrent.cameraUuid
        };

        console.log("         value        ", value)

        try {
          const isEdit = await AIEventsApi.editInforOfEvent(props.fileCurrent.uuid, payload);

          if (isEdit) {
            const notifyMess = {
              type: 'success',
              title: '',
              description: `${t('noti.successfully_edit_nvr')}`
            };
            Notification(notifyMess);
          } else {
            const notifyMess = {
              type: 'error',
              title: '',
              description:
                'Đã xảy ra lỗi trong quá trình chỉnh sửa, hãy kiểm tra lại'
            };
            Notification(notifyMess);
          }
        } catch (error) {
          // message.warning(
          //   'Đã xảy ra lỗi trong quá trình chỉnh sửa, hãy kiểm tra lại'
          // );
          console.log(error);
        }


        // setTimeout(() => {
        //   setIsModalVisible(false);
        //   handleShowModalEdit();
        // }, 500);
    };

    const onChangeSelectTypeObject = async (type) => {
        setTypeObject(type);

        // await resetDistrictAndWardData();
    };

    const onChangeDepId = async (uuid) => {
        setDepartmentId(uuid);
        // form.setFieldsValue({ districtId: null, wardId: null });
    };

    return (
        <>
            <Form
                className="bg-grey"
                form={form}
                {...formItemLayout}
                onFinish={handleSubmit}
                initialValues={props.fileCurrent}
            >
                <Row gutter={24}>
                    <Col span={24}>
                        <Form.Item
                            label={t('view.ai_events.choose_obj')}
                            name={['type']}
                        >
                            <Select
                                dataSource={typeObjects}
                                onChange={(type) => onChangeSelectTypeObject(type)}
                                filterOption={filterOption}
                                options={normalizeOptions("name", "id", typeObjects)}
                                allowClear
                                placeholder={t("view.ai_events.choose_obj")}
                            />
                        </Form.Item>
                    </Col>

                    {

                        typeObject && typeObject === "xemay" ? (
                            <Col span={24}>
                                <Form.Item
                                    label={t('view.ai_events.plateNumber')}
                                    name={['plateNumber']}
                                    rules={[
                                    ]}
                                >
                                    <Input placeholder={t('view.ai_events.plateNumber')} />
                                </Form.Item>
                            </Col>
                        ) : null

                    }

                    {

                        typeObject && typeObject === "human" ? (
                            <Col span={24}>
                                <Form.Item
                                    label={t('view.ai_events.code')}
                                    name={['code']}
                                    rules={[
                                    ]}
                                >
                                    <Input placeholder={t('view.ai_events.code')} />
                                </Form.Item>
                            </Col>

                        ) : null

                    }
                    {

                        typeObject && typeObject === "human" ? (
                            <Col span={24}>
                                <Form.Item
                                    label={t('view.ai_events.name')}
                                    name={['name']}
                                    rules={[
                                    ]}
                                >
                                    <Input placeholder={t('view.ai_events.name')} />
                                </Form.Item>
                            </Col>
                        ) : null

                    }
                    {

                        typeObject && typeObject === "human" ? (
                            <Col span={24}>
                                <Form.Item
                                    label={t('view.ai_events.position')}
                                    name={['position']}
                                    rules={[
                                    ]}
                                >
                                    <Input placeholder={t('view.ai_events.position')} />
                                </Form.Item>
                            </Col>
                        ) : null

                    }
                    {

                        typeObject && typeObject === "human" ? (
                            <Col span={24}>
                                <Form.Item
                                    name={["departmentUuid"]}
                                    label={t("view.ai_events.department")}
                                    rules={[
                                        {
                                            required: true,
                                            message: `${t("view.map.required_field")}`,
                                        },
                                    ]}
                                >
                                    <Select
                                        showSearch
                                        dataSource={departments}
                                        onChange={(aDUnitId) => onChangeDepId(aDUnitId)}
                                        filterOption={filterOption}
                                        options={normalizeOptions("name", "uuid", departments)}
                                        placeholder={t("view.ai_events.department")}
                                        allowClear
                                    />
                                </Form.Item>
                            </Col>
                        ) : null

                    }


                </Row>
                <Row className="row--submit">
                    <div className="submit" style={{marginTop:'30px'}}>
                        <Button type="primary" htmlType="submit ">
                            {t('view.user.detail_list.confirm')}
                        </Button>
                    </div>
                </Row>
            </Form>

        </>
    )
};

function infoObjectPopoverContentPropsAreEqual(prevPopContent, nextPopContent) {
    return _.isEqual(prevPopContent.fileCurrent, nextPopContent.fileCurrent);
}

async function fetchSelectOptions() {
    const data = {
        name: "",
    };
    const departments = await DepartmentApi.getAllDepartment(data);
    console.log('ccccccccccc', departments)
    return {
        departments,
    };
}

export const MemoizedInfoObjectPopoverContent = React.memo(InfoObjectPopoverContent, infoObjectPopoverContentPropsAreEqual);