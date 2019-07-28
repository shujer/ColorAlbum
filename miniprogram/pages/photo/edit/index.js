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
    autoAnalyse: false,
    album: {},
    hasAlbum: false
  },

  onLoad: function ( options ) {
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
          hasAlbum: true
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

  editPhoto () {
    if ( this.data.openStatus ) {
      this.hidePanel()
    } else {
      this.showPanel()
    }
  },

  showPanel ( e ) {
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
    if ( !this.data.autoAnalyse ) {
      this.setData( { autoAnalyse: true }, () => {
        this.setData( { [name]: e.detail.value } )
      } )
    } else {
      this.setData( { [name]: e.detail.value } )
    }
  },

  toAlbumSelect () {
    wx.navigateTo( {
      url: '../../album/select/index'
    } );
  },

  updatePhoto () {
    wx.showToast({
      title: '功能尚未完善',
      icon: 'none'
    })
    return;
    if ( !this.data.imagePath ) {
      wx.showToast( { title: '请先选择图片', icon: 'none' } )
      return;
    }
    if ( !this.data.album || !this.data.album._id ) {
      wx.showToast( { title: '请先选择相册', icon: 'none' } )
      return;
    }
    wx.showLoading( { title: '更新中' } )

    let photo = {
      id: this.data.id,
      title: this.data.title,
      description: this.data.description,
      album: this.data.album,
      photoSettings: {
        borderWidth: this.data.borderWidth,
        borderColor: this.data.borderColor,
        num: this.data.palettes.length,
        colorCodeStyle: this.data.colorCodeStyle
      },
      palettes: this.data.palettes,
      due: new Date()
    }
    photoApi.editPhoto( this.data.id, photo ).then( res => {
      console.log(res)
      app.emitEditPhoto( { photo } )
      wx.showToast( {
        title: '更新成功',
        success: res => {
          wx.navigateBack( {
            delta: 1
          } );
        }
      } )
    } ).catch( err => {
      wx.showToast( { title: '更新失败', icon: 'none' } )
    } )
  }
} )