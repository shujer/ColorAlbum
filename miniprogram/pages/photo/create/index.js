// miniprogram/pages/photo/create/index.js
const imageApi = require( '../../../api/image' )

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
    colorCodeStyle: 'hex'
  },

  onLoad () {
    const systemInfo = wx.getSystemInfoSync();
    const width = systemInfo.windowWidth
    this.setData( {
      minHeight: 120 / 750 * width,
      maxHeight: 780 / 750 * width,
      width
    } )
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
            }, 1500 )
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
    animation.opacity(0).step();
    this.setData( {
      animationData: animation.export()
    } )
    setTimeout( () => {
      animation.opacity(1).step();
      this.setData( {
        animationData: animation
      } )
    }, 1300 )
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
    console.log( e.detail.value )
    this.setData( { [name]: e.detail.value } )
  },
} )