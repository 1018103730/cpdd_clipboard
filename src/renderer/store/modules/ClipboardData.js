import moment from "moment";
import config from "../../../config";

const state = {
    data: {},
    auto_score: 1,
}

const mutations = {
    initData(state, data) {
        state.data = data.records;
        state.auto_score = data.auto_score;
    },
    addRecord(state, data) {
        if (state.data[data.hash]) return;

        data.value['score'] = state.auto_score++;
        state.data[data.hash] = data.value;
    },
    updateRecord(state, hash, time) {
        state.data[hash].lastUsedTime = moment(time).format(config.time_format);
        state.data[hash].score = state.auto_score++;

    }
}

export default {
    state, mutations, namespaced: true
}