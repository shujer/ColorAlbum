// miniprogram/pages/tabar/my/index.js
const app = getApp()
const genColor = require( '../../../utils/genColor' )

Page( {
  eventsListener: {},

  /**
   * 页面的初始数据
   */
  data: {
    indicatorDots: true,
    indicatorActiveColor: '#FBE864',
    indicatorColor: '#9F8BE5',
    albums: [],
    photos: [],
    pageNum: 0,
    pageSize: 10,
    isLoading: false
  },
  onLoad: function ( options ) {

    //监听图片删除
    this.eventsListener.photoDelete = app.events.on( 'photoDelete', ( { id } ) => {
      console.log( '有图片删除：', id )
      let photos = this.data.photos.filter( photo => photo._id !== id );
      this.setData( {
        photos
      } )
    } )
    //监听图片添加
    this.eventsListener.photoAdd = app.events.on( 'photoAdd', ( { photo } ) => {
      console.log( '有图片添加：', photo )
      this.setData( {
        photos: [photo, ...this.data.photos]
      } )
    } )
    this.eventsListener.albumDelete = app.events.on( 'albumDelete', ( { id } ) => {
      console.log( '有相册删除：', id )
      let albums = this.data.albums.filter( album => album._id !== id );
      let photos = this.data.photos.filter( photo => photo.album._id !== id)
      this.setData( {
        albums,
        photos
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
      let albums = this.data.albums.map(item => {
        if(item._id === album._id) {
          item = {...item, ...album};
        }
        return item;
      })
      this.setData( {
        albums: albums
      } )
    } )
    this.queryPhotos();
    this.queryAlbums();
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

  onPullDownRefresh () {
    this.setData( {
      pageNum: 0
    }, () => {
      this.queryPhotos();
    } )
    this.queryAlbums();
  },

  onReachBottom () {
    this.setData( {
      isLoading: true
    } )
    let num = this.data.photos.length;
    let date = num ? this.data.photos[num - 1].due : 0
    app.globalApi.photoApi.getPhotosByTime( app.globalData.openid, this.data.pageSize, date )
      .then( photos => {
        let fileList = []
        photos = photos.map( ( photo, index ) => {
          fileList.push( { fileID: photo.fileID } )
          return { ...photo, bgColor: genColor( index ) };
        } )
        let tempList = this.data.photos
        if ( photos.length === 0 ) {
          setTimeout( () => {
            this.setData( {
              isLoading: false
            } )
          }, 500 );
        } else {
          this.setData( {
            photos: [...tempList, ...photos],
            pageNum: this.data.pageNum + 1
          } );
          app.globalApi.imageApi.getImagesByFileID( fileList ).then( res => {
            photos = photos.map( ( photo, index ) => {
              photo.tempFileURL = res[index].tempFileURL
              return photo;
            } )
            this.setData( {
              photos: [...tempList, ...photos],
              isLoading: false
            } )
          } ).catch( err => {
            this.setData( {
              isLoading: false
            } )
            console.error( '照片封面获取失败', err );
          } )
        }
      } ).catch( err => {
        setTimeout( () => {
          this.setData( {
            isLoading: false
          } )
        }, 500 );
        console.error( '照片封面获取失败', err );
      } )
  },

  queryPhotos () {
    wx.showLoading( {
      title: '加载中',
      mask: true
    } );
    app.globalApi.photoApi.getPhotosByTime( app.globalData.openid, this.data.pageSize, new Date() )
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
          wx.hideLoading()
        }, 300 )
        app.globalApi.imageApi.getImagesByFileID( fileList ).then( res => {
          photos = photos.map( ( photo, index ) => {
            photo.tempFileURL = res[index].tempFileURL
            return photo;
          } )
          this.setData( {
            photos: photos
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

  toCreate: function () {
    wx.navigateTo( {
      url: '../../photo/create/index',
    } );
  },

  toPhoto: function ( e ) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo( {
      url: `../../photo/show/index?id=${id}`
    } )
  },

  toAlbum: function ( e ) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo( {
      url: `../../album/show/index?id=${id}`
    } )
  }
} )