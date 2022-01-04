import { handleErrCodeAI } from '../../function/MyUltil/ResponseChecker';
import AIService from '../ai-service';

const AI_SOURCE = process.env.REACT_APP_AI_SOURCE;

const AIEventsApi = {

  getEvents: async (params) => {
    let url = '/api/v1/ai-events'
    if(AI_SOURCE === 'philong'){
      url = '/api/v1/integration-ai-events'
    }
    let result;

    try {
      result = await AIService.getRequestData(
        url, params

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

  editInforOfEvent: async (uuid, payload) => {
    let url = '/api/v1/ai-events/'
    // let url = '/api/v1/integration-ai-events'
    console.log(AI_SOURCE)
    if(AI_SOURCE === 'philong'){
      url = '/api/v1/integration-ai-events/'
    }
    let result;
    console.log("????????????????   url " ,url )
    try {
      result = await AIService.putRequestData(
        url + uuid,
        payload
      );
      console.log("????????????????    " ,result )
    } catch (error) {
      console.log(error);
    }

    if (handleErrCodeAI(result) === null) {
      return false;
    }
    return true;
  },
  
  
};

export default AIEventsApi;