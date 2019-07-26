// components/coverslider/index.js

let initial = 0;

Component( {
  /**
   * 组件的属性列表
   */
  properties: {
    min: {
      type: Number,
      value: 0
    },
    max: {
      type: Number,
      value: 100
    },
    disabled: {
      type: Boolean,
      value: false
    },
    backgroundColor: {
      type: String,
      value: '#e9e9e9'
    },
    activeColor: {
      type: String,
      value: '#9F8BE5'
    },
    blockSize: {
      type: Number,
      value: 28
    },
    blockColor: {
      type: String,
      value: '#fff'
    },
    value: {
      type: Number,
      value: 0
    },
    name: {
      type: String,
      value: 'Range'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    len: 0
  },

  lifetimes: {
    ready: function () {
      this.getStepLength();
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getStepLength: function () {
      var query = wx.createSelectorQuery().in( this );
      //选择id
      var that = this;
      query.select( '.slider-inner' ).boundingClientRect( function ( rect ) {
        let width = rect.right - rect.left;
        let diff = that.data.max - that.data.min
        let len = (that.data.value - that.data.min) / diff * width
        that.setData( {
          left: rect.left,
          right: rect.right,
          width,
          diff,
          len
        } )
      } ).exec();
    },

    touchStart: function ( e ) {
      initial = e.changedTouches[0].clientX
    },

    touchMove: function ( e ) {

    },

    touchTap: function ( e ) {
      let clientX = e.changedTouches[0].clientX;
      if ( clientX > this.data.right ) {
        clientX = this.data.right
      }
      if ( clientX < this.data.left ) {
        clientX = this.data.left;
      }
      let len = clientX - this.data.left;
      let value = Math.floor( len / this.data.width  * this.data.diff + this.data.min)
      this.setData( {
        len,
        value
      } )
      this.triggerEvent( 'set' + this.data.name, {value})
    },

    touchEnd: function ( e ) {
      let clientX = e.changedTouches[0].clientX;
      if ( clientX > this.data.right ) {
        clientX = this.data.right
      }
      if ( clientX < this.data.left ) {
        clientX = this.data.left;
      }
      let len = clientX - this.data.left;
      let value = Math.floor( len / this.data.width  * this.data.diff + this.data.min)
      this.setData( {
        len,
        value
      } )
      this.triggerEvent( 'set' + this.data.name, {value})
    }

  }
} )
