// miniprogram/pages/album/select/index.js
const app = getApp()
const genColor = require( '../../../utils/genColor' )
const imageApi = require( '../../../api/image' )
const albumApi = require( '../../../api/album' )

Page( {

  /**
   * 页面的初始数据
   */
  data: {
    albums: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function ( options ) {
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

  selectAlbum(e) {
    let index = e.currentTarget.dataset.index;
    app.globalData.selectedAlbum = this.data.albums[index]
    wx.navigateBack({
      delta: 1
    });  
  },

  toAlbumCreate() {
    wx.navigateTo({
      url: '../create/index',
    });
      
  }
} )