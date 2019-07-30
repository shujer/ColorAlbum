// miniprogram/pages/photo/create/index.js
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

  onLoad () {
    //监听相册选择
    this.eventsListener.albumSelect = app.events.on( 'albumSelect', ( { album } ) => {
      console.log( '有相册选择：', album )
      this.setData( {
        album: album,
        hasAlbum: true
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

    if ( !app.globalData.tempPhoto ) {
      wx.navigateBack( {
        delta: 1
      } );
    } else {
      this.setData( {
        ...this.data,
        ...app.globalData.tempPhoto
      } )
    }
  },

  onUnload () {
    let { "__webviewId__": num, ...tempPhoto } = this.data
    app.globalData.tempPhoto = tempPhoto;
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
    app.globalApi.imageApi.chooseImage().then( res => {
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
    this.setData( { autoAnalyse: true, [name]: e.detail.value } )
  },

  toAlbumSelect () {
    wx.navigateTo( {
      url: '../../../album/select/index'
    } );
  },

  savePhoto () {
    if ( !this.data.imagePath ) {
      wx.showToast( { title: '请先选择图片', icon: 'none' } )
      return;
    }
    if ( !this.data.album || !this.data.album._id ) {
      wx.showToast( { title: '请先选择相册', icon: 'none' } )
      return;
    }
    wx.showLoading( {
      title: '创建中',
      mask: true
    } );
    app.globalApi.imageApi.uploadImage( this.data.imagePath ).then( res => {
      let photo = {
        title: this.data.title,
        description: this.data.description,
        album: this.data.album,
        fileID: res.fileID,
        photoSettings: {
          borderWidth: this.data.borderWidth,
          borderColor: this.data.borderColor,
          num: this.data.num,
          colorCodeStyle: this.data.colorCodeStyle
        },
        palettes: this.data.palettes,
        due: new Date()
      }
      app.globalApi.photoApi.addPhoto( photo ).then( res => {
        app.emitAddPhoto( { photo: { ...photo, _id: res._id, tempFileURL: this.data.imagePath } } )
        wx.hideLoading();
        wx.showToast( {
          title: '创建成功',
          mask: true,
          duration: 1200,
          success: () => {
            setTimeout( () => {
              wx.redirectTo( {
                url: `../../show/index?id=${res._id}`
              } )
            }, 1200 )
          }
        } )

      } ).catch( err => {
        console.error( '创建失败', err )
        wx.showToast( {
          title: '创建失败'
        } )
      } )
    } ).catch( err => {
      console.error( '创建失败', err )
      wx.showToast( {
        title: '创建失败'
      } )
    } )

  }
} )