// components/colorcard/index.js
const getImageFillInfo = require( '../../utils/getImageFillInfo' )
const colorThief = require( '../../utils/colorplugin/colorthief' )

Component( {
  /**
   * 组件的属性列表
   */
  properties: {
    // 图片临时路径
    imagePath: {
      type: String,
      value: null,
      observer: function ( newImagePath ) {
        if ( !newImagePath ) return;
        wx.getImageInfo( {
          src: newImagePath,
          success: info => {

            this.setData( { info, palettes: [] }, () => this.draw() )

          },
          fail: err => {
            console.log( '获取图片信息失败', err )
          }
        } )
      }
    },
    //色块颜色
    palettes: {
      type: Array,
      value: [],
      observer: function () {
        if ( !this.data.imagePath ) {
          return;
        } else {
          this.draw()
        }
      }
    },
    paletteHeight: {
      type: Number,
      value: 30
    },
    // 色块显示数目
    num: {
      type: Number,
      value: 10,
      observer: function () {
        if ( !this.data.imagePath ) {
          return;
        } else {
          this.startAnalyse().then( res => {
            this.draw();
          } ).catch( err => {
            console.error( err )
          } )
        }
      }
    },
    //轮廓宽度
    borderWidth: {
      type: Number, // 0 - 325
      value: 0,
      observer: function () {
        if ( !this.data.imagePath ) {
          return;
        } else {
          wx.nextTick( () => {
            this.draw();
          } )
        }
      }
    },
    //轮廓颜色
    borderColor: {
      type: String,
      value: '#fff'//'rgba(0, 0, 0, 0)'
    },
    // 图片填充方式
    imageFillStyle: {
      type: String,
      value: 'original'
    },
    // 颜色代码显示方式
    colorCodeStyle: {
      type: String,
      value: 'hex',
      observer: function () {
        if ( !this.data.imagePath ) {
          return;
        } else {
          this.startAnalyse().then( res => {
            this.draw();
          } ).catch( err => {
            console.error( err )
          } )
        }
      }
    },
    // 是否显示颜色代码详情/文字
    showColorCode: {
      type: Boolean,
      value: false
    },
    // 颜色代码排版
    colorCodeLayout: {
      type: String,
      value: 'one'//two, three
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    width: 750, // 画布大小
    height: 800, // 画布大小,
    showToolTip: false
  },

  lifetimes: {
    ready: function () {
      const systemInfo = wx.getSystemInfoSync()
      const windowWidth = systemInfo.windowWidth;
      const windowHeight = systemInfo.windowHeight;
      this.setData( {
        windowWidth,
        windowHeight,
        width: windowWidth,//px 
        height: windowHeight//px
      } )
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    draw () {
      if ( !this.data.imagePath ) {
        return;
      }
      wx.showLoading( {
        title: '绘制中',
        mask: true
      } )

      const ctx = wx.createCanvasContext( 'myCanvas', this )
      let Width = this.data.width;
      let paletteHeight = this.data.paletteHeight;
      let borderWidth = Number( this.data.borderWidth );
      let Height = this.data.info.height / ( this.data.info.width / ( Width - 2 * borderWidth ) ) + 3 * borderWidth + paletteHeight
      ctx.clearRect( 0, 0, Width, Height + paletteHeight );

      // draw background color 
      ctx.setFillStyle( this.data.borderColor );
      ctx.fillRect( 0, 0, Width, Height );

      // draw image 
      if ( this.data.imagePath ) {
        let { dx, dy, dw, dh, sx, sy, sw, sh } =
          getImageFillInfo( this.data.imageFillStyle, this.data.info, borderWidth, borderWidth, this.data.windowWidth - 2 * borderWidth, this.data.windowHeight - paletteHeight - borderWidth );
        ctx.drawImage( this.data.imagePath, sx, sy, sw, sh, dx, dy, dw, dh )
      }

      // draw palettes 
      const num = this.data.num;
      const paletteWidth = ( Width - borderWidth * ( num + 1 ) ) / num;
      const offsetHeight = Height - borderWidth - paletteHeight;
      if ( this.data.palettes.length >= this.data.num ) {
        for ( let i = 0; i < num; i++ ) {
          let offsetLeft = borderWidth * ( i + 1 ) + i * paletteWidth;
          ctx.setFillStyle( this.data.palettes[i] )
          ctx.fillRect(
            offsetLeft,
            offsetHeight,
            paletteWidth,
            paletteHeight
          )
        }
      }
      this.setData( {
        height: Height,
        paletteWidth
      }, () => {
        ctx.draw( false, () => {
          wx.showToast( {
            title: '绘制成功',
            icon: 'success'
          } );
        } );
      } )
    },

    setImagePath ( imagePath ) {
      wx.getImageInfo( {
        src: imagePath,
        success: info => {
          this.setData( { info, palettes: [] }, () => this.draw() )
          resolve()
        },
        fail: err => {
          reject( err )
        }
      } )
    },

    setPalettes ( palettes ) {
      this.setData( { palettes }, () => this.draw() )
    },

    getColorByType ( imagedata ) {
      switch ( this.data.colorCodeStyle ) {
        case 'rgb':
          return colorThief( imagedata ).palette( this.data.num + 1 ).get().map( arr => `rgb(${arr[0]}, ${arr[1]}, ${arr[2]})` )
        case 'hex':
          return colorThief( imagedata ).palette( this.data.num + 1 ).getHex()
        case 'gray':
          return colorThief( imagedata ).palette( this.data.num + 1 ).getGray().map( gray => `rgb(${parseInt( gray )}, ${parseInt( gray )}, ${parseInt( gray )})` )
        default:
          return colorThief( imagedata ).palette( this.data.num + 1 ).getHex()
      }
    },

    startAnalyse () {
      if ( !this.data.imagePath ) return;
      return new Promise( ( resolve, reject ) => {
        wx.showLoading( {
          title: '分析中',
          mask: true
        } )
        const Width = this.data.width;
        const Height = this.data.height;
        const paletteHeight = ( this.data.paletteHeight / 750 ) * this.data.windowWidth;
        const borderWidth = ( this.data.borderWidth / 750 ) * this.data.windowWidth;
        wx.canvasGetImageData( {
          canvasId: 'myCanvas',
          x: borderWidth,
          y: borderWidth,
          width: Width - 2 * borderWidth,
          height: Height - 3 * borderWidth - paletteHeight,
          success: res => {
            let palettes = this.getColorByType( res.data )
            this.triggerEvent( 'setPalettes', { value: palettes } )
            this.setData( { palettes }, () => {
              resolve( palettes )
            } )
          },
          fail: err => {
            wx.hideLoading()
            console.error( err )
            reject( err )
          },
          complete () {
            wx.hideLoading()
          }
        }, this )
      } )
    },

    saveCardToPhotosAlbum () {
      wx.showLoading( {
        title: '卡片生成中'
      } )
      wx.canvasToTempFilePath( {
        width: this.data.width,
        height: this.data.height,
        canvasId: 'myCanvas',
        success ( res ) {
          this.tempFilePath = res.tempFilePath
          wx.getSetting( {
            success: res => {
              if ( !res.authSetting['scope.writePhotosAlbum'] ) {
                wx.authorize( {
                  scope: 'scope.writePhotosAlbum',
                  success: () => {
                    // 用户已经同意小程序使用保存到相册功能
                    wx.saveImageToPhotosAlbum( {
                      filePath: this.tempFilePath,
                      success: () => {
                        wx.hideLoading()
                      },
                      fail: err => {
                        wx.hideLoading()
                        console.error( err )
                      }
                    } )
                  },
                  fail: err => {
                    wx.hideLoading()
                    console.error( err )
                  }
                } )
              } else {
                wx.saveImageToPhotosAlbum( {
                  filePath: this.tempFilePath,
                  success: () => {
                    wx.hideLoading()
                  },
                  fail: err => {
                    wx.hideLoading()
                    console.error( err )
                  }
                } )
              }
            }
          } )
        },
        fail: err => {
          console.error( err )
          wx.hideLoading();
        }
      }, this )
    },
      /**
   * 显示颜色代码提示
   * @param {event} e 
   */
    tooltipShow ( e ) {
      if ( !e ) return
      let color = e.currentTarget.dataset.color.toUpperCase()
      this.setData( {
        color,
        showToolTip: true,
      } )
    },
    /**
     * 隐藏颜色代码提示
     */
    tooltipHide () {
      this.setData( {
        showToolTip: false,
      } )
    },
  }
} )
