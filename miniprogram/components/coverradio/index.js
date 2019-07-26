// components/coverradio/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    groups: {
      type: Array,
      value: []
    },
    value: {
      type: String,
      value: ''
    },
    backgroundColor: {
      type: String,
      value: '#e9e9e9'
    },
    activeColor: {
      type: String,
      value: '#9F8BE5'
    },
    name: {
      type: String,
      value: 'Radio'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    ready: function(e) {
      this.data.groups.forEach(item => {
        item.checked = item.name === value;
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    changeChecked(e) {
      let name = e.currentTarget.dataset.name;
      this.setData({
        value: name
      })
      this.triggerEvent('set' + this.data.name, {value: name})
    }
  }
})
