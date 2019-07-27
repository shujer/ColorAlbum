// miniprogram/pages/tabar/mood/egg/index.js
const app =getApp()

Page( {
  data: {
    height: 20,
    focus: false
  },
  bindFormSubmit: function ( e ) {
    let message = e.detail.value.textarea
    if ( !message.trim() ) {
      wx.showToast( {
        title: '请输入内容',
        icon: 'none'
      } );
      return;
    }
    wx.showLoading( {
      title: '提交中',
      mask: true
    } );
    const db = wx.cloud.database();
    db.collection( 'message' ).add( {
      data: {
        message,
        userInfo: app.globalData.userInfo,
        due: new Date()
      }
    } ).then( res => {
      wx.hideLoading();  
      wx.showToast( {
        title: '提交成功',
        icon: 'success'
      } );
    } ).catch( err => {
      wx.hideLoading();  
      wx.showToast( {
        title: '提交失败',
        icon: 'none'
      } );
    } )
  }
} )