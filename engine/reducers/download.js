const types = {
    UPDATE_DOWNLOAD_STATUS: "UPDATE_DOWNLOAD_STATUS",
    UPDATE_DOWNLOAD_PERCENTAGE: "UPDATE_DOWNLOAD_PERCENTAGE",
};

const initialState = {
    isDownloading: false,
    currentPercentage: 0,
    downloadingId: 0
};

export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case types.UPDATE_DOWNLOAD_STATUS:
            return {
                ...state,
                isDownloading: action.isDownloading,
                downloadingId: action.downloadingId
            };
        case types.UPDATE_DOWNLOAD_PERCENTAGE:
            return {
                ...state,
                currentPercentage: action.currentPercentage,
            };
        default:
            return state;
    }
};
