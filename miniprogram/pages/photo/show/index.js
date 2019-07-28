// miniprogram/pages/photo/show/index.js
const app = getApp()
const imageApi = require( '../../../api/image' )
const photoApi = require( '../../../api/photo' )

Page( {
  eventsListener: {},

  /**
   * 页面的初始数据
   */
  data: {
    autoAnalyse: false,
    timestamp: new Date().getTime()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function ( options ) {
    let { id } = options;
    wx.showLoading( {
      title: '加载中',
      mask: true
    } )
    this.setData( { id }, () => {
      this.queryPhoto()
    } )
    //监听图片修改
    this.eventsListener.photoEdit = app.events.on( 'photoEdit', ( { photo } ) => {
      console.log( '有图片修改：', photo )
      if ( this.data.id === photo.id ) {
        this.setData({
          timestamp: new Date().getTime(),
          ...this.data,
          ...photo,
          ...photo.photoSettings
        })
      }
    } )
  },
  onUnload () {
    //卸载监听函数
    for ( let i in this.eventsListener ) {
      app.events.remove( i, this.eventsListener[i] )
    }
  },

  queryPhoto () {
    photoApi.getPhotoDetailById( this.data.id ).then( res => {
      let { photoSettings, fileID, ...rest } = res
      imageApi.getImageByFileID( fileID ).then( res => {
        this.setData( {
          ...rest,
          ...photoSettings,
          fileID,
          imagePath: res
        } )
      } ).catch( err => {
        console.log( err )
        wx.showToast( {
          title: '加载失败',
          icon: 'none'
        } )
      } )

    } ).catch( err => {
      console.log( err )
      wx.showToast( {
        title: '加载失败',
        icon: 'none'
      } )
    } )
  },

  toEdit () {
    wx.showToast({
      title: '功能尚待完善',
      icon: 'none'
    })
    // wx.navigateTo( {
    //   url: `../edit/index?id=${this.data.id}`,
    // } );
  },

  saveLocal () {
    this.selectComponent( '#card' ).saveCardToPhotosAlbum()
  },

  deletePhoto () {
    wx.showModal( {
      title: '提示',
      content: '删除后无法恢复，确定删除吗？',
      success: res => {
        if ( res.confirm ) {
          console.log( '用户点击确定' )
          wx.showLoading( {
            title: '删除中',
            mask: true
          } )
          let { fileID, id } = this.data
          photoApi.deletePhoto( id ).then( res => {
            imageApi.deleteImageByFileID( fileID ).then( res => {
              wx.showToast( {
                title: '已删除',
                mask: true,
                duration: 1200,
                success: res => {
                  setTimeout( () => {
                    wx.navigateBack( {
                      delta: 1
                    } );
                  }, 1200 )
                },
                fail: err => {
                  wx.hideLoading();
                }
              } )
            } ).catch( err => {
              wx.hideLoading();
              console.error( '删除图片失败', err );
            } )
            app.emitDeletePhoto( { id } )
          } ).catch( err => {
            console.error( '删除失败', err );
            wx.showToast( {
              title: '删除失败',
              icon: 'none'
            } )
          } )
        } else if ( res.cancel ) {
          console.log( '用户点击取消' )
        }
      }
    } )
  }
} )