import { Button } from "antd";
import { StyledTicketModal, StyledInput, StyledConfirmSend } from "./style";
import React, { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useReactToPrint } from "react-to-print";
import moment from "moment";
import { getText } from "./toVND";
import { default as ExportEventFileApi } from "../../../../actions/api/exporteventfile/ExportEventFileApi";
import { getBase64Text } from "../../../../utility/vms/getBase64Text";
import "./index.css";
import SendTicketModal from "./send-ticket-modal";
const AI_SOURCE = process.env.REACT_APP_AI_SOURCE;

const PrintSection = ({
  componentRef,
  data,
  fine,
  handleSetFine,
  totext,
  urlSnapshot,
}) => {
  const { t } = useTranslation();
  return (
    <div
      ref={componentRef}
      style={{ padding: "16px", boxSizing: "border-box" }}
      id="print-me"
    >
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <div
          style={{
            width: "100%",
            fontSize: "20px",
            fontWeight: "bold",
          }}
        >
          {t("view.penalty_ticket.ticket")}
        </div>
        <div style={{ fontSize: "14px" }}>
          {t("view.penalty_ticket.num")}: {data?.penaltyTicketId}
        </div>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td
              style={{
                width: "30%",
                paddingBottom: "16px",
                fontWeight: "bold",
              }}
            >
              {t("view.penalty_ticket.vehicle_type")}
            </td>
            <td style={{ paddingBottom: "16px", textAlign: "left" }}>
              {data?.typeObject &&
                t("view.ai_events.type_object." + data?.typeObject)}
            </td>
          </tr>
          <tr>
            <td
              style={{
                width: "30%",
                paddingBottom: "16px",
                fontWeight: "bold",
              }}
            >
              {t("view.ai_events.plateNumber")}
            </td>
            <td style={{ paddingBottom: "16px", textAlign: "left" }}>
              {data?.plateNumber ? data?.plateNumber : "Không xác định"}
            </td>
          </tr>
          <tr>
            <td
              style={{
                width: "30%",
                paddingBottom: "16px",
                fontWeight: "bold",
              }}
            >
              {t("view.live.camera_record")}
            </td>
            <td style={{ paddingBottom: "16px", textAlign: "left" }}>
              {data?.cameraName}
            </td>
          </tr>
          <tr>
            <td
              style={{
                width: "30%",
                paddingBottom: "16px",
                fontWeight: "bold",
              }}
            >
              {t("view.penalty_ticket.violation_datetime")}
            </td>
            <td style={{ paddingBottom: "16px", textAlign: "left" }}>
              {data?.createdTime &&
                moment(data?.createdTime).format("HH:mm DD/MM/YYYY")}
            </td>
          </tr>
          <tr>
            <td
              style={{
                width: "30%",
                paddingBottom: "16px",
                fontWeight: "bold",
              }}
            >
              {t("view.penalty_ticket.violation_type")}
            </td>
            <td style={{ paddingBottom: "16px", textAlign: "left" }}>
              {data?.subEventType && t("view.ai_events." + data?.subEventType)}
            </td>
          </tr>
          <tr>
            <td
              style={{
                width: "30%",
                paddingBottom: "16px",
                fontWeight: "bold",
              }}
            >
              {t("view.penalty_ticket.total_fine")}
            </td>
            <td style={{ paddingBottom: "16px", textAlign: "left" }}>
              <span style={{ display: "inline-flex" }}>
                <StyledInput
                  placeholder="............................"
                  value={fine}
                  type="number"
                  onChange={(e) => handleSetFine(e)}
                />
                <span>&nbsp;đồng&nbsp;</span>
              </span>
              ({t("view.penalty_ticket.to_text")}: {totext}{" "}
              {totext === "" ? "" : "đồng"})
            </td>
          </tr>
          <tr>
            <td
              style={{
                verticalAlign: "top",
                paddingBottom: "16px",
                fontWeight: "bold",
              }}
            >
              {t("view.penalty_ticket.violation_proof")}
            </td>
            <td>
              {urlSnapshot !== "" ? (
                <div style={{ paddingBottom: "16px", textAlign: "left" }}>
                  <div>{t("view.penalty_ticket.violation_img")}:</div>
                  <div>
                    <img
                      style={{ maxWidth: "200px", height: "120px" }}
                      className="cursor-pointer"
                      src={urlSnapshot}
                      alt="violation-img"
                    />
                  </div>
                </div>
              ) : (
                ""
              )}
              {data?.videoUrl ? (
                <div className="violation_video" style={{ textAlign: "left" }}>
                  Video:{" "}
                  <a
                    className="video-link"
                    href={data.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("view.penalty_ticket.click-to-view-video")}
                  </a>
                </div>
              ) : (
                ""
              )}
            </td>
          </tr>
        </tbody>
      </table>
      <div className="pagebreak"></div>
    </div>
  );
};
const TicketModal = ({ visible, handleOk, handleCancel, data }) => {
  const { t } = useTranslation();
  const componentRef = useRef();
  const [fine, setFine] = useState("");
  const [totext, setTotext] = useState("");
  const [urlSnapshot, setUrlSnapshot] = useState("");
  // Send Ticket Modal
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [resetForm, setResetForm] = useState(false);
  const handleOpenSendModal = () => {
    setSendModalVisible(true);
  };
  const handleSendTicket = (e) => {
    StyledConfirmSend.confirm({
      title: t("view.penalty_ticket.confirm_send"),
      okText: t("view.common_device.agree"),
      cancelText: t("view.common_device.cancel"),
      onOk() {
        setSendModalVisible(false);
        setResetForm(!resetForm);
      },
      centered: true,
      onCancel() {
        console.log("Cancel");
      },
    });
  };
  const handleCancelSend = () => {
    setSendModalVisible(false);
    setResetForm(!resetForm);
  };
  //print
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  const handleSetFine = (e) => {
    setFine(e.target.value);
    if (e.target.value !== "" && !isNaN(parseFloat(e.target.value))) {
      const text = getText(parseFloat(e.target.value));
      setTotext(text.charAt(0).toUpperCase() + text.slice(1));
    } else {
      setTotext("");
    }
  };
  useEffect(() => {
    (async () => {
      if (parseFloat(data?.fileType) === 4) {
        if (AI_SOURCE === "philong") {
          await ExportEventFileApi.downloadAIIntegrationFile(
            data.uuid,
            "ImageViolate.jpg"
          ).then(async (result) => {
            const blob = new Blob([result.data], { type: "octet/stream" });
            getBase64Text(blob, async (image) => {
              setUrlSnapshot(image);
            });
          });
        } else {
          await ExportEventFileApi.downloadFileAI(
            data.cameraUuid,
            data.trackingId,
            data.uuid,
            data.fileName,
            4
          ).then(async (result) => {
            const blob = new Blob([result.data], { type: "octet/stream" });
            getBase64Text(blob, async (image) => {
              setUrlSnapshot(image);
            });
          });

          // setUrlSnapshot("data:image/jpeg;base64," + file.thumbnailData);
        }
      }
    })();
  }, [data]);

  return (
    <>
      <StyledTicketModal
        visible={visible}
        onOk={handleOk}
        width={1000}
        onCancel={handleCancel}
        footer={[
          <Button key="print" type="primary" onClick={handlePrint}>
            {t("view.penalty_ticket.print_ticket")}
          </Button>,
          <Button
            key="send"
            type="primary"
            // loading={loading}
            onClick={handleOpenSendModal}
          >
            {t("view.penalty_ticket.send_ticket")}
          </Button>,
          <Button
            // loading={loading}
            key="back"
            onClick={handleCancel}
          >
            {t("view.camera.close")}
          </Button>,
        ]}
      >
        <PrintSection
          componentRef={componentRef}
          data={data}
          fine={fine}
          handleSetFine={handleSetFine}
          totext={totext}
          urlSnapshot={urlSnapshot}
        />
        <SendTicketModal
          sendModalVisible={sendModalVisible}
          handleSendTicket={handleSendTicket}
          handleCancelSend={handleCancelSend}
          resetForm={resetForm}
        />
      </StyledTicketModal>
    </>
  );
};
export default TicketModal;
