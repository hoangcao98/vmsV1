import {
  handleErrCodeAuthZ
} from '../../function/MyUltil/ResponseChecker';
import MyService from '../service';

const GroupApi = {
  // getAllGroup: async (data) => {
  //   let result;

  //   try {
  //     result = await MyService.getRequestData(
  //       `/authz/api/v0/groups?filter=${data?.filter}`
  //     );
  //   } catch (error) {
  //     console.log('group error: ' + JSON.stringify(error));
  //   }

  //   if (responseCheckerErrors(result)) {
  //     return [];
  //   }

  //   return result;
  // },

  getAllGroup: async (params) => {
    let result;

    try {
      result = await MyService.getRequestData(
        `/authz/api/v0/groups?filter=${params?.filter}&page=${params?.page}&size=${params?.size}`
      );
    } catch (error) {
      console.log(error);
    }
    if (handleErrCodeAuthZ(result) === null) {
      return [];
    }

    return result;
  },

  getGroupByUuid: async (uuid) => {
    let result;

    try {
      result = await MyService.getRequestData(`/authz/api/v0/groups/${uuid}`);
    } catch (error) {
      console.log('nvr error: ' + JSON.stringify(error));
    }

    if (handleErrCodeAuthZ(result) === null) {
      return [];
    }

    return result.payload;
  }
};

export default GroupApi;
