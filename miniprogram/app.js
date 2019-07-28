const Event = require( './utils/events' );
//app.js
App( {
  events: null,

  onLaunch: function () {

    if ( !wx.cloud ) {
      console.error( '请使用 2.2.3 或以上的基础库以使用云能力' )
    } else {
      wx.cloud.init( {
        // 此处请填入环境 ID, 环境 ID 可打开云控制台查看
        env: 'color-album',
        traceUser: true,
      } )
    }

    this.globalData = {
      photos: {},
      tempFilePaths: {}
    }

    // 初始化事件
    this.initEvents()
  },

  initEvents () {
    this.events = new Event()
  },

  emitDeletePhoto ( data ) {
    this.events.emit( 'photoDelete', data )
  },

  emitAddPhoto ( data ) {
    this.events.emit( 'photoAdd', data )
  },

  emitEditPhoto ( data ) {
    this.events.emit( 'photoEdit', data )
  },

  emitDeleteAlbum ( data ) {
    this.events.emit( 'albumDelete', data )
  },

  emitAddAlbum ( data ) {
    this.events.emit( 'albumAdd', data )
  },

  emitEditAlbum ( data ) {
    this.events.emit( 'albumEdit', data )
  },

  emitSelectAlbum ( data ) {
    this.events.emit( 'albumSelect', data )
  }

} )
