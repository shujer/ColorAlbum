//index.js
const app = getApp()
const globalApi = require( '../../api/index' )

Page( {
  data: {
    logged: false,
    motto: '记录你的色彩灵感',
    canIUse: wx.canIUse( 'button.open-type.getUserInfo' )
  },

  onLoad: function () {
    if ( !wx.cloud ) {
      wx.redirectTo( {
        url: '../index/index',
      } )
      return
    }
  },

  onGetUserInfo: function ( e ) {
    if ( !this.logged && e.detail.userInfo ) {
      app.globalData.userInfo = e.detail.userInfo
      app.globalApi = globalApi
      this.setData( { logged: true }, () => {
        this.getOpenid()
      } )
    } else {
      app.globalApi = globalApi
      wx.navigateTo( {
        url: '../demo/index'
      } );
    }
  },

  toDemo () {
    app.globalApi = globalApi
    wx.navigateTo( {
      url: '../demo/index'
    } );
  },

  getOpenid: function () {
    // 调用云函数
    wx.showLoading( {
      title: '请稍候',
      mask: true
    } );
    wx.cloud.callFunction( {
      name: 'login',
      data: {},
      success: res => {
        console.log( '[云函数] [login] user openid: ', res.result.openid )
        app.globalData.openid = res.result.openid
        // 初始化相册数据
        app.globalApi.albumApi.getAlbumsByUser( res.result.openid ).then( res => {
          wx.hideLoading();
          wx.switchTab( {
            url: '../tabar/home/index'
          } );
        } ).catch( err => {
          console.error( '初始化失败', err )
        } )
      },
      fail: err => {
        console.error( '[云函数] [login] 调用失败', err )
        wx.redirectTo( {
          url: '../index/index',
        } )
      }
    } )
  }
} )
