// miniprogram/pages/photo/create/index.js
const imageApi = require( '../../../api/image' )
const photoApi = require( '../../../api/photo' )
const app = getApp()

Page( {
  eventsListener: {},

  /**
   * 页面的初始数据
   */
  data: {
    imagePath: null,
    title: '',
    description: '',
    borderWidth: 0,
    borderColor: '#fff',
    num: 10,
    colorCodeStyle: 'hex',
    palettes: [],
    hasAlbum: false,
    autoAnalyse: false,
    expended: false,
    colorTypes: [
      { value: 'hex', name: 'hex', checked: true },
      { value: 'rgb', name: 'rgb' },
      { value: 'gray', name: 'gray' }
    ]
  },

  onLoad ( options ) {
    let { id } = options;
    wx.showLoading( {
      title: '加载中',
      mask: true
    } )
    photoApi.getPhotoDetailById( id ).then( res => {
      let { photoSettings, fileID, ...rest } = res
      imageApi.getImageByFileID( fileID ).then( path => {
        this.setData( {
          ...rest,
          ...photoSettings,
          fileID,
          imagePath: path,
          id,
          hasAlbum: true,
          photo: res,
          prevAlum: res.album
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
    //监听相册选择
    this.eventsListener.albumSelect = app.events.on( 'albumSelect', ( { album } ) => {
      console.log( '有相册选择：', album )
      let prevAlum = this.data.album;
      this.setData( {
        album: album,
        hasAlbum: true,
        prevAlum
      } )
    } )

    const systemInfo = wx.getSystemInfoSync()
    const windowWidth = systemInfo.windowWidth;
    const windowHeight = systemInfo.windowHeight;
    this.setData( {
      windowWidth,
      windowHeight,
      tabWidth: ( 150 / 750 ) * windowWidth
    } )
  },

  onUnload () {
    //卸载监听函数
    for ( let i in this.eventsListener ) {
      app.events.remove( i, this.eventsListener[i] )
    }
  },

  changePanel ( e ) {
    if ( this.data.expended ) {
      this.hidePanel( e )
    } else {
      this.expendPanel( e )
    }
  },

  expendPanel ( e ) {
    let name = e.currentTarget.dataset.name;
    let index = e.currentTarget.dataset.index;
    var expendAnimation = wx.createAnimation( {
      duration: 300,
      timingFunction: "ease-in",
      delay: 0
    } );

    var tabAnimation = wx.createAnimation( {
      duration: 300,
      timingFunction: "ease-in",
      delay: 0
    } );
    this.expendAnimation = expendAnimation;
    this[`${name}Data`] = tabAnimation;
    expendAnimation.width( '750rpx' ).translateX( 0 ).step();
    this[`${name}Data`].width( '150rpx' ).step();
    this.setData( {
      animationData: expendAnimation.export(),
      [`${name}Data`]: this[`${name}Data`].export(),
      expended: true
    } )
    setTimeout( () => {
      expendAnimation.width( '1350rpx' ).translateX( - index * this.data.tabWidth ).step();
      tabAnimation.width( '750rpx' ).step();
      this.setData( {
        animationData: expendAnimation,
        [`${name}Data`]: tabAnimation
      } )
    }, 300 )
  },

  hidePanel ( e ) {
    let name = e.currentTarget.dataset.name;
    let index = e.currentTarget.dataset.index;
    var hideAnimation = wx.createAnimation( {
      duration: 300,
      timingFunction: "ease-in",
      delay: 0
    } );

    var tabAnimation = wx.createAnimation( {
      duration: 300,
      timingFunction: "ease-in",
      delay: 0
    } );
    this.hideAnimation = hideAnimation;
    this[`${name}Data`] = tabAnimation;
    hideAnimation.width( '1350rpx' ).translateX( -index * this.data.tabWidth ).step();
    this[`${name}Data`].width( '750rpx' ).step();
    this.setData( {
      animationData: hideAnimation.export(),
      [`${name}Data`]: this[`${name}Data`].export(),
      expended: false
    } )
    setTimeout( () => {
      hideAnimation.width( '750rpx' ).translateX( 0 ).step();
      this[`${name}Data`].width( '150rpx' ).step();
      this.setData( {
        animationData: hideAnimation,
        [`${name}Data`]: this[`${name}Data`]
      } )
    }, 300 )
  },

  generatePalettes () {
    this.selectComponent( '#card' ).startAnalyse()
  },

  chooseImage: function () {
    imageApi.chooseImage().then( res => {
      wx.showToast( {
        title: '选择成功',
        icon: 'success',
        success: ( result ) => {
          this.setData( {
            imagePath: res
          } )
        }
      } );
    } ).catch( err => {
      console.error( '选择图片失败', err );
      wx.showToast( {
        title: '选择失败',
        icon: 'none'
      } )
    } )
  },


  setField ( e ) {
    let name = e.currentTarget.dataset.name;
    console.log( e )
    this.setData( { autoAnalyse: true, [name]: e.detail.value } )
  },

  toAlbumSelect () {
    wx.navigateTo( {
      url: '../../album/select/index'
    } );
  },

  editPhoto () {
    if ( !this.data.album || !this.data.album._id ) {
      wx.showToast( { title: '请先选择相册', icon: 'none' } )
      return;
    }
    wx.showLoading( {
      title: '更新中',
      mask: true
    } );
    //
    let photo = {
      title: this.data.title,
      description: this.data.description,
      album: this.data.album,
      photoSettings: {
        borderWidth: this.data.borderWidth,
        borderColor: this.data.borderColor,
        num: this.data.num,
        colorCodeStyle: this.data.colorCodeStyle
      },
      palettes: this.data.palettes,
      due: new Date()
    }
    photoApi.editPhoto( this.data.id, photo ).then( res => {
      let { prevAlum, album } = this.data;
      if ( prevAlum._id !== album._id ) {
        app.emitSwitchAlbum( { prevAlum, curAlbum: album, photo: { _id: this.data.id, ...photo } } );
      }
      app.emitEditPhoto( { photo: { _id: this.data.id, ...photo } } );
      wx.showToast( {
        title: '更新成功',
        icon: 'none',
        success: res => {
          setTimeout( () => {
            wx.navigateBack( {
              delta: 2
            } );
          }, 1200 );
        }
      } )
    } ).catch( err => {
      wx.showToast( {
        title: '更新失败',
        icon: 'none'
      } )
    } )
  }
} )