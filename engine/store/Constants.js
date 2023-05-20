export const playerToggleFull = () => {
    return {
        type: 'TOGGLE_FULL'
    }
};

export const playerToggleShow = () => {
    return {
        type: 'TOGGLE_SHOW',
    }
};
export const playerQueueChange = (full) => {
    return {
        type: 'QUEUE_CHANGE',
        full
    }
};