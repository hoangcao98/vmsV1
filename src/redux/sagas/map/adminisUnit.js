import { call, put, takeLatest, all } from 'redux-saga/effects';
import { ADD_ADMINIS_UNIT_ON_MAP, FETCH_ALL_ADMINIS_UNITS_ON_MAP, UPDATE_ADMINIS_UNIT_ON_MAP, UPDATE_ADMINIS_UNIT_ON_MAP_FAILED } from '../../types/map'
import { NOTYFY_TYPE, STATUS_CODE } from '../../../view/common/vms/Constant';
import mapActions from '../../actions/map';
import adDivisioneApi from '../../../api/controller-api/adDivisionApi';
import Notification from "../../../components/vms/notification/Notification"
import { addAdminisUnitOnMapFailed, addAdminisUnitOnMapSuccess, updateAdminisUnitOnMapFailed, updateAdminisUnitOnMapSuccess } from '../../actions/map/adminisUnitsAction';
import { updateFormMapObject } from './index';

const { fetchAllAdminisUnitsSuccess, fetchAllAdminisUnitsFailed } = mapActions;

export function* fetchListAdminisUnitAction(action) {
  // const notifyMess = {
  //   type: NOTYFY_TYPE.success,
  //   title: 'Đơn vị hành chính',
  //   description: 'Áp dụng bộ lọc đơn vị hành chính thành công'
  // }
  try {
    const { params } = action.payload;
    const resp = yield call(adDivisioneApi.getAll, params);
    if (resp && resp.payload) {
      const { payload, metadata } = resp;
      yield put(fetchAllAdminisUnitsSuccess({ listAdminisUnit: payload, metadata }))
      // Notification(notifyMess);
    } else {
      yield put(fetchAllAdminisUnitsFailed(null))
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.errors) {
      yield put(fetchAllAdminisUnitsFailed(null))
      // notifyMess.type = NOTYFY_TYPE.warning;
      // notifyMess.description = error.response.data.errors.message || 'something is wrong from server side'
      // Notification(notifyMess);
    }
  }
}

export function* updateAdminisUnitAction(action) {
  const notifyMess = {
    type: NOTYFY_TYPE.success,
    title: 'Đơn vị hành chính',
    description: 'Bạn đã cập nhật công đơn vị hành chính'
  }
  try {
    const bodyAdUnitInfo = action.payload;
    const resp = yield call(adDivisioneApi.update, bodyAdUnitInfo, bodyAdUnitInfo.uuid);
    if (resp && resp.payload) {
      yield put(updateAdminisUnitOnMapSuccess(resp.payload));
      yield call(updateFormMapObject);
      Notification(notifyMess);
    } else {
      yield put(updateAdminisUnitOnMapFailed(null));
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.errors) {
      yield put(updateAdminisUnitOnMapFailed(null));
      notifyMess.type = NOTYFY_TYPE.warning;
      notifyMess.description = error.response.data.errors.message || 'something is wrong from server side'
      Notification(notifyMess);
    }
  }
}

export function* addNewAdUnitction(action) {
  const notifyMess = {
    type: NOTYFY_TYPE.success,
    title: 'Đơn vị hành chính',
    description: 'Bạn đã thêm thành công đơn vị hành chính'
  }
  try {
    const bodyAdUnitInfo = action.payload;
    const resp = yield call(adDivisioneApi.createNew, bodyAdUnitInfo);
    if (resp && resp.payload) {
      yield put(addAdminisUnitOnMapSuccess(resp.payload));
      yield call(updateFormMapObject);
      Notification(notifyMess);
    } else {
      yield put(addAdminisUnitOnMapFailed(null));
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.errors) {
      yield put(addAdminisUnitOnMapFailed(null));
      notifyMess.type = NOTYFY_TYPE.warning;
      notifyMess.description = error.response.data.errors.message || 'something is wrong from server side'
      Notification(notifyMess);
    }
  }
}

export default function* watchAdminisUnitSaga() {
  yield all([
    yield takeLatest(FETCH_ALL_ADMINIS_UNITS_ON_MAP, fetchListAdminisUnitAction),
    yield takeLatest(UPDATE_ADMINIS_UNIT_ON_MAP, updateAdminisUnitAction),
    yield takeLatest(ADD_ADMINIS_UNIT_ON_MAP, addNewAdUnitction),
  ])
}
