// miniprogram/pages/tabar/home/index.js
const app = getApp()
const genColor = require( '../../../utils/genColor' )

Page( {
  eventsListener: {},
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
    this.eventsListener.albumDelete = app.events.on( 'albumDelete', ( { id } ) => {
      console.log( '有相册删除：', id )
      let [{_id, ...data}, ...rest]  = this.data.albums
      this.setData( {
        albums: rest
      } )
    } )
    //监听相册添加
    this.eventsListener.albumAdd = app.events.on( 'albumAdd', ( { album } ) => {
      console.log( '有相册添加：', album )
      this.setData( {
        albums: [album, ...this.data.albums]
      } )
    } )
    //监听相册修改
    this.eventsListener.albumEdit = app.events.on( 'albumEdit', ( { album } ) => {
      console.log( '有相册修改：', album )
      let albums = this.data.albums.map( item => {
        if ( item._id === album._id ) {
          item = { ...item, ...album };
        }
        return item;
      } )
      this.setData( {
        albums: albums
      } )
    } )

    app.globalApi.albumApi.getAlbumsByUser( app.globalData.openid ).then( albums => {
      let fileList = []
      albums = albums.map( ( album, index ) => {
        fileList.push( { fileID: album.coverImage } )
        return { ...album, bgColor: genColor( index ) };
      } )
      this.setData( {
        albums
      } )
      app.globalApi.imageApi.getImagesByFileID( fileList ).then( res => {
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
  onUnload () {
    //卸载监听函数
    for ( let i in this.eventsListener ) {
      app.events.remove( i, this.eventsListener[i] )
    }
  },
  onShow() {
    this.setData({
      current: 0//解决动态数组更新，swiper current不匹配导致的不显示问题
    })
  },

  toCreate: function () {
    wx.navigateTo( {
      url: '../../photo/create/index',
    } );
  },

  toAlbum: function ( e ) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo( {
      url: `../../album/show/index?id=${id}`
    } )
  }

} )