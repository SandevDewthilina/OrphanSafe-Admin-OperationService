import { matchParentsAndChildren } from "./adminService.js";

export const subscribeEvents = async (payload) => {
  const { event, data } = payload;
  // parse data
  console.log("Received data for event", event, data);

  // manage event
  switch (event) {
    case "MATCHPARENTCHILD":
      matchParentsAndChildren(data.parentId)
      break;
    case "UPLOAD_FILES":
      /**
       * {event: UPLOAD FILES,
       * data: [file array]}
       */
      const keyList = [];
    
      return keyList;
    default:
      break;
  }
};
