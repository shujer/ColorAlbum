// components/coverinput/index.js
Component( {
  /**
   * 组件的属性列表
   */
  properties: {
    style: {
      type: Object,
      value: {}
    },
    placehoder: {
      type: String,
      value: ''
    },
    name: {
      type: String,
      value: ''
    },
    value: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    tapInput () {
      this.setData( {
        inputFocus: true,
      } );
    },
    blurInput ( e ) {
      this.setData( {
        value: e.detail.value || this.data.placehoder
      } );
      this.triggerEvent( 'set' + this.data.name, e.detail )
    }
  }
} )
