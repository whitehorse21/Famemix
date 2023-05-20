const types = {
    UPDATE_ROLE: "UPDATE_ROLE",
};


const initialState = {
    option_stream: 1,
    option_hd_stream: 0,
    option_download	:0,
    option_download_hd:	0,
    option_play_without_purchased:0,
    option_track_skip_limit:0,
    ad_support:	0,
    ad_frequency: 5,
};

export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case types.UPDATE_ROLE:
            return {
                ...state,
                option_stream: Boolean(action.role.option_stream),
                option_hd_stream:  Boolean(action.role.option_hd_stream),
                option_download	: Boolean(action.role.option_download),
                option_download_hd:	 Boolean(action.role.option_download_hd),
                option_play_without_purchased: Boolean(action.role.option_play_without_purchased),
                option_track_skip_limit: Boolean(action.role.option_track_skip_limit),
                ad_support:	Boolean(action.role.ad_support),
                ad_frequency: parseInt(action.role.ad_frequency),
            };
        default:
            return state;
    }
};
