// miniprogram/pages/album/show/index.js
const app = getApp()
const genColor = require( '../../../utils/genColor' )
const imageApi = require( '../../../api/image' )
const photoApi = require( '../../../api/photo' )
const albumApi = require( '../../../api/album' )

Page( {
  eventsListener: {},
  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    pageSize: 10,
    pageNum: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function ( options ) {
    //监听相册修改
    this.eventsListener.albumAdd = app.events.on( 'albumEdit', ( { album } ) => {
      console.log( '有相册修改：', album )
      if ( this.data.id === album._id ) {
        this.setData( {
          ...this.data,
          ...album
        } )
      }
    } )

    // 初始化
    let { id } = options;
    if ( !id ) {
      wx.navigateBack( {
        delta: 1
      } )
    }
    wx.showLoading( {
      title: '加载中'
    } )
    albumApi.getAlbumDetailById( id ).then( album => {
      this.setData( {
        id,
        ...album
      }, () => {
        this.queryPhotos()
      } )
      wx.setNavigationBarTitle( {
        title: album.title
      } )
      if ( album.coverImage !== 'none' ) {
        imageApi.getImageByFileID( album.coverImage ).then( res => {
          this.setData( {
            imagePath: res
          } )
        } )
      }
      wx.hideLoading();
    } ).catch( err => {
      wx.showToast( {
        title: '加载失败',
        icon: 'none'
      } )
    } )
  },
  onUnload () {
    //卸载监听函数
    for ( let i in this.eventsListener ) {
      app.events.remove( i, this.eventsListener[i] )
    }
  },

  queryPhotos () {
    this.setData( {
      isLoading: true
    } )
    photoApi.getPhotosByAlbumID( app.globalData.openid, this.data.id, this.data.pageSize, new Date() )
      .then( photos => {
        let fileList = []
        photos = photos.map( ( photo, index ) => {
          fileList.push( { fileID: photo.fileID } )
          return { ...photo, bgColor: genColor( index ) };
        } )
        this.setData( {
          photos: photos,
          pageNum: this.data.pageNum + 1
        } )
        setTimeout( () => {
          this.setData( {
            isLoading: false
          } )
        }, 300 )
        imageApi.getImagesByFileID( fileList ).then( res => {
          photos = photos.map( ( photo, index ) => {
            photo.tempFileURL = res[index].tempFileURL
            return photo;
          } )
          this.setData( {
            photos: photos
          } )
        } ).catch( err => {
          console.error( '照片封面获取失败', err );
        } )
      } ).catch( err => {
        console.error( '照片封面获取失败', err );
      } )
  },
} )