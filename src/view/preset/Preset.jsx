import {
    CheckOutlined,
    CloseOutlined,
    DeleteOutlined,
    DownOutlined,
    EyeOutlined,
    LeftOutlined,
    MenuOutlined,
    MinusOutlined,
    PlusOutlined,
    RightOutlined,
    UpOutlined,
    PlayCircleOutlined
} from "@ant-design/icons";
import { AutoComplete, Button, Image, Space, Spin, Table } from "antd";
import { arrayMoveImmutable } from "array-move";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { AiOutlinePlaySquare } from "react-icons/all";
import {
    sortableContainer,
    sortableElement,
    sortableHandle,
} from "react-sortable-hoc";
import playCamApi from "../../api/camproxy/cameraApi";
import ptzControllerApi from "../../api/ptz/ptzController";
import arrow from "../../assets/img/icons/preset/arrow.png";
import controlIcon from "../../assets/img/icons/preset/control.png";
import Notification from "../../components/vms/notification/Notification";
import getServerCamproxyForPlay from "../../utility/vms/camera";
import { NOTYFY_TYPE } from "../common/vms/Constant";
import "./Preset.scss";
import { useTranslation } from 'react-i18next';

const Preset = (props) => {
    const { idCamera } = props;
    useLayoutEffect(() => {
    }, []);
    const [rowsPreset, setRowsPreset] = useState([]);
    const [presetTourDatas, setPresetTourDatas] = useState([]);
    const [indexPresetTourChoosed, setIndexPresetTourChoosed] = useState(0);
    const [callPresetAgain, setCallPresetAgain] = useState(false);
    const [callPresetTourAgain, setCallPresetTourAgain] = useState(false);
    const [visiblePresetInPresetTour, setVisiblePresetInPresetTour] =
        useState(false);
    const [selectedPreset, setSelectedPreset] = useState([]);
    const [isAddNewPresetTour, setIsAddNewPresetTour] = useState(false);
    const [isDeletePreset, setIsDeletePreset] = useState(false);
    const [isPresetLastDeleted, setIsPresetLastDeleted] = useState(false);
    const [isDisableButtonAddPresetToPresetTour, setIsDisableButtonAddPresetToPresetTour] = useState(true)
    const [isPlayCamera, setIsPlayCamera] = useState(false)
    const [isActionIsStart, setIsActionStart] = useState(false)
    const { t } = useTranslation();

    // const [newPresetTour, setNewPresetTour] = useState([]);


    const convertRowsPreset = (rowsPreset) => {
        return rowsPreset.map((row, index) => {
            return {
                key: index,
                index: index,
                STT: index + 1,
                name: row?.name,
                idPreset: row?.idPreset,
                speed: 1,
            };
        });
    };

    const convertPresetTourDatas = (datas) => {
        const newPresetTourData = datas.map((item, index) => {
            return {
                index: index,
                idPresetTour: item?.idPresetTour,
                name: item?.name,
                listPoint: item?.listPoint.map((point, index) => {
                    return {
                        index: index,
                        STT: index + 1,
                        idPreset: point?.idPreset,
                        name: point?.name,
                        timeDelay: point?.timeDelay,
                        speed: point?.speed,
                    };
                }),
            };
        });

        return newPresetTourData;
    };


    const DEFAULT_VALUE_PRESET = [
        { key: 0, index: 0, STT: 0, name: "", idPreset: "", speed: 1 },
    ];

    const DEFAULT_VALUE_PRESET_TOUR = [
        {
            index: 0,
            idPresetTour: 0,
            name: "",
            listPoint: [
                { index: 0, STT: 0, idPreset: 0, name: "", timeDelay: 0, speed: 1 },
            ],
        },
    ];

    const getAllPreset = async (params) => {
        if (idCamera) {
            const payload = await ptzControllerApi.getAllPreset(params);
            if (payload == null) {
                setRowsPreset(DEFAULT_VALUE_PRESET);
                return
            }
            const rowsPreset = convertRowsPreset(payload.data);
            setRowsPreset(rowsPreset)
        }
    }
    const getAllPresetTour = async (params) => {
        if (idCamera) {
            const payload = await ptzControllerApi.getAllPresetTour(params);
            if (payload == null) {
                setPresetTourDatas(DEFAULT_VALUE_PRESET_TOUR);
                return
            }
            setPresetTourDatas(convertPresetTourDatas(payload.data));
        }
    }
    //call api get all preset
    useEffect(() => {
        console.log('useEffect:callPresetAgain:', callPresetTourAgain)
        let params = {
            cameraUuid: idCamera,
        };
        getAllPreset(params)
    }, [callPresetAgain]);

    //call api get call preset tour
    useEffect(() => {
        console.log('useEffect:callPresetTourAgain:', callPresetTourAgain)
        let params = {
            cameraUuid: idCamera,
        };
        getAllPresetTour(params)
    }, [callPresetTourAgain]);

    //cho viec them preset tour
    useEffect(() => {
        console.log('useEffect:presetTourDatas:', presetTourDatas.length)
        if (isAddNewPresetTour) {
            setIndexPresetTourChoosed(presetTourDatas.length - 1);
            setIsAddNewPresetTour(false);
            document.getElementById("choose__preset-tour").value =
                presetTourDatas.length - 1;
            setVisiblePresetInPresetTour(true);
        }
    }, [presetTourDatas.length]);

    //cho viec xoa preset set lam anh huong den preset tour
    useEffect(() => {
        console.log('useEffect:rowsPreset:', rowsPreset.length)
        if (isDeletePreset) {
            const valueSelect = document.getElementById("choose__preset-tour").value;
            console.log('after check')
            console.log('after isPresetLastDeleted', isPresetLastDeleted)
            console.log('after preset tour data', presetTourDatas)

            if (valueSelect === "" || valueSelect === "none") {
                setIsDeletePreset(false);
                return;
            }

            if (isPresetLastDeleted) {
                console.log('after preset tour data', presetTourDatas)
                // if(indexPresetTourChoosed === presetTourDatas.length)
                document.getElementById('choose__preset-tour').value = ''
                document.getElementById('name__preset-tour').value = ''
                setVisiblePresetInPresetTour(false)
                setIndexPresetTourChoosed(0);
                setIsDisableButtonAddPresetToPresetTour(true)
                setIsPresetLastDeleted(false);
                setIsDeletePreset(false);

                return;
            }
            setIsDeletePreset(false);
            return;
        }


    }, [rowsPreset.length]);
    useEffect(() => {
        console.log('bye')

        if (isPlayCamera) {
            playCameraOnline(idCamera)
        } else {
            closeCamera()
        }
    }, [isPlayCamera])
    //begin: selection
    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            console.log("selecttion row", selectedRows);
            setSelectedPreset(selectedRows);
        },
        getCheckboxProps: (record) => ({
            name: record.name,
        }),
    };
    //end: selection

    //begin: for sort
    const DragHandle = sortableHandle(() => (
        <MenuOutlined style={{ cursor: "grab", color: "#999" }} />
    ));

    const SortableItem = sortableElement((props) => <tr {...props} />);
    const SortableContainer = sortableContainer((props) => <tbody {...props} />);
    const onChangOrderPreset = async ({ oldIndex, newIndex }) => {
        const datas = JSON.parse(JSON.stringify(presetTourDatas));
        if (oldIndex !== newIndex) {
            const newData = arrayMoveImmutable(
                [].concat(datas[indexPresetTourChoosed].listPoint),
                oldIndex,
                newIndex
            ).filter((el) => !!el);
            const changeIndexDatas = newData.map((item, index) => {
                return { ...item, STT: index + 1, index: index };
            });
            datas[indexPresetTourChoosed].listPoint = changeIndexDatas;
            const body = {
                cameraUuid: idCamera,
                name: presetTourDatas[indexPresetTourChoosed].name,
                listPoint: datas[indexPresetTourChoosed].listPoint,
                idPresetTour: datas[indexPresetTourChoosed].idPresetTour,
            };
            try {
                const pload = await ptzControllerApi.postSetPresetTour(body);
                if (pload == null) {
                    return
                }
                setPresetTourDatas(datas);
                console.log("thay doi thu tu preset thanh cong");
                const warnNotyfi = {
                    type: NOTYFY_TYPE.success,
                    title: "Thành công",
                    description: "Bạn đã thay đổi thứ tự preset thành công",
                    duration: 2,
                };
                Notification(warnNotyfi);

            } catch (error) {
                const warnNotyfi = {
                    type: NOTYFY_TYPE.warning,
                    description: "Đã xảy ra lỗi",
                    duration: 2,
                };
                Notification(warnNotyfi);
                console.log(error);
            }
        }
    };
    const DraggableContainer = (props) => (
        <SortableContainer
            useDragHandle
            disableAutoscroll
            helperClass='row-dragging'
            onSortEnd={onChangOrderPreset}
            {...props}
        />
    );
    const DraggableBodyRow = ({ className, style, ...restProps }) => {
        // function findIndex base on Table rowKey props and should always be a right array index
        // console.log(
        //   "presetTourDatas[indexPresetTourChoosed].listPoint",
        //   presetTourDatas[indexPresetTourChoosed].listPoint
        // );
        const index = presetTourDatas[indexPresetTourChoosed]?.listPoint.findIndex(
            (x) => x.index === restProps["data-row-key"]
        );
        return <SortableItem index={index} {...restProps} />;
        // return <SortableItem {...restProps} />;
    };
    //end: for sort

    const playCameraOnline = async (camUuid) => {
        console.log('playCameraOnline:', camUuid)
        if (camUuid === "" || camUuid == null) {
            Notification({
                type: NOTYFY_TYPE.warning,
                title: "Xem trực tiếp",
                description: "Camera không xác định",
            });
            return;
        }
        const data = await getServerCamproxyForPlay(camUuid);
        if (data == null) {
            Notification({
                type: NOTYFY_TYPE.warning,
                title: "Xem trực tiếp",
                description: "Không nhận địa chỉ camproxy lỗi",
            });
            return;
        }

        const pc = new RTCPeerConnection();
        pc.addTransceiver("video");
        pc.oniceconnectionstatechange = () => {
        };
        const spin = document.getElementById("spin-slot-1");
        pc.ontrack = (event) => {
            //binding and play
            const cell = document.getElementById("ptz-slot");
            if (cell) {
                cell.srcObject = event.streams[0];
                cell.autoplay = true;
                cell.controls = false;
                cell.style = "width:100%;height:100%;display:block;object-fit:cover;";
                console.log("binding cell", cell, event.streams);
                spin.style.display = "none";
            }

        };
        const token = "123";
        const API = data.camproxyApi;

        pc.createOffer({
            iceRestart: false,
        })
            .then((offer) => {
                spin.style.display = "block";
                pc.setLocalDescription(offer).then((r) => {
                    console.log("set local description", r);
                });
                //call api
                playCamApi
                    .playCamera(API, {
                        token: token,
                        camUuid: camUuid,
                        offer: offer,
                    })
                    .then((res) => {
                        console.log("res:", res);
                        if (res) {
                            pc.setRemoteDescription(res).then((r) => {
                                console.log("set remote description", r);
                            });
                        } else {
                            console.log("get response failed", res);
                            spin.style.display = "none";
                            Notification({
                                type: NOTYFY_TYPE.warning,
                                title: "Xem trực tiếp",
                                description: "Nhận offer từ server bị lỗi",
                            });
                        }
                    });
            })
            .catch((error) => {
                console.log("error:", error);
                spin.style.display = "none";
            })
            .catch(alert)
            .finally(() => {
            });
    };

    const closeCamera = () => {
        const cell = document.getElementById("video-slot-1");
        cell.srcObject = null;
        cell.style.display = "none";
    };



    const onPanLeftStart = async () => {
        const payload = {
            cameraUuid: idCamera,
            direction: "left",
            isStop: 0,
            speed: 1,
        };
        try {
            setIsActionStart(true)
            const isPost = await ptzControllerApi.postPan(payload);
        } catch (error) {
            console.log(error);
        }
    };

    const onPanLeftEnd = async () => {
        const payload = {
            cameraUuid: idCamera,
            direction: "left",
            isStop: 1,
            speed: 1,
        };
        try {
            if (isActionIsStart) {
                const isPost = await ptzControllerApi.postPan(payload);
                setIsActionStart(false)
            }
        } catch (error) {
            console.log(error);
        }
    };

    const onPanRightStart = async () => {
        const payload = {
            cameraUuid: idCamera,
            direction: "right",
            isStop: 0,
            speed: 1,
        };
        try {
            setIsActionStart(true)
            const isPost = await ptzControllerApi.postPan(payload);
        } catch (error) {
            console.log(error);
        }
    };

    const onPanRightEnd = async () => {
        const payload = {
            cameraUuid: idCamera,
            direction: "right",
            isStop: 1,
            speed: 1,
        };
        try {
            if (isActionIsStart) {
                const isPost = await ptzControllerApi.postPan(payload);
                setIsActionStart(false)
            }
        } catch (error) {
            console.log(error);
        }
    };

    const onTiltUpStart = async () => {
        const payload = {
            cameraUuid: idCamera,
            direction: "up",
            isStop: 0,
            speed: 1,
        };
        try {
            setIsActionStart(true)
            const isPost = await ptzControllerApi.postTilt(payload);
        } catch (error) {
            console.log(error);
        }
    };

    const onTiltUpEnd = async () => {
        const payload = {
            cameraUuid: idCamera,
            direction: "up",
            isStop: 1,
            speed: 1,
        };
        try {
            if (isActionIsStart) {
                const isPost = await ptzControllerApi.postTilt(payload);
                setIsActionStart(false)
            }
        } catch (error) {
            console.log(error);
        }
    };

    const onTiltDownStart = async () => {
        const payload = {
            cameraUuid: idCamera,
            direction: "down",
            isStop: 0,
            speed: 1,
        };
        try {
            setIsActionStart(true)
            const isPost = await ptzControllerApi.postTilt(payload);
        } catch (error) {
            console.log(error);
        }
    };

    const onTiltDownEnd = async () => {
        const payload = {
            cameraUuid: idCamera,
            direction: "down",
            isStop: 1,
            speed: 1,
        };
        try {
            if (isActionIsStart) {
                const isPost = await ptzControllerApi.postTilt(payload);
                setIsActionStart(false)
            }
        } catch (error) {
            console.log(error);
        }
    };

    const onZoomInStart = async () => {
        const payload = {
            cameraUuid: idCamera,
            direction: "in",
            isStop: 0,
            speed: 1,
        };
        try {
            setIsActionStart(true)
            const isPost = await ptzControllerApi.postZoom(payload);
        } catch (error) {
            console.log(error);
        }
    };

    const onZoomInEnd = async () => {
        const payload = {
            cameraUuid: idCamera,
            direction: "in",
            isStop: 1,
            speed: 1,
        };
        try {
            if (isActionIsStart) {
                const isPost = await ptzControllerApi.postZoom(payload);
                setIsActionStart(false)
            }
        } catch (error) {
            console.log(error);
        }
    };

    const onZoomOutStart = async () => {
        const payload = {
            cameraUuid: idCamera,
            direction: "out",
            isStop: 0,
            speed: 1,
        };
        try {
            setIsActionStart(true)
            const isPost = await ptzControllerApi.postZoom(payload);
        } catch (error) {
            console.log(error);
        }
    };
    const onZoomOutEnd = async () => {
        const payload = {
            cameraUuid: idCamera,
            direction: "out",
            isStop: 1,
            speed: 1,
        };
        try {
            if (isActionIsStart) {
                const isPost = await ptzControllerApi.postZoom(payload);
                setIsActionStart(false)
            }
        } catch (error) {
            console.log(error);
        }
    };

    // var lastPress = 0;
    // console.log('document', document)
    // document.onkeydown = (e) => {
    //     var now = Date.now();
    //     if (now - lastPress < 700) {
    //         lastPress = now
    //         return;
    //     }
    //     lastPress = now
    //     switch (e.keyCode) {
    //         case 37:
    //             onPanLeftStart()
    //             break
    //         case 38:
    //             onTiltUpStart()
    //             break
    //         case 39:
    //             onPanRightStart()
    //             break
    //         case 40:
    //             onTiltDownStart()
    //             break
    //     }

    // }


    // document.onkeyup = (e) => {
    //     switch (e.keyCode) {
    //         case 37:
    //             onPanLeftEnd()
    //             break
    //         case 38:
    //             onTiltUpEnd()
    //             break
    //         case 39:
    //             onPanRightEnd()
    //             break
    //         case 40:
    //             onTiltDownEnd()
    //             break
    //     }

    // }


    const handleDeletePreset = async (record) => {
        console.log("call api delete preset thanh cong");
        const currRowsPreset = JSON.parse(JSON.stringify(rowsPreset));
        const newRowsPreset = currRowsPreset.filter(
            (item) => item.key !== record.key
        );
        console.log("delete preset data", newRowsPreset);
        console.log('curr preset', rowsPreset)

        //begin: check preset tour hien tai co phan tu bi xoa hay ko, va phan tu do co la phan tu duy nhat cua preset tour khong
        const curPresetTourDatas = JSON.parse(JSON.stringify(presetTourDatas));
        const listPoint = curPresetTourDatas[indexPresetTourChoosed].listPoint;
        // bien check kiem tra xem listpoint cua preset tour:
        // co phan tu bi xoa hay ko, va phan tu do co la phan tu duy nhat cua preset tour khong duy nhat
        // false: nguoc lai
        let check = true;
        let idPresetFirstElement = listPoint[0].idPreset;
        console.log('idPresetFirstElement', idPresetFirstElement)
        for (let item of listPoint) {
            if (
                item.idPreset !== idPresetFirstElement ||
                item.idPreset !== record.idPreset
            ) {
                check = false;
                break;
            }
        }
        setIsPresetLastDeleted(check);
        //end: check preset tour hien tai co phan tu bi xoa hay ko, va phan tu do co la phan tu duy nhat cua preset tour khong
        const body = {
            cameraUuid: idCamera,
            idPreset: record.idPreset,
        };
        try {
            const data = await ptzControllerApi.postDeletePreset(body);
            if (data) {
                setIsDeletePreset(true)
                setRowsPreset(convertRowsPreset(newRowsPreset));
                setCallPresetTourAgain(!callPresetTourAgain);

                for (let item of newRowsPreset) {
                    document.getElementById(`input-name-preset-${item.idPreset}`).value =
                        item.name;
                }
                const warnNotyfi = {
                    type: NOTYFY_TYPE.success,
                    title: "Thành công",
                    description: "Bạn đã xoá preset thành công ",
                    duration: 2,
                };
                Notification(warnNotyfi);
            } else {
                const warnNotyfi = {
                    type: NOTYFY_TYPE.warning,
                    title: "Thất bại",
                    description: data.message,
                    duration: 2,
                };
                Notification(warnNotyfi);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleSetPreset = async () => {
        const payload = {
            cameraUuid: idCamera,
            name: "new name",
        };
        try {
            const pload = await ptzControllerApi.postSetPreset(payload);
            if (pload === null) {
                return
            }
            setCallPresetAgain(!callPresetAgain);
            const warnNotyfi = {
                type: NOTYFY_TYPE.success,
                title: "Thành công",
                description: "Bạn đã thiết lập preset thành công",
                duration: 2,
            };
            Notification(warnNotyfi);
        } catch (error) {
            const warnNotyfi = {
                type: NOTYFY_TYPE.warning,
                description: "Đã xảy ra lỗi",
                duration: 2,
            };
            Notification(warnNotyfi);
            console.log(error);
        }
    };

    const handleAddPreset = async () => {
        const datas = JSON.parse(JSON.stringify(selectedPreset));
        const newPresetTourDatas = JSON.parse(JSON.stringify(presetTourDatas));
        const valueSelect = document.getElementById("choose__preset-tour").value;

        //neu chua chon preset tour thi tao preset tour moi
        if (valueSelect === "none") {
            const convertListPoint = datas.map((point, index) => {
                return {
                    index: index,
                    STT: index + 1,
                    idPreset: point.idPreset,
                    name: point.name,
                    timeDelay: point.timeDelay || 5,
                    speed: point.speed,
                };
            });

            const body = {
                cameraUuid: idCamera,
                name: "new preset tour",
                listPoint: convertListPoint,
                idPresetTour: "",
            };
            try {
                const pload = await ptzControllerApi.postSetPresetTour(body);
                if (pload == null) {
                    return
                }
                setIsAddNewPresetTour(true);
                setCallPresetTourAgain(!callPresetTourAgain);
                document.getElementById("name__preset-tour").value =
                    "new preset tour";

                console.log("add preset vao preset tour thanh cong");
                const warnNotyfi = {
                    type: NOTYFY_TYPE.success,
                    title: "Thành công",
                    description: "Bạn đã thêm mới một preset thành công",
                    duration: 2,
                };
                Notification(warnNotyfi);

            } catch (error) {
                const warnNotyfi = {
                    type: NOTYFY_TYPE.warning,
                    title: "Thất bại",
                    description: "Đã xảy ra lỗi",
                    duration: 2,
                };
                Notification(warnNotyfi);
                console.log(error);
            }
        }
        //neu da chon preset tour thi them preset vao preset tour
        else {
            const newListPoint = newPresetTourDatas[indexPresetTourChoosed].listPoint;
            for (let item of datas) {
                newListPoint.push(item);
            }
            console.log("newlistpoint", newListPoint);
            const convertListPoint = newListPoint.map((point, index) => {
                return {
                    index: index,
                    STT: index + 1,
                    idPreset: point.idPreset,
                    name: point.name,
                    timeDelay: point.timeDelay || 5,
                    speed: point.speed,
                };
            });
            newPresetTourDatas[indexPresetTourChoosed].listPoint = convertListPoint;
            console.log("new Preset Tour Datas", newPresetTourDatas);

            const body = {
                cameraUuid: idCamera,
                name: presetTourDatas[indexPresetTourChoosed].name,
                listPoint: newPresetTourDatas[indexPresetTourChoosed].listPoint,
                idPresetTour: newPresetTourDatas[indexPresetTourChoosed].idPresetTour,
            };
            try {
                const pload = await ptzControllerApi.postSetPresetTour(body);
                if (pload == null) {
                    return
                }
                setPresetTourDatas(newPresetTourDatas);
                console.log("add preset vao preset tour thanh cong");
                const warnNotyfi = {
                    type: NOTYFY_TYPE.success,
                    title: "Thành công",
                    description: "Bạn đã thêm preset thành công",
                    duration: 2,
                };
                Notification(warnNotyfi);

            } catch (error) {
                const warnNotyfi = {
                    type: NOTYFY_TYPE.warning,
                    title: "Thất bại",
                    description: "Đã xảy ra lỗi",
                    duration: 2,
                };
                Notification(warnNotyfi);
                console.log(error);
            }
        }
    };

    const handleDoneRenamePreset = async (e, record) => {
        const value = document.getElementById(
            `input-name-preset-${record.idPreset}`
        ).value;
        console.log("value name", value);
        if (value.length >= 100) {
            //validate
            const warnNotyfi = {
                type: NOTYFY_TYPE.warning,
                title: "Thất bại",
                description: "Độ dài tên cần nhỏ hơn 100 kí tự",
                duration: 2,
            };
            Notification(warnNotyfi);
            console.log("lỗi đổi tên");
        } else {
            const body = {
                cameraUuid: idCamera,
                idPreset: record.idPreset,
                name: value,
            };
            try {
                const pload = await ptzControllerApi.postRenamePreset(body);
                if (pload == null) {
                    return
                }
                console.log("call api rename thanh cong");
                document.getElementById(
                    `rename__preset-${record.idPreset}`
                ).style.display = "none";
                const newRowsPreset = JSON.parse(JSON.stringify(rowsPreset));
                const index = newRowsPreset.findIndex(
                    (item) => record.key === item.key
                );
                const item = newRowsPreset[index];
                newRowsPreset.splice(index, 1, { ...item, name: value });
                setRowsPreset(newRowsPreset);
                setCallPresetTourAgain(!callPresetTourAgain);
                const warnNotyfi = {
                    type: NOTYFY_TYPE.success,
                    title: "Thành công",
                    description: "Bạn đã đổi tên preset thành công",
                    duration: 2,
                };
                Notification(warnNotyfi);

            } catch (error) {
                const warnNotyfi = {
                    type: NOTYFY_TYPE.warning,
                    description: "Đã xảy ra lỗi",
                    duration: 2,
                };
                Notification(warnNotyfi);
                console.log(error);
            }
        }
    };

    const handleCloseRenamePreset = (e, record) => {
        e.stopPropagation();
        document.getElementById(`input-name-preset-${record.idPreset}`).value =
            rowsPreset[record.index].name;
        document.getElementById(`rename__preset-${record.idPreset}`).style.display =
            "none";
    };

    const handleCallPreset = async (record) => {
        const body = {
            cameraUuid: idCamera,
            idPreset: record.idPreset,
        };
        try {
            const pload = await ptzControllerApi.postCallPreset(body);
        } catch (error) {
            console.log(error);
        }
    };

    const onChangeOptionSetPresetInPresetTour = async (e) => {
        const value = e.target.value;
        const valueSelect = document.getElementById("choose__preset-tour").value;
        if (valueSelect === "none") {
            setVisiblePresetInPresetTour(false)
            document.getElementById("name__preset-tour").value = "";
            setIsDisableButtonAddPresetToPresetTour(false)
        }
        // else if(valueSelect === ""){
        //   setVisiblePresetInPresetTour(false);
        //   document.getElementById("name__preset-tour").value = "";

        // }
        else {
            setIsDisableButtonAddPresetToPresetTour(false);
            document.getElementById("name__preset-tour").value =
                presetTourDatas[value].name;
            setIndexPresetTourChoosed(value);
            setVisiblePresetInPresetTour(true);

            const body = {
                cameraUuid: idCamera,
                idPresetTour: presetTourDatas[value].idPresetTour,
            };
            try {
                const pload = await ptzControllerApi.postCallPresetTour(body);

            } catch (error) {
                console.log(error);
            }
        }
    };

    const handleChangeTimeDelay = async (e, record) => {
        const value = e.target.value;
        const datas = JSON.parse(JSON.stringify(presetTourDatas));
        const index = datas[indexPresetTourChoosed].listPoint.findIndex(
            (item, index) => item.index == record.index
        );
        const data = datas[indexPresetTourChoosed].listPoint[index];
        data.timeDelay = value;
        datas[indexPresetTourChoosed].listPoint.splice(index, 1, data);

        const body = {
            cameraUuid: idCamera,
            name: presetTourDatas[indexPresetTourChoosed].name,
            listPoint: datas[indexPresetTourChoosed].listPoint,
            idPresetTour: datas[indexPresetTourChoosed].idPresetTour,
        };
        try {
            const pload = await ptzControllerApi.postSetPresetTour(body);
            if (pload == null) {
                return
            }
            setPresetTourDatas(datas);

        } catch (error) {
            console.log(error);
        }
    };

    const handleDoneRenamePresetTour = async (e) => {
        const value = document.getElementById("name__preset-tour").value;
        const body = {
            cameraUuid: idCamera,
            idPresetTour: presetTourDatas[indexPresetTourChoosed].idPresetTour,
            name: value,
        };
        try {
            const pload = await ptzControllerApi.postRenamePresetTour(body);
            if (pload == null) {
                return
            }
            document.getElementById("rename__preset-tour").style.display = "none";
            document.getElementById("delete__preset-tour").style.display = "flex";
            const newPresetTourDatas = JSON.parse(JSON.stringify(presetTourDatas));
            newPresetTourDatas[indexPresetTourChoosed].name = value;
            setPresetTourDatas(newPresetTourDatas);
            const warnNotyfi = {
                type: NOTYFY_TYPE.success,
                title: "Thành công",
                description: "Bạn đã đổi tên preset tour thành công",
                duration: 2,
            };
            Notification(warnNotyfi);

        } catch (error) {
            console.log(error);
        }
    };

    const handleCloseRenamePresetTour = (e) => {
        document.getElementById("rename__preset-tour").style.display = "none";
        document.getElementById("delete__preset-tour").style.display = "flex";
        document.getElementById("name__preset-tour").value =
            presetTourDatas[indexPresetTourChoosed].name;
    };

    const handleDeletePresetInPresetTour = async (record) => {
        const newPresetTourDatas = JSON.parse(JSON.stringify(presetTourDatas));
        newPresetTourDatas[indexPresetTourChoosed].listPoint = newPresetTourDatas[indexPresetTourChoosed].listPoint.filter(
            (item) => item.index != record.index
        );

        const newDatas = convertPresetTourDatas(newPresetTourDatas);
        console.log("new preset tour datas", newDatas);

        const body = {
            cameraUuid: idCamera,
            name: newDatas[indexPresetTourChoosed].name,
            listPoint: newDatas[indexPresetTourChoosed].listPoint,
            idPresetTour: newDatas[indexPresetTourChoosed].idPresetTour,
        };
        try {
            const pload = await ptzControllerApi.postSetPresetTour(body);
            if (pload == null) {
                return
            }
            setPresetTourDatas(newDatas);
            console.log("Thay doi thoi gian delay thanh cong");
            const warnNotyfi = {
                type: NOTYFY_TYPE.success,
                title: "Thành công",
                description: "Bạn đã đổi xoá preset thành công",
                duration: 2,
            };
            Notification(warnNotyfi);

        } catch (error) {
            console.log(error);
        }
    };

    const handleDeletePresetTour = async () => {
        const curPresetTourDatas = JSON.parse(JSON.stringify(presetTourDatas));
        const newPresetTourDatas = curPresetTourDatas.filter(
            (item) =>
                item.idPresetTour !==
                presetTourDatas[indexPresetTourChoosed].idPresetTour
        );
        console.log("newdeletedata", newPresetTourDatas);

        const body = {
            cameraUuid: idCamera,
            idPresetTour: presetTourDatas[indexPresetTourChoosed].idPresetTour,
        };

        try {
            const pload = await ptzControllerApi.postDeletePresetTour(body);
            if (pload == null) {
                return
            }
            const warnNotyfi = {
                type: NOTYFY_TYPE.success,
                title: "Thành công",
                description: "Bạn đã xoá preset tour thành công",
                duration: 2,
            };
            Notification(warnNotyfi);
            setVisiblePresetInPresetTour(false);
            setPresetTourDatas(convertPresetTourDatas(newPresetTourDatas));
            setIndexPresetTourChoosed(0);
            setIsDisableButtonAddPresetToPresetTour(true)
            document.getElementById("choose__preset-tour").value = "";
            document.getElementById("name__preset-tour").value = "";

        } catch (error) {
            console.log(error);
        }
        // const new
    };

    const handleFocusInputNamePreset = (record) => {
        console.log("hello");
        document.getElementById(`rename__preset-${record.idPreset}`).style.display =
            "flex";
    };

    const handleFocusNamePresetTour = (e) => {
        document.getElementById("rename__preset-tour").style.display = "flex";
        document.getElementById("delete__preset-tour").style.display = "none";
    };

    const columnsTablePreset = [
        {
            title: `${t('view.storage.NO')}`,
            dataIndex: "STT",
            key: "STT",
            width: "8%",
        },
        {
            title: `${t('view.live.preset_name')}`,
            width: "66%",
            render: (text, record) => {
                return (
                    <>
                        <input
                            id={`input-name-preset-${record.idPreset}`}
                            defaultValue={record?.name}
                            onFocus={(e) => handleFocusInputNamePreset(record)}
                            autoComplete='off'
                        />
                        <span
                            id={`rename__preset-${record.idPreset}`}
                            style={{ display: "none" }}
                        >
                            <CheckOutlined
                                id={`confirm-done-icon-rename-${record.idPreset}`}
                                onClick={(e) => {
                                    // console.log("click check");
                                    e.stopPropagation();
                                    handleDoneRenamePreset(e, record);
                                }}
                            />
                            <CloseOutlined
                                id={`confirm-close-icon-rename-${record.idPreset}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCloseRenamePreset(e, record);
                                }}
                            />
                        </span>
                    </>
                );
            },
        },
        {
            title: `${t('view.storage.action')}`,
            width: "20%",
            render: (text, record) => {
                // const record = record;
                return (
                    <Space>
                        <Button
                            icon={<EyeOutlined />}
                            onClick={(e) => handleCallPreset(record)}
                        />
                        <Button
                            icon={<DeleteOutlined />}
                            onClick={(e) => handleDeletePreset(record)}
                        />
                    </Space>
                );
            },
        },
    ];
    const columnsTablePresetTour = [
        {
            title: "",
            dataIndex: "sort",
            width: "6%",
            className: "drag-visible",
            render: () => <DragHandle />,
        },
        {
            title: `${t('view.storage.NO')}`,
            dataIndex: "STT",
            key: "STT",
            width: "8%",
        },
        {
            title: `${t('view.live.preset_name')}`,
            dataIndex: "name",
            key: "name",
            width: "42%",
        },
        {
            title: `${t('view.live.time')}`,
            dataIndex: "timeDelay",
            width: "15%",
            render: (text, record) => {
                return (
                    <div>
                        <select
                            defaultValue={record.timeDelay}
                            onChange={(e) => handleChangeTimeDelay(e, record)}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                            <option value={30}>30</option>
                        </select>
                        <span>giây</span>
                    </div>
                );
            },
        },
        {
            title: `${t('view.storage.action')}`,
            width: "17%",
            render: (text, record) => {
                // const record = record;
                return (
                    <Space>
                        <Button
                            icon={<DeleteOutlined />}
                            onClick={(e) => handleDeletePresetInPresetTour(record)}
                        />
                    </Space>
                );
            },
        },
    ];

    const presetTourSelect = [];
    for (let item of presetTourDatas) {
        console.log("select", item);
        presetTourSelect.push(<option value={item.index}>{item.name}</option>);
    }
    return (
        <div className='preset__container'>
            <div className='setting__preset'>
                <div className='camera__control'>
                    <div className='camera__direction'>
                        <Button
                            className='left'
                            icon={<LeftOutlined />}
                            onMouseDown={onPanLeftStart}
                            onMouseUp={onPanLeftEnd}
                            onMouseLeave={onPanLeftEnd}

                        />
                        <Button
                            className='right'
                            icon={<RightOutlined />}
                            onMouseDown={onPanRightStart}
                            onMouseUp={onPanRightEnd}
                            onMouseLeave={onPanRightEnd}

                        />
                        <Button
                            className='up'
                            icon={<UpOutlined />}
                            onMouseDown={onTiltUpStart}
                            onMouseUp={onTiltUpEnd}
                            onMouseLeave={onTiltUpEnd}

                        />
                        <Button
                            className='down'
                            icon={<DownOutlined />}
                            onMouseDown={onTiltDownStart}
                            onMouseUp={onTiltDownEnd}
                            onMouseLeave={onTiltDownEnd}
                        />
                        <Button
                            className='play-camera'
                            onClick={() => {
                                console.log('hello')
                                setIsPlayCamera(!isPlayCamera)
                            }}
                            icon={<PlayCircleOutlined />}
                        >
                        </Button>
                    </div>
                    <div className='camera__zoom'>
                        <Button
                            className='plus'
                            icon={<PlusOutlined />}
                            onMouseDown={onZoomInStart}
                            onMouseUp={onZoomInEnd}
                        />
                        <span className='zoom'>Zoom</span>
                        <Button
                            className='minus'
                            icon={<MinusOutlined />}
                            onMouseDown={onZoomOutStart}
                            onMouseUp={onZoomOutEnd}
                        />
                    </div>
                </div>
                <div className='camera__monitor'>

                    <Space size='middle'>
                        <Spin
                            className='video-js'
                            size='large'
                            id='spin-slot-1'
                            style={{ display: "none" }}
                        />
                    </Space>
                    <video
                        className='video-js'
                        width='100%'
                        autoPlay='1'
                        id='ptz-slot'
                        style={{ display: "none" }}
                    >
                        Trình duyệt không hỗ trợ thẻ video.
                    </video>
                </div>
            </div>
            <div className='table__preset--setting'>
                <div className='table__preset'>
                    <div className='preset__tool'>
                        <AutoComplete placeholder={t('view.map.search')} />
                        <Image src={arrow} preview={false} onClick={handleSetPreset} />
                    </div>
                    <Table
                        rowSelection={{
                            type: "checkbox",
                            ...rowSelection,
                        }}
                        dataSource={rowsPreset}
                        columns={columnsTablePreset}
                        pagination={false}
                        scroll={{ y: 240 }}
                        className='preset__table'
                    />
                </div>

                <div className='confirm__choosing--preset'>
                    <select
                        id='choose__preset-tour'
                        onChange={(e) => {
                            onChangeOptionSetPresetInPresetTour(e);
                        }}
                    >
                        <option value='' selected hidden disabled>
                            {t('view.live.add_new_or_edit_preset_tour')}
                        </option>
                        <optgroup label={t('view.live.add_new_preset_tour')}>
                            <option value='none'>{t('view.live.add_new_preset_tour')}</option>
                        </optgroup>
                        <optgroup label={t('view.live.choose_preset_tour')}>
                            {presetTourSelect}
                        </optgroup>
                    </select>
                    <Button id='add__preset-in-preset-tour' onClick={handleAddPreset}
                        disabled={isDisableButtonAddPresetToPresetTour}
                    >
                        <Image
                            src={arrow}
                            preview={false}
                        />
                    </Button>

                </div>

                <div className='table__preset-tour'>
                    <>
                        <div className='preset-tour__tool'>
                            <AutoComplete placeholder={t('view.map.search')} />
                            <input
                                id='name__preset-tour'
                                disabled={!visiblePresetInPresetTour}
                                onFocus={(e) => handleFocusNamePresetTour()}
                                autoComplete='off'
                            />

                            <span id='rename__preset-tour' style={{ display: "none" }}>
                                <CheckOutlined
                                    id='confirm__done--rename-preset-tour'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDoneRenamePresetTour(e);
                                    }}
                                />
                                <CloseOutlined
                                    id='confirm__close--rename-preset-tour'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCloseRenamePresetTour();
                                    }}
                                />
                            </span>

                            <div id='delete__preset-tour'>
                                <Button
                                    icon={<DeleteOutlined />}
                                    onClick={handleDeletePresetTour}
                                    disabled={!visiblePresetInPresetTour}
                                ></Button>
                            </div>
                        </div>
                        <Table
                            size="small"
                            className='preset-tour__table'
                            columns={columnsTablePresetTour}
                            dataSource={
                                visiblePresetInPresetTour && isPresetLastDeleted
                                    ? '' :
                                    visiblePresetInPresetTour ? presetTourDatas[indexPresetTourChoosed]?.listPoint : ''

                            }
                            pagination={false}
                            rowKey={(record) => record.index}
                            scroll={{ y: 240 }}
                            components={{
                                body: {
                                    wrapper: DraggableContainer,
                                    row: DraggableBodyRow,
                                },
                            }}
                        />
                    </>
                </div>
            </div>
        </div>
    );
};
export default Preset;
