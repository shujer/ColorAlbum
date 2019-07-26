// miniprogram/pages/photo/create/index.js
const imageApi = require( '../../../api/image' )
const photoApi = require( '../../../api/photo' )
const app = getApp()

Page( {

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
    ]
  },

  onShow () {
    let album = app.globalData.selectedAlbum;
    if ( !album ) {
      for ( let a in app.globalData.albums ) {
        album = app.globalData.albums[a];
        break;
      }
    }
    if ( album ) {
      this.setData( { album, hasAlbum: true } )
    } else {
      this.setData( { hasAlbum: false } )
    }
  },

  onLoad () {
    const systemInfo = wx.getSystemInfoSync();
    const width = systemInfo.windowWidth
    this.setData( {
      minHeight: 120 / 750 * width,
      maxHeight: 810 / 750 * width,
      width
    } )
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
            setTimeout( () => {
              this.selectComponent( '#card' ).startAnalyse()
            }, 1600 )
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
      duration: 1300,
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
    }, 1300 )
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
    console.log( e.detail.value )
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
    if ( !this.data.album ) {
      wx.showToast( { title: '请先选择相册', icon: 'none' } )
      return;
    }
    wx.showLoading( {
      title: '创建中',
      mask: true
    } );
    let {
      title,
      description,
      album: { _id: albumID },
      borderWidth,
      borderColor,
      num,
      colorCodeStyle,
      palettes } = this.data

    imageApi.uploadImage( this.data.imagePath ).then( res => {
      console.log( res )
      photoApi.addPhoto(
        {
          title,
          description,
          albumID,
          fileID: res.fileID,
          photoSettings: {
            borderWidth,
            borderColor,
            num,
            colorCodeStyle
          },
          palettes
        }
      ).then( res => {
        wx.hideLoading();
        setTimeout( () => {
          wx.showToast( {
            title: '创建成功',
            mask: true,
            duration: 1600,
            success: () => {
              wx.redirectTo( {
                url: `../show/index?id=${res._id}`
              } )
            }
          } )
        } )
      } ).catch( err => {
        wx.showToast( {
          title: '创建失败'
        } )
      } )
    } ).catch( err => {
      wx.showToast( {
        title: '创建失败'
      } )
    } )

  }
} )