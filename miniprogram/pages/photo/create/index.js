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
    showPanel: false,
    openStatus: false,
    title: '',
    description: '',
    borderWidth: 0,
    borderColor: '#fff',
    num: 10,
    colorCodeStyle: 'hex',
    palettes: [],
    radios: [
      { name: 'hex', value: 'hex' },
      { name: 'rgb', value: 'rgb' },
      { name: 'gray', value: 'gray' }
    ],
    hasAlbum: false
  },

  onLoad () {
    const systemInfo = wx.getSystemInfoSync();
    const width = systemInfo.windowWidth
    this.setData( {
      minHeight: 120 / 750 * width,
      maxHeight: 810 / 750 * width,
      width
    } )

    //监听相册选择
    this.eventsListener.albumSelect = app.events.on( 'albumSelect', ( { album } ) => {
      console.log( '有相册选择：', album )
      this.setData( {
        album: album,
        hasAlbum: true
      } )
    } )
  },

  onUnload () {
    //卸载监听函数
    for ( let i in this.eventsListener ) {
      app.events.remove( i, this.eventsListener[i] )
    }
  },

  generatePalettes () {
    this.hidePanel();
    this.selectComponent( '#card' ).startAnalyse()
  },

  chooseImage: function () {
    if ( this.data.openStatus ) {
      this.hidePanel();
    }
    imageApi.chooseImage().then( res => {
      wx.showToast( {
        title: '选择成功',
        icon: 'success',
        success: ( result ) => {
          this.setData( {
            imagePath: res,
            showPanel: true
          }, () => {
            this.createBtnFade()
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

  editPhoto () {
    if ( this.data.openStatus ) {
      this.hidePanel()
    } else {
      this.showPanel()
    }
  },

  createBtnFade () {
    var animation = wx.createAnimation( {
      duration: 1200,
      timingFunction: "ease-in",
      delay: 0
    } );
    this.animation = animation;
    animation.opacity( 0 ).step();
    this.setData( {
      animationData: animation.export()
    } )
    setTimeout( () => {
      animation.opacity( 1 ).step();
      this.setData( {
        animationData: animation
      } )
    }, 1000 )
  },

  showPanel ( e ) {
    if ( !this.data.showPanel ) return;
    var animation = wx.createAnimation( {
      duration: 250,
      timingFunction: "ease-out",
      delay: 0
    } );
    // 第一组动画
    this.animation = animation;
    animation.translateY( this.data.maxHeight ).step();
    this.setData( {
      animationData: animation.export()
    } )
    // 第二组动画
    setTimeout( () => {
      animation.translateY( this.data.minHeight ).step()
      this.setData( {
        animationData: animation,
        openStatus: true
      } )
    }, 200 )
  },

  hidePanel () {
    if ( !this.data.showPanel ) return;
    var animation = wx.createAnimation( {
      duration: 250,
      timingFunction: "ease-out",
      delay: 0
    } );
    // 第一组动画
    this.animation = animation;
    animation.translateY( this.data.minHeight ).step();
    this.setData( {
      animationData: animation.export()
    } )
    // 第二组动画
    setTimeout( () => {
      animation.translateY( this.data.maxHeight ).step()
      this.setData( {
        animationData: animation,
        openStatus: false
      } )
    }, 200 )
  },

  setField ( e ) {
    let name = e.currentTarget.dataset.name;
    this.setData( { [name]: e.detail.value } )
  },

  toAlbumSelect () {
    wx.navigateTo( {
      url: '../../album/select/index'
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
    imageApi.uploadImage( this.data.imagePath ).then( res => {
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
      photoApi.addPhoto( photo ).then( res => {
        app.emitAddPhoto( { photo: { ...photo, _id: res._id, tempFileURL: this.data.imagePath } } )
        wx.hideLoading();
        wx.showToast( {
          title: '创建成功',
          mask: true,
          duration: 1200,
          success: () => {
            setTimeout( () => {
              wx.redirectTo( {
                url: `../show/index?id=${res._id}`
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