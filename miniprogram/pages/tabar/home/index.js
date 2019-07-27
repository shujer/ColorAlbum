// miniprogram/pages/tabar/home/index.js
const app = getApp()
const genColor = require( '../../../utils/genColor' )
const imageApi = require( '../../../api/image' )
const albumApi = require( '../../../api/album' )

Page( {

  /**
   * 页面的初始数据
   */
  data: {
    albums: [],
    animationClass: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function ( options ) {
    albumApi.getAlbumsByUser( app.globalData.openid ).then( albums => {
      let fileList = []
      albums = albums.map( ( album, index ) => {
        fileList.push( album.coverImage )
        return { ...album, color: genColor( index ) };
      } )
      this.setData( {
        albums
      } )
      imageApi.getImagesByFileID( fileList ).then( res => {
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
    // this.setData( {
    //   animationClass: 'chevron-leave-active'
    // }, () => {
    //   setTimeout( () => {
    //     wx.navigateTo( {
    //       url: '../../photo/create/index',
    //     } );
    //   }, 500 );
    // } )
  },

  toAlbum: function () {
    wx.navigateTo( {
      url: '../../album/show/index',
    } );
    // this.setData( {
    //   animationClass: 'chevron-leave-active'
    // }, () => {
    //   setTimeout( () => {
    //     wx.navigateTo( {
    //       url: '../../album/show/index',
    //     } );
    //   }, 800 );
    // } )
  },

  onShow () {
    this.setData( {
      animationClass: ''
    } )
  }

} )