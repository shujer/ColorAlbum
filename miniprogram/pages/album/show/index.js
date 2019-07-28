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
    photos: [],
    album: {},
    isLoading: true,
    hasLoaded: false,
    pageSize: 5,
    pageNum: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function ( options ) {
    //监听相册修改
    this.eventsListener.albumEdit = app.events.on( 'albumEdit', ( { album } ) => {
      console.log( '有相册修改：', album )
      if ( this.data.id === album._id ) {
        this.setData( {
          album: { ...this.data.album, ...album }
        } )
      }
    } )

    this.eventsListener.photoAdd = app.events.on( 'photoAdd', ( { photo } ) => {
      console.log( '有图片添加：', photo )
      if ( this.data.id === photo.album._id ) {
        this.setData( {
          photos: [photo, ...this.data.photos]
        } )
      }
    } )

    this.eventsListener.photoDelete = app.events.on( 'photoDelete', ( { id } ) => {
      console.log( '有图片删除：', id )
      let photos = this.data.photos.filter( photo => photo._id !== id );
      this.setData( {
        photos
      } )
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
        album
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
            isLoading: false,
            hasLoaded: true
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

  onReachBottom () {
    this.setData( {
      isLoading: true
    } )
    let num = this.data.photos.length;
    let date = num ? this.data.photos[num - 1].due : 0
    photoApi.getPhotosByAlbumID( app.globalData.openid, this.data.id, this.data.pageSize, date )
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
          imageApi.getImagesByFileID( fileList ).then( res => {
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

  toEdit: function () {
    wx.navigateTo( {
      url: `../../album/edit/index?id=${this.data.id}`,
    } );
  },

  toCreate: function () {
    app.globalData.selectedAlbum = this.data.album
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

  deleteAlbum: function () {
    wx.showModal( {
      title: '提示',
      content: '删除相册后，相册内所有图片也会删除且无法恢复！确定删除吗？（删除可能花费几秒钟，请耐心等待）',
      success: res => {
        if ( res.confirm ) {
          console.log( '用户点击确定' )
          wx.showLoading( {
            title: '删除中',
            mask: true
          } )
          photoApi.getFileIDsByAlbumID( app.globalData.openid, this.data.id ).then( photos => {
            let fileIDs = photos.map( photo => photo.fileID )
            let deletePhotos = Promise.resolve( photoApi.deletePhotosByAlbumID( this.data.id ) )
            let deleteAlbum = Promise.resolve( albumApi.deleteAlbum( this.data.id ) )
            let deleteImages = Promise.resolve( imageApi.deleteImagesByFileID( fileIDs ) )
            Promise.all([deleteAlbum, deletePhotos, deleteImages]).then(res => {
              console.log(res)
              wx.hideLoading()
              app.emitDeleteAlbum({id: this.data.id})
              wx.navigateBack({
                delta: 1
              })
            }).catch(err => {
              wx.showToast({
                title: '删除失败',
                icon: 'none'
              })
            })
          } )

        } else if ( res.cancel ) {
          console.log( '用户点击取消' )
        }
      }
    } )
  }
} )