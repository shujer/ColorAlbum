// miniprogram/pages/tabar/my/index.js
const app = getApp()
const { transferObjToArray } = require( '../../../utils/transfer' )
const genColor = require( '../../../utils/genColor' )
const imageApi = require( '../../../api/image' )
const photoApi = require( '../../../api/photo' )
const albumApi = require( '../../../api/album' )

Page( {

  /**
   * 页面的初始数据
   */
  data: {
    indicatorDots: true,
    indicatorActiveColor: '#FBE864',
    indicatorColor: '#9F8BE5',
    albums: [],
    photos: [],
    hasNext: true,
    pageNum: 0,
    pageSize: 10
  },
  onLoad: function ( options ) {
    this.queryPhotos();
    this.queryAlbums();
  },

  onPullDownRefresh () {
    this.setData( {
      pageNum: 0
    }, () => {
      this.queryPhotos();
    } )
    this.queryAlbums();
  },

  onReachBottom () {
    this.queryPhotos();
    this.queryAlbums();
  },

  queryPhotos () {
    wx.showLoading( {
      title: '加载中',
      mask: true
    } );
    let skip = this.data.pageNum * this.data.pageSize
    photoApi.getPhotosByUser( app.globalData.openid, skip )
      .then( photos => {
        let fileList = []
        photos = photos.map( ( photo, index ) => {
          fileList.push( {fileID: photo.fileID })
          return { ...photo, color: genColor( index ) };
        } )
        let tempList = this.data.photos
        if ( photos.length === 0 ) {
          wx.showToast( {
            title: '没有更多数据',
            icon: 'none'
          } )
        }
        this.setData( {
          photos: skip ? [...tempList, ...photos] : photos,
          pageNum: this.data.pageNum + 1
        }, () => {
          wx.hideLoading()
        } )
        imageApi.getImageByFileID( fileList ).then( res => {
          photos = photos.map( ( photo, index ) => {
            photo.tempFileURL = res[index].tempFileURL
            return photo;
          } )
          this.setData( {
            photos: skip ? [...tempList, ...photos] : photos
          } )
        } ).catch( err => {
          wx.hideLoading()
          console.error( '照片封面获取失败', err );
        } )
      } ).catch( err => {
        wx.hideLoading()
        console.error( '照片封面获取失败', err );
      } )
  },

  queryAlbums () {
    albumApi.getAlbumsByUser( app.globalData.openid ).then( albums => {
      let fileList = []
      albums = albums.map( ( album, index ) => {
        fileList.push( album.coverImage )
        return { ...album, color: genColor( index ) };
      } )
      this.setData( {
        albums
      } )
      imageApi.getImageByFileID( fileList ).then( res => {
        albums = albums.map( ( album, index ) => {
          album.coverImageURL = res[index].tempFileURL
          return album;
        } )
        this.setData( {
          albums
        } )
      } ).catch( err => {
        console.log( '相册封面获取失败', err );
      } )
    } )
  },

  toCreate: function () {
    wx.navigateTo( {
      url: '../../photo/create/index',
    } );
  },

  toPhoto: function (e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `../../photo/show/index?id=${id}`
    })
  },

  toAlbum: function(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `../../album/show/index?id=${id}`
    })
  }

} )