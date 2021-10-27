<template>
  <div id="app">
    <el-input v-model="search" placeholder="请输入需要搜索的剪切板内容" size="mini"></el-input>
    <el-scrollbar>
      <ul id="records">
        <li v-for="(record,hash) in records"
            :key="hash"
            :title="titleInfo(record)"
            :style="{order:record.score}" @click="setClipboard(hash)" v-if="checkSearch(record.content)">
          <small>{{ hash.slice(0, 6) }}</small>
          {{ simpleContent(record.content) }}

          <span class="time">{{ record.lastUsedTime }}</span>
        </li>
      </ul>
    </el-scrollbar>
  </div>
</template>

<style>
* {
  margin: 0px;
  padding: 0px;
}

#app {
  margin: 10px;
}

#records {
  margin-top: 20px;
  display: flex;
  flex-direction: column-reverse;
}

#records li {
  list-style: none;
  border-bottom: 1px solid #efefef;
  line-height: 32px;
  cursor: pointer;
  text-indent: 10px;
}

#records li:hover {
  background: #efefef;
}

#records li small {
  background: #333;
  border-radius: 3px;
  color: #fff;
  padding: 4px;
  font-size: 10px;
}

#records li span.time {
  color: #888;
  float: right;
  font-size: 10px;
}

</style>

<script>
import md5 from 'md5'
import moment from 'moment';

export default {
  data() {
    return {
      search: '',
      records: {}
    }
  },
  computed: {
    cpData() {
      return this.$store.state.ClipboardData.data;
    },
    cpAutoScore() {
      return this.$store.state.ClipboardData.auto_score;
    }
  },
  name: 'index',
  components: {},
  mounted() {
    let th = this;
    this.$electron.ipcRenderer.on('initRecordData', function (event, args) {
      th.$store.commit('ClipboardData/initData', args);
      th.refreshData();
    });

    setInterval(() => {
      let content = this.$electron.clipboard.readText();
      if (!content) return;
      let hash = md5(content);
      if (this.cpData[hash]) return;

      let data = {
        // hash: hash,
        content: content,
        createdTime: moment(new Date).format(this.$config.time_format),
        lastUsedTime: moment(new Date).format(this.$config.time_format)
      }

      this.$store.commit('ClipboardData/addRecord', {hash: hash, value: data});

      this.refreshData();
      this.syncData();
    }, this.$config.clipboard_content_check_interval)
  },
  methods: {
    checkSearch(content) {
      return content.indexOf(this.search) !== -1;
    },
    syncData() {
      this.$electron.ipcRenderer.send('syncRecordData', {records: this.cpData, auto_score: this.cpAutoScore});
    },
    refreshData() {
      this.$nextTick(() => {
        //动态更新数据 https://segmentfault.com/a/1190000022772025
        this.records = Object.assign({}, this.records, this.cpData);
      })
    },
    titleInfo(record) {
      return '剪切板内容: ' + record.content + '\n\n创建时间: ' + record.createdTime + '\n\n最后使用时间: ' + record.lastUsedTime;
    },
    simpleContent(content) {
      let tail = content.length > this.$config.simple_content_length ? '...' : '';

      return content.slice(0, this.$config.simple_content_length) + tail;
    },
    setClipboard(hash) {
      let content = this.cpData[hash].content;
      this.$electron.clipboard.writeText(content);

      this.$store.commit('ClipboardData/updateRecord', hash, new Date);

      this.refreshData();
      this.syncData();
      this.$message('内容已添加到系统剪切板!');
    }
  }
}
</script>
