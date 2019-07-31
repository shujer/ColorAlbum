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
    expended: false,
    colorTypes: [
      { value: 'hex', name: 'hex', checked: true },
      { value: 'rgb', name: 'rgb' },
      { value: 'gray', name: 'gray' }
    ]
  },

  onLoad ( options ) {
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
    this.setData( { [name]: e.detail.value } )
  },

  editPhoto () {
    wx.showToast( {
      title: '请先登录',
      icon: 'none'
    } );
  }
} )