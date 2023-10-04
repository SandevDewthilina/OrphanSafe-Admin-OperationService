import {
  getSignedUrlForKeysAsync,
  uploadSingleFileAsync,
} from "./adminService.js";
export const subscribeEvents = async (payload) => {
  const { event, data } = payload;
  // parse data
  console.log("Received data for event", event, data);

  // manage event
  switch (event) {
    case "URL_FOR_KEYS":
      /**
       * {
       *  event:,
       *  data: ['keys']
       * }
       */
      return await getSignedUrlForKeysAsync(data);

    case "UPLOAD_FILES":
      /**
       * {event: UPLOAD FILES,
       * data: [file array]}
       */
      const keyList = [];
      
      data.files.map(async (file) =>
        keyList.push( await uploadSingleFileAsync(data.path, file))
      );
      return keyList;
    default:
      break;
  }
};
