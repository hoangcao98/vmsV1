import { Spin } from "antd";
import { isEmpty } from "lodash";
import React from "react";
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import convertDataBarChart from "../../../../actions/function/MyUltil/ConvertDataBarChart";
import Loading from "../../../common/element/Loading";
import { loadDataChart } from "../../redux/actions";
import "./barChart.scss";
import ExportReport from "./ExportReport";

var randomColor = require("randomcolor");

// const monthTickFormatter = (tick) => {
//   const date = new Date(tick);

//   return date.getMonth() + 1;
// };

const renderQuarterTick = (tickProps) => {
  const { x, y, payload } = tickProps;
  const { value, offset } = payload;
  const date = new Date(value);
  const month = date.getMonth();
  const quarterNo = Math.floor(month / 3) + 1;

  if (month % 3 === 1) {
    return <text x={x} y={y - 4} textAnchor="middle">{`Q${quarterNo}`}</text>;
  }

  const isLast = month === 11;

  if (month % 3 === 0 || isLast) {
    const pathX = Math.floor(isLast ? x + offset : x - offset) + 0.5;

    return <path d={`M${pathX},${y - 4}v${-35}`} stroke="red" />;
  }
  return null;
};

function BarChartComponent(props) {
  const data = props.chartData;
  const { t } = useTranslation();
  if (props.isShowLineAndPieChart) {
    return null;
  }

  if (props.isLoading) {
    return null;
  }

  const dataConvert = (data) => {
    console.log('data:',data);
    if (isEmpty(data)) {
      return;
    }
    console.log("data", data);
    console.log("data_values", Object.values(data));
    const dataNoName = Object.values(data)[0]
    console.log("dataNoName:",dataNoName)

    delete dataNoName.time;

    const keyArr = Object.keys(dataNoName);
    return keyArr.map((k) => {
      return <Bar dataKey={k} fill={randomColor()} />;
    });
  };

  if (isEmpty(data)) {
    return null;
  }
  return (
    <>
      {!props.isShowLineAndPieChart && (
        <div className="BarChart">
          {isEmpty(data) ? (
            <>
              <div className="BarChart__title">
                <h3>
                  {" "}
                  {t(
                    "view.report.compare_chart"
                  )} {props.title.toUpperCase()}{" "}
                </h3>
              </div>
              <div className="BarChart__no-data">
                <span className="BarChart__no-data__title">
                  {t("noti.choose_event")}
                </span>
              </div>
            </>
          ) : (
            <>
              {Object.keys(data).map((item, i) => (
                <>
                  <div className="BarChart__title">
                    <h3>
                      {" "}
                      {t("view.report.compare_chart")}{" "}
                      {props.title.toUpperCase()}{" "}
                    </h3>
                    <ExportReport currentDataSource={data} />
                  </div>
                  <div>
                    <ResponsiveContainer
                      width="95%"
                      aspect={3 / 1}
                      className="ResponsiveContainer"
                    >
                      <BarChart
                        width={500}
                        height={300}
                        data={data[item]}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {dataConvert(data[item])}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ))}
            </>
          )}
        </div>
      )}
    </>
  );
}

const mapStateToProps = (state) => ({
  isLoading: state.chart.isLoading,
  chartData: convertDataBarChart(state.chart.chartData),
  error: state.chart.error,
  title: state.chart.title,
  isShowLineAndPieChart: state.chart.isShowLineAndPieChart,
});

const mapDispatchToProps = (dispatch) => {
  return {
    callData: (params) => {
      dispatch(loadDataChart(params));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(BarChartComponent);
