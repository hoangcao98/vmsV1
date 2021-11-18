import { handleErrCodeAI } from '../../function/MyUltil/ResponseChecker';
import AIService from '../ai-service';

const AIHumansApi = {
  getAllHumans: async (params) => {

    let result;

    try {
      result = await AIService.getRequestData(
        `/api/v1/humans?page=${params?.page}&size=${params?.pageSize}`
      );

    } catch (error) {
      console.log(JSON.stringify(error));
    }

    if (handleErrCodeAI(result) === null) {
      return [];
    }

    console.log(result)
    return result;
  },
  getHumansByUuid: async (uuid) => {
    let result;

    try {
      result = await AIService.getRequestData(
        `/api/v1/humans/${uuid}`
      );
    } catch (error) {
      console.log(error);
    }
    if (handleErrCodeAI(result) === null) {
      return [];
    }

    return result.payload;
  },
  addHumans: async (payload) => {
    let result;

    try {
      result = await AIService.postRequestData(
        "/api/v1/humans",
        payload
      );
    } catch (error) {
      console.log(error);
    }
    if (handleErrCodeAI(result) === null) {
      return false;
    }
    return true;
  },
  editHumansByUuid: async (uuid, payload) => {
    let result;

    try {
      result = await AIService.putRequestData(
        `/api/v1/humans/${uuid}`,
        payload
      );
    } catch (error) {
      console.log(error);
    }

    if (handleErrCodeAI(result) === null) {
      return false;
    }
    return true;
  },
  deleteHumans: async (uuid) => {
    let result;
    try {
      result = await AIService.deleteRequestData(
        `/api/v1/humans/${uuid}`
      );
    } catch (error) {
      console.log(error);
    }

    if (handleErrCodeAI(result) === null) {
      return false;
    }
    return true;
  },
  getAllMessageWarning: async (params) => {
    let result;

    try {
      result = await AIService.getRequestData(
        '/cctv-monitor-ctrl-svc/api/v1/message/notification',
        params
      );
    } catch (error) {
      console.log(JSON.stringify(error));
    }

    if (handleErrCodeAI(result) === null) {
      return [];
    }

    return result.payload;
  },
  getBadge: async () => {
    let result;

    try {
      result = await AIService.getRequestData(
        '/cctv-monitor-ctrl-svc/api/v1/message/get-badge'
      );
    } catch (error) {
      console.log(JSON.stringify(error));
    }

    if (handleErrCodeAI(result) === null) {
      return [];
    }

    return result.payload;
  },
  getAllMail: async () => {
    let result;

    try {
      result = await AIService.getRequestData(
        '/cctv-monitor-ctrl-svc/api/v1/email/get-email'
      );
    } catch (error) {
      console.log(JSON.stringify(error));
    }

    if (handleErrCodeAI(result) === null) {
      return [];
    }

    return result.payload;
  },
  updateEmail: async (data) => {
    let result;

    try {
      result = await AIService.postRequestData(
        `/cctv-monitor-ctrl-svc/api/v1/email/update-email`,
        data
      );
    } catch (error) {
      console.log(error);
    }

    if (handleErrCodeAI(result) === null) {
      return false;
    }
    return true;
  }
};

export default AIHumansApi;
